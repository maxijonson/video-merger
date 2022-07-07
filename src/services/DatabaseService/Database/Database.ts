import Adapter from "../Adapters/Adapter";
import Model from "../Models/Model";

class Database<T extends Model> {
    constructor(private collectionId: string, private adapter: Adapter) {}

    private async ensureCollectionExists() {
        await this.adapter.createCollection(this.collectionId, false);
    }

    public async create(data: T, overwrite = false) {
        await this.ensureCollectionExists();
        return this.adapter.insert(this.collectionId, data, overwrite);
    }

    public async get(id: string): Promise<T | null> {
        await this.ensureCollectionExists();
        return this.adapter.get(this.collectionId, id);
    }

    public async has(id: string) {
        await this.ensureCollectionExists();
        return this.adapter.has(this.collectionId, id);
    }

    public async delete(id: string) {
        await this.ensureCollectionExists();
        return this.adapter.delete(this.collectionId, id);
    }

    public async clear() {
        await this.ensureCollectionExists();
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
        return this.adapter.update(this.collectionId, data);
    }
}

export default Database;
