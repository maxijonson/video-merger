import ServiceLoadingFault from "../../errors/ServiceLoadingFault";
import ConfigService from "../ConfigService/ConfigService";
import Service from "../Service/Service";
import Adapter from "./Adapters/Adapter";
import FSAdapter from "./Adapters/FSAdapter";
import Database from "./Database/Database";
import Model from "./Models/Model";

const config = ConfigService.getConfig();

class DatabaseService extends Service {
    // eslint-disable-next-line no-use-before-define
    private static serviceInstance: DatabaseService;

    public adapter: Adapter;

    private constructor() {
        super("Database Service");
        try {
            switch (config.dbAdapter) {
                case "fs":
                    this.adapter = new FSAdapter();
                    break;
                default:
                    throw new Error(`Unknown db adapter: ${config.dbAdapter}`);
            }

            const p = this.adapter.init();

            if (p instanceof Promise) {
                p.then(() => {
                    this.notifyReady();
                }).catch((e) => {
                    if (e instanceof Error) {
                        console.error(e);
                    }
                    this.notifyError(new ServiceLoadingFault());
                });
            } else {
                this.notifyReady();
            }
        } catch (e) {
            if (e instanceof Error) {
                console.error(e);
            }
            this.notifyError(new ServiceLoadingFault());
            throw e;
        }
    }

    public static get instance(): DatabaseService {
        if (!DatabaseService.serviceInstance) {
            DatabaseService.serviceInstance = new DatabaseService();
        }
        return DatabaseService.serviceInstance;
    }

    public getDatabase<T extends Model>(id: string): Database<T> {
        return new Database<T>(id, this.adapter);
    }
}

export default DatabaseService.instance;
