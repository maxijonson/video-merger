import Model from "./Model";

class MergerModel extends Model {
    private files: string[] = [];

    public addFiles(...files: string[]) {
        this.files.push(...files);
    }

    public getFiles(): string[] {
        return this.files;
    }
}

export default MergerModel;
