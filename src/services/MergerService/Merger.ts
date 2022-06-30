import schedule from "node-schedule";
import fs from "fs-extra";
import { exec } from "child_process";
import path from "path";
import { v4 as uuid } from "uuid";
import moment from "moment";
import chalk from "chalk";
import createFfmpegCommand from "../../utils/createFfmpegCommand";
import { LISTS_DIR, OUTPUTS_DIR } from "../../config/constants";
import { CLEANUP_INPUT_DELAY } from "../../config/config";

class Merger {
    private inputFiles: Express.Multer.File[] = [];
    private output: string | undefined;

    public append(...files: Express.Multer.File[]) {
        if (this.output) {
            this.output = undefined;
        }
        this.inputFiles.push(...files);
    }

    public async merge(base64 = false) {
        if (this.output) return this.output;

        const listFilePath = path.join(LISTS_DIR, `${uuid()}.txt`);
        const outputFilePath = path.join(OUTPUTS_DIR, `${uuid()}.mp4`);

        await fs.outputFile(
            listFilePath,
            this.inputFiles
                .map((f) => `file ${f.path.replace(/\\/g, "/")}`)
                .join("\n")
        );

        try {
            this.output = await new Promise<string>((resolve, reject) => {
                exec(
                    createFfmpegCommand(listFilePath, outputFilePath),
                    async (err) => {
                        if (err) {
                            return reject(err);
                        }

                        console.info(
                            `[OUT] ${new Date().toString()} - ${outputFilePath}`
                        );

                        return resolve(
                            base64
                                ? await fs.readFile(outputFilePath, "base64")
                                : outputFilePath
                        );
                    }
                );
            });
        } catch (err) {
            if (err instanceof Error) {
                console.error(chalk.red(`Merge failed: ${err.message}`));
            }
        }

        schedule.scheduleJob(
            `merge-${uuid()}-cleanup`,
            moment().add(CLEANUP_INPUT_DELAY, "ms").toDate(),
            () => {
                fs.remove(listFilePath);
            }
        );

        return this.output;
    }
}

export default Merger;
