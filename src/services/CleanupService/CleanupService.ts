import { v4 as uuid } from "uuid";
import { MERGE_LIFESPAN } from "../../config/config";
import Cleanup from "./Cleanup";

class CleanupService {
    private cleanups: { [id: string]: Cleanup } = {};

    public prepare(files: string[], when = MERGE_LIFESPAN): string {
        const cleanup = new Cleanup(files, when);
        const id = uuid();
        this.cleanups[id] = cleanup;
        return id;
    }

    public schedule(id: string) {
        const cleanup = this.cleanups[id];
        if (!cleanup) return;
        cleanup.schedule();
    }

    public cancelAll() {
        Object.values(this.cleanups).forEach((c) => c.cancel());
    }
}

export default CleanupService;
