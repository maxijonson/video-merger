import ConfigService from "../ConfigService/ConfigService";
import Adapter from "./Adapters/Adapter";
import FSAdapter from "./Adapters/FSAdapter";
import Database from "./Database/Database";
import Model from "./Models/Model";

const config = ConfigService.getConfig();

class DatabaseService {
    // eslint-disable-next-line no-use-before-define
    private static serviceInstance: DatabaseService;

    private ready = false;
    private onReadyListeners: (() => void)[] = [];

    public adapter: Adapter;

    private constructor() {
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
                this.ready = true;
                this.notifyOnReadyListeners();
            });
        } else {
            this.ready = true;
            this.notifyOnReadyListeners();
        }
    }

    private notifyOnReadyListeners() {
        this.onReadyListeners.forEach((listener) => listener());
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

    public onReady(listener: () => void) {
        if (this.ready) {
            listener();
        } else {
            this.onReadyListeners.push(listener);
        }
    }
}

export default DatabaseService.instance;
