import fs from "fs-extra";

class Cleanup {
    private files!: string[];
    private delay!: number;
    private timeout!: NodeJS.Timeout;

    constructor(files: string[], delay: number) {
        this.files = files;
        this.delay = delay;
    }

    public schedule() {
        this.timeout = setTimeout(() => {
            this.cleanup();
        }, this.delay);
    }

    public cancel() {
        clearTimeout(this.timeout);
    }

    private cleanup() {
        return Promise.all(this.files.map((f) => fs.remove(f)));
    }
}

export default Cleanup;
