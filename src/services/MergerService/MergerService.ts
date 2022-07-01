import { v4 as uuid } from "uuid";
import schedule from "node-schedule";
import moment from "moment";
import Merger from "./Merger";
import { CLEANUP_MERGERS_DELAY } from "../../config/config";

class MergerService {
    // eslint-disable-next-line no-use-before-define
    private static serviceInstance: MergerService;

    private mergers: { [id: string]: Merger } = {};

    private constructor() {}

    public static get instance(): MergerService {
        if (!MergerService.serviceInstance) {
            MergerService.serviceInstance = new MergerService();
        }
        return MergerService.serviceInstance;
    }

    public create(): string {
        const id = uuid();
        this.mergers[id] = new Merger();

        schedule.scheduleJob(
            `Merger-${id}-cleanup`,
            moment().add(CLEANUP_MERGERS_DELAY, "ms").toDate(),
            () => {
                delete this.mergers[id];
            }
        );

        return id;
    }

    public append(mergerId: string, ...files: Express.Multer.File[]) {
        this.mergers[mergerId]?.append(...files);
    }

    public merge(mergerId: string) {
        return this.mergers[mergerId]?.merge();
    }
}

export default MergerService;
