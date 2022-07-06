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
import { DIR_OUTPUTS, DIR_INPUTS } from "../../config/constants";
import MergeFault from "../../errors/MergeFault";
import execAsync from "../../utils/execAsync";
import ffmpegDate from "../../utils/ffmpegDate";
import MergerAlreadyExistsFault from "../../errors/MergerAlreadyExistsFault";

const config = ConfigService.getConfig();

class MergerService {
    // eslint-disable-next-line no-use-before-define
    private static serviceInstance: MergerService;

    private db = DatabaseService.getDatabase<MergerModel>("mergers");
    private outputs: { [id: string]: string } = {};

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
            `Merger-${merger.id}-cleanup`,
            moment().add(config.cleanupMergersDelay, "ms").toDate(),
            async () => {
                await this.db.delete(merger.id);
            }
        );

        return merger.id;
    }

    public async append(mergerId: string, ...files: Express.Multer.File[]) {
        const updated = await this.db.update(mergerId, (merger) => {
            merger.addFiles(...files.map((f) => f.path));
        });
        if (!updated) throw new MergerNotFoundFault();
    }

    public async merge(
        mergerId: string,
        creationDate: Date = new Date()
    ): Promise<string> {
        let output = this.outputs[mergerId];
        if (output) return output;

        const merger = await this.db.get(mergerId);

        if (!merger) {
            throw new MergerNotFoundFault();
        }

        const outputPath = path.join(DIR_OUTPUTS, `${uuid()}.mp4`);
        const inputsPath = path.join(DIR_INPUTS, `${uuid()}.txt`);
        const files = merger.getFiles();
        const inputs = files.map((f) => `file '${f}'`).join("\n");
        const creationTime = ffmpegDate(creationDate);
        const ffmpegCommand = `ffmpeg -f concat -safe 0 -i ${inputsPath} -metadata creation_time="${creationTime}" -c copy ${outputPath}`;

        this.log(`merge ${merger.id}: Merging ${files.length} files`);

        try {
            await fs.outputFile(inputsPath, inputs);
            await execAsync(ffmpegCommand);
            output = outputPath;
        } catch (err) {
            if (err instanceof Error) {
                console.error(chalk.red(err.message));
                console.error(chalk.red(err.stack));
            }
        }

        await fs.remove(inputsPath);

        if (!output) {
            throw new MergeFault();
        }

        this.log(`merge ${merger.id}: Merged to ${output}`);

        return output;
    }

    private log(...message: string[]) {
        if (!config.mergerLogging) return;
        console.info(chalk.bold.bgGreen("[Merger]"), chalk.green(message));
    }
}

export default MergerService.instance;
