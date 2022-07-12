import { Response } from "express";
import { v4 as uuid } from "uuid";
import fs from "fs-extra";
import path from "path";
import schedule from "node-schedule";
import moment from "moment";
import chalk from "chalk";
import ConfigService from "../ConfigService/ConfigService";
import MergerNotFoundFault from "../../errors/MergerNotFoundFault";
import DatabaseService from "../DatabaseService/DatabaseService";
import MergerModel, { MergerFile } from "../DatabaseService/Models/MergerModel";
import { DIR_OUTPUTS, DIR_INPUTS, DB_MERGERS } from "../../config/constants";
import MergeFault from "../../errors/MergeFault";
import execAsync from "../../utils/execAsync";
import ffmpegDate from "../../utils/ffmpegDate";
import MergerAlreadyExistsFault from "../../errors/MergerAlreadyExistsFault";
import MergerMaxFileSizeFault from "../../errors/MergerMaxFileSizeFault";
import MergerMaxFileCountFault from "../../errors/MergerMaxFileCountFault";
import Fault from "../../errors/Fault";
import AddFilesFault from "../../errors/AddFilesFault";
import Database from "../DatabaseService/Database/Database";
import Service from "../Service/Service";
import MergerEmptyFault from "../../errors/MergerEmptyFault";

const config = ConfigService.getConfig();
const orange = chalk.keyword("orange");

const BtoM = (b: number) => (b / 1024 / 1024).toFixed(2);

class MergerService extends Service {
    // eslint-disable-next-line no-use-before-define
    private static serviceInstance: MergerService;

    private db!: Database<MergerModel>;

    private constructor() {
        super("Merger Service");
        DatabaseService.onReady(() => {
            this.db = DatabaseService.getDatabase(
                DB_MERGERS,
                MergerModel.fromJSON
            );
            this.notifyReady();
        }).onError((error) => {
            this.notifyError(error);
        });
    }

    public static get instance(): MergerService {
        if (!MergerService.serviceInstance) {
            MergerService.serviceInstance = new MergerService();
        }
        return MergerService.serviceInstance;
    }

    public async create(): Promise<string> {
        const merger = await this.db.create(new MergerModel());

        if (!merger) throw new MergerAlreadyExistsFault();

        schedule.scheduleJob(
            this.getMergerScheduleId(merger.id),
            moment().add(config.cleanupMergersDelay, "ms").toDate(),
            () => this.deleteMerger(merger.id)
        );

        this.log(`merge ${merger.id}: ${orange("Created")}`);

        return merger.id;
    }

    public async append(mergerId: string, ...files: Express.Multer.File[]) {
        const merger = await this.db.get(mergerId);
        let err: any | null = null;

        if (!merger) throw new MergerNotFoundFault();

        try {
            for await (const file of files) {
                const remainingSize = merger.getRemainingSize();
                const remainingCount = merger.getRemainingFilesCount();

                if (remainingCount < 1) {
                    throw new MergerMaxFileCountFault();
                }
                if (remainingSize < file.size) {
                    throw new MergerMaxFileSizeFault();
                }

                const intermediateFile = await this.createIntermediateFile(
                    file.path,
                    remainingSize
                );

                // Recheck max file size and delete the intermediate file if it's too big.
                // We use <= instead of <, because FFMPEG only LIMITS the size of the file, it does not throw an error if it is bigger.
                // If the intermediate file size is the same as the remaining size, it most likely means the file was too big.
                if (remainingSize <= intermediateFile.size) {
                    await fs.remove(intermediateFile.path);
                    throw new MergerMaxFileSizeFault();
                }

                await merger.addFiles(intermediateFile);
                this.log(
                    `merge ${merger.id}: Added ${orange(
                        intermediateFile.path
                    )} (${orange(BtoM(intermediateFile.size))} MB)`
                );
            }
        } catch (e) {
            if (e instanceof Fault) {
                err = e;
            } else {
                err = new AddFilesFault();
            }
        }

        await Promise.all(files.map((f) => fs.remove(f.path)));
        await this.db.update(merger.id, merger);

        if (err) {
            throw err;
        }
    }

