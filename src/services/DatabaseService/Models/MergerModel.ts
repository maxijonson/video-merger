import fs from "fs-extra";
import MergerDisposedFault from "../../../errors/MergerDisposedFault";
import MergerMaxFileCountFault from "../../../errors/MergerMaxFileCountFault";
import MergerMaxFileSizeFault from "../../../errors/MergerMaxFileSizeFault";
import ConfigService from "../../ConfigService/ConfigService";
import Model from "./Model";

export interface MergerFile {
    path: string;
    size: number;
}

const config = ConfigService.getConfig();

class MergerModel extends Model {
    private files: MergerFile[] = [];
    private output: MergerFile | null = null;
    private disposed = false;

    public async addFiles(...files: MergerFile[]) {
        this.ensureNotDisposed();
        if (this.output) {
            await this.setOutput(null);
        }

        for (let i = 0; i < files.length; ++i) {
            const file = files[i]!;

            if (this.getRemainingSize() < file.size) {
                throw new MergerMaxFileSizeFault();
            }
            if (this.getRemainingFilesCount() < 1) {
                throw new MergerMaxFileCountFault();
            }

            this.files.push(file);
        }
    }

    public getFiles(): MergerFile[] {
        return this.files;
    }

    public getFilesCount(): number {
        return this.files.length;
    }

    public getRemainingFilesCount(): number {
        return config.maxMergerFileCount - this.getFilesCount();
    }

    public getSize(): number {
        return this.files.reduce((acc, file) => acc + file.size, 0);
    }

    public getRemainingSize(): number {
        return config.maxMergerFileSize - this.getSize();
    }

    public async setOutput(output: MergerFile | null) {
        this.ensureNotDisposed();
        if (this.output) {
            await fs.remove(this.output.path);
        }
        this.output = output;
    }

    public getOutput(): MergerFile | null {
        return this.output;
    }

    public async dispose() {
        this.disposed = true;
        const files = [...this.files, ...(this.output ? [this.output] : [])];
        await Promise.all(files.map((f) => fs.remove(f.path)));
        this.files = [];
        this.output = null;
    }

    private ensureNotDisposed() {
        if (this.disposed) {
            throw new MergerDisposedFault();
        }
    }

    public static override fromJSON(json: object): MergerModel {
        const model = new MergerModel();
        Object.assign(model, json);
        return model;
    }
}

export default MergerModel;
