import chalk from "chalk";
import ConfigService from "../../ConfigService/ConfigService";
import Adapter from "../Adapters/Adapter";
import Model from "../Models/Model";

const config = ConfigService.getConfig();
const orange = chalk.keyword("orange");

class Database<T extends Model> {
    constructor(
        private collectionId: string,
        private adapter: Adapter,
        private fromJSON: (json: object) => T
    ) {}

    private async ensureCollectionExists() {
        const created = await this.adapter.createCollection(
            this.collectionId,
            false
        );
        if (created) {
            this.log("Collection created");
        }
    }

    public async create(data: T, overwrite = false) {
        await this.ensureCollectionExists();
        const inserted = await this.adapter.insert(
            this.collectionId,
            data,
            overwrite
        );
        if (!inserted) return null;
        this.log("Insert", orange(data.id));
        return this.fromJSON(inserted);
    }

    public async get(id: string): Promise<T | null> {
        await this.ensureCollectionExists();
        const data = await this.adapter.get(this.collectionId, id);
        if (!data) return null;
        this.log("Get", orange(data.id));
        return this.fromJSON(data);
    }

    public async has(id: string) {
        await this.ensureCollectionExists();
        return this.adapter.has(this.collectionId, id);
    }

    public async delete(id: string) {
        await this.ensureCollectionExists();
        this.log("Delete", orange(id));
        return this.adapter.delete(this.collectionId, id);
    }

    public async clear() {
        await this.ensureCollectionExists();
        this.log("Clear");
        return this.adapter.createCollection(this.collectionId, true);
    }

    public async update(id: string, updater: T | ((data: T) => void)) {
        await this.ensureCollectionExists();
        const data = await this.get(id);
        if (!data) return null;
        if (typeof updater === "function") {
            updater(data);
        } else {
            Object.assign(data, updater);
        }
        const updated = await this.adapter.update(this.collectionId, data);
        if (!updated) return null;
        this.log("Update", orange(updated.id));
        return this.fromJSON(updated);
    }

    private log(...message: string[]): void {
        if (!config.dbLogging) return;
        console.info(
            chalk.bgBlue("[Database]"),
            chalk.blue.bold(this.collectionId),
            chalk.blue("-"),
            chalk.blue(...message)
        );
    }
}

export default Database;
