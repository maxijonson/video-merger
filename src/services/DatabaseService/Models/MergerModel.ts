import Model from "./Model";

class MergerModel extends Model {
    private files: string[] = [];
    private output: string | null = null;

    public addFiles(...files: string[]) {
        if (this.output) {
            this.output = null;
        }
        this.files.push(...files);
    }

    public getFiles(): string[] {
        return this.files;
    }

    public setOutput(output: string) {
        this.output = output;
    }

    public getOutput(): string | null {
        return this.output;
    }
}

export default MergerModel;
