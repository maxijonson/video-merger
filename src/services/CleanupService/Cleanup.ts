import fs from "fs-extra";
import moment from "moment";
import schedule from "node-schedule";

class Cleanup {
    private job: schedule.Job | undefined;

    constructor(
        private id: string,
        private files: string[],
        private delay: number,
        private doneListener: () => void
    ) {}

    public schedule() {
        this.cancel();
        this.job = schedule.scheduleJob(
            `Cleanup-${this.id}-removefiles`,
            moment().add(this.delay, "ms").toDate(),
            () => {
                this.cleanup();
            }
        );
    }

    public cancel() {
        this.job?.cancel();
        this.job = undefined;
    }

    private async cleanup() {
        await Promise.all(this.files.map((f) => fs.remove(f)));
        this.doneListener();
    }
}

export default Cleanup;
