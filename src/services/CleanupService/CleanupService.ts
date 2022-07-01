import { v4 as uuid } from "uuid";
import Cleanup from "./Cleanup";

class CleanupService {
    // eslint-disable-next-line no-use-before-define
    private static serviceInstance: CleanupService;

    private cleanups: { [id: string]: Cleanup } = {};

    private constructor() {}

    public static get instance(): CleanupService {
        if (!CleanupService.serviceInstance) {
            CleanupService.serviceInstance = new CleanupService();
        }
        return CleanupService.serviceInstance;
    }

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
