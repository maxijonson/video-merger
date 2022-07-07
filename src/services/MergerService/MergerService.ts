import { v4 as uuid } from "uuid";
import fs from "fs-extra";
import path from "path";
import schedule from "node-schedule";
import moment from "moment";
import chalk from "chalk";
import ConfigService from "../ConfigService/ConfigService";
import MergerNotFoundFault from "../../errors/MergerNotFoundFault";
import DatabaseService from "../DatabaseService/DatabaseService";
import MergerModel from "../DatabaseService/Models/MergerModel";
import { DIR_OUTPUTS, DIR_INPUTS, DB_MERGERS } from "../../config/constants";
import MergeFault from "../../errors/MergeFault";
import execAsync from "../../utils/execAsync";
import ffmpegDate from "../../utils/ffmpegDate";
import MergerAlreadyExistsFault from "../../errors/MergerAlreadyExistsFault";
import normalizePath from "../../utils/normalizePath";

const config = ConfigService.getConfig();

class MergerService {
    // eslint-disable-next-line no-use-before-define
    private static serviceInstance: MergerService;

    private db = DatabaseService.getDatabase<MergerModel>(DB_MERGERS);

    private constructor() {}

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

        return merger.id;
    }

    public async append(mergerId: string, ...files: Express.Multer.File[]) {
        const exists = await this.db.has(mergerId);

        if (!exists) throw new MergerNotFoundFault();

        const intermediatePaths = await Promise.all(
            files
                .map((f) => normalizePath(f.path))
                .map(async (filePath) => {
                    const intermediatePath = normalizePath(
                        path.join(DIR_INPUTS, uuid())
                    );
                    const command = `ffmpeg -i "${filePath}" -c copy -bsf:v h264_mp4toannexb -f mpegts ${intermediatePath}`;
                    await execAsync(command);
                    await fs.remove(filePath);
                    return intermediatePath;
                })
        );

        await this.db.update(mergerId, (merger) => {
            merger.addFiles(...intermediatePaths);
        });
    }

    public async merge(
        mergerId: string,
        creationDate: Date = new Date()
    ): Promise<string> {
        const merger = await this.db.get(mergerId);
        if (!merger) {
            throw new MergerNotFoundFault();
        }

        let output = merger.getOutput();

        if (output) return output;

        const outputPath = path.join(DIR_OUTPUTS, `${uuid()}.mp4`);
        const files = merger.getFiles();
        const ffmpegCommand = await this.createFfmpegCommand(
            files,
            creationDate,
            outputPath
        );

        this.log(`merge ${merger.id}: Merging ${files.length} files`);

        try {
            await execAsync(ffmpegCommand);
            output = outputPath;
        } catch (err) {
            if (err instanceof Error) {
                console.error(chalk.red(err.message));
                console.error(chalk.red(err.stack));
            }
        }

        if (output === null) {
            throw new MergeFault();
        }

        this.log(`merge ${merger.id}: Merged to ${output}`);

        merger.setOutput(output);
        await this.db.update(merger.id, merger);
        return output;
    }

    private async createFfmpegCommand(
        inputPaths: string[],
        creationDate: Date,
        outputPath: string
    ): Promise<string> {
        const creationTime = ffmpegDate(creationDate);
        const input = inputPaths.join("|");

        return `ffmpeg -i "concat:${input}" -metadata creation_time="${creationTime}" -c copy -bsf:a aac_adtstoasc ${outputPath}`;
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

        const mergerFiles = [...merger.getFiles(), merger.getOutput()];

        await Promise.all(mergerFiles.map((f) => f && fs.remove(f)));
    }
}

export default MergerService.instance;
