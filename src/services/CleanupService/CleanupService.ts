import { v4 as uuid } from "uuid";
import Cleanup from "./Cleanup";

class CleanupService {
    private cleanups: { [id: string]: Cleanup } = {};

    public prepare(files: string[], delay: number): string {
        const id = uuid();
        this.cleanups[id] = new Cleanup(id, files, delay, () => {
            delete this.cleanups[id];
        });
        return id;
    }

    public schedule(id: string) {
        this.cleanups[id]?.schedule();
    }

    public scheduleCleanup(files: string[], delay: number) {
        const id = this.prepare(files, delay);
        this.schedule(id);
    }

    public clear() {
        Object.values(this.cleanups).forEach((c) => c.cancel());
        this.cleanups = {};
    }
}

export default CleanupService;
