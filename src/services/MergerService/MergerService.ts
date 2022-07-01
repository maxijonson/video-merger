import { v4 as uuid } from "uuid";
import schedule from "node-schedule";
import moment from "moment";
import Merger from "./Merger";
import ConfigService from "../ConfigService/ConfigService";
import MergerNotFoundFault from "../../errors/MergerNotFoundFault";

const config = ConfigService.instance.getConfig();

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
        this.mergers[id] = new Merger(id);

        schedule.scheduleJob(
            `Merger-${id}-cleanup`,
            moment().add(config.cleanupMergersDelay, "ms").toDate(),
            async () => {
                await this.mergers[id]?.dispose();
                delete this.mergers[id];
            }
        );

        return id;
    }

    public append(mergerId: string, ...files: Express.Multer.File[]) {
        const merger = this.mergers[mergerId];
        if (!merger) {
            throw new MergerNotFoundFault();
        }
        merger.append(...files);
    }

    public merge(mergerId: string) {
        const merger = this.mergers[mergerId];
        if (!merger) {
            throw new MergerNotFoundFault();
        }
        return merger.merge();
    }
}

export default MergerService;
