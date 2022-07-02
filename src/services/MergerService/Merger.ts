import fs from "fs-extra";
import { exec } from "child_process";
import path from "path";
import { v4 as uuid } from "uuid";
import chalk from "chalk";
import { INPUTS_DIR, OUTPUTS_DIR } from "../../config/constants";
import ConfigService from "../ConfigService/ConfigService";
import MergerMaxFileCountFault from "../../errors/MergerMaxFileCountFault";
import MergerMaxFileSizeFault from "../../errors/MergerMaxFileSizeFault";
import MergeFault from "../../errors/MergeFault";

const config = ConfigService.instance.getConfig();

class Merger {
    private inputFiles: Express.Multer.File[] = [];
    private output: string | undefined;
    private inputSize = 0;

    constructor(private id: string) {
        this.log(`merge ${this.id}: Created`);
    }

    public append(...files: Express.Multer.File[]) {
        if (this.output) {
            this.output = undefined;
        }
        files.forEach((f) => {
            if (this.inputFiles.length >= config.maxMergerFileCount) {
                throw new MergerMaxFileCountFault();
            }
            if (f.size + this.inputSize > config.maxMergerFileSize) {
                throw new MergerMaxFileSizeFault();
            }
            this.inputFiles.push(f);
            this.inputSize += f.size;
            this.log(
                `merge ${this.id}: Add file "${f.originalname}" (${f.size} bytes)`
            );
        });
    }

    public async merge(): Promise<string> {
        if (this.output) return this.output;

        const filePaths = this.inputFiles.map((f) => f.path);
        const outputPath = path.join(OUTPUTS_DIR, `${uuid()}.mp4`);
        const inputsPath = path.join(INPUTS_DIR, `${uuid()}.txt`);
        const inputs = filePaths.map((f) => `file '${f}'`).join("\n");
        const command = `ffmpeg -f concat -safe 0 -i ${inputsPath} -c copy ${outputPath}`;

        this.log(`merge ${this.id}: Merging ${filePaths.length} files`);

        await fs.outputFile(inputsPath, inputs);

        try {
            this.output = await new Promise<string>((resolve, reject) => {
                exec(command, async (err) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(outputPath);
                });
            });
        } catch (err) {
            if (err instanceof Error) {
                console.error(chalk.red(err.message));
                console.error(chalk.red(err.stack));
            }
        }

        await fs.remove(inputsPath);

        if (!this.output) {
            throw new MergeFault();
        }

        this.log(`merge ${this.id}: Merged to ${this.output}`);

        return this.output;
    }

    public async dispose() {
        await Promise.all([
            this.output && fs.remove(this.output),
            ...this.inputFiles.map((f) => fs.remove(f.path)),
        ]);
    }

    private log(...message: string[]) {
        if (!config.mergerLogging) return;
        console.info(chalk.bold.bgGreen("[Merger]"), chalk.green(message));
    }
}

export default Merger;