    public async sendMergedFile(
        mergerId: string,
        res: Response,
        creationDate = new Date(),
        mergeIfNotExists = true
    ): Promise<void> {
        const merger = await this.db.get(mergerId);
        if (!merger) {
            throw new MergerNotFoundFault();
        }

        const output = merger.getOutput();
        if (!output) {
            if (!mergeIfNotExists) {
                this.err(
                    `merge ${merger.id}: No output file found after merging.`
                );
                throw new MergeFault();
            }
            await this.merge(mergerId, creationDate);
            return this.sendMergedFile(mergerId, res, creationDate, false);
        }

        return res.sendFile(output.path, (err) => {
            if (err) {
                throw new MergeFault();
            }
            this.log(`merge ${merger.id}: Sent ${orange(output.path)}`);
            if (config.cleanAfterMerge) {
                this.deleteMerger(mergerId);
            }
        });
    }

    private async merge(
        mergerId: string,
        creationDate: Date = new Date()
    ): Promise<void> {
        const merger = await this.db.get(mergerId);
        if (!merger) {
            throw new MergerNotFoundFault();
        }

        const existingOutput = merger.getOutput();
        if (existingOutput) return;

        const files = merger.getFiles();
        let outputFile: MergerFile | null = null;

        if (!files.length) {
            throw new MergerEmptyFault();
        }

        try {
            this.log(
                `merge ${merger.id}: Merging ${orange(files.length)} files`
            );
            outputFile = await this.createMergedFile(
                files.map((f) => f.path),
                creationDate
            );
        } catch (err) {
            if (err instanceof Error) {
                this.err(chalk.red(err.message));
                this.err(chalk.red(err.stack));
            }
        }

        if (!outputFile) {
            throw new MergeFault();
        }

        await merger.setOutput(outputFile);
        await this.db.update(merger.id, merger);

        this.log(
            `merge ${merger.id}: Merged to ${orange(outputFile.path)} (${orange(
                BtoM(outputFile.size)
            )} MB)`
        );
    }

    private err(...message: string[]) {
        if (!config.mergerLogging) return;
        console.error(
            chalk.bold.bgRed("[MergerService] Error:"),
            chalk.red(message)
        );
    }

    private log(...message: string[]) {
        if (!config.mergerLogging) return;
        console.info(
            chalk.bold.bgGreen("[MergerService]"),
            chalk.green(message)
        );
    }

    private getMergerScheduleId(mergerId: string) {
        return `Merger-${mergerId}-cleanup`;
    }

    private async deleteMerger(mergerId: string) {
        const merger = await this.db.get(mergerId);

        if (!merger) throw new MergerNotFoundFault();

        schedule.cancelJob(this.getMergerScheduleId(merger.id));
        await this.db.delete(merger.id);
        await merger.dispose();
    }

    private async createIntermediateFile(
        inputFilePath: string,
        maxSize: number
    ): Promise<MergerFile> {
        const intermediatePath = path.join(DIR_INPUTS, uuid());
        const command = `ffmpeg -i "${inputFilePath}" -fs ${maxSize}B -c copy -bsf:v h264_mp4toannexb -f mpegts ${intermediatePath}`;

        await execAsync(command);

        const { size } = await fs.stat(intermediatePath);
        return { path: intermediatePath, size };
    }

    private async createMergedFile(
        inputPaths: string[],
        creationDate = new Date()
    ): Promise<MergerFile> {
        const outputPath = path.join(DIR_OUTPUTS, `${uuid()}.mp4`);
        const creationTime = ffmpegDate(creationDate);
        const input = inputPaths.join("|");
        const ffmpegCommand = `ffmpeg -i "concat:${input}" -metadata creation_time="${creationTime}" -c copy -bsf:a aac_adtstoasc ${outputPath}`;

        await execAsync(ffmpegCommand);

        const { size } = await fs.stat(outputPath);

        return { path: outputPath, size };
    }
}

export default MergerService.instance;
