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

    public async delete(id: string) {
        await this.ensureCollectionExists();
        return this.adapter.delete(this.collectionId, id);
    }

    public async update(id: string, updater: (data: T) => void) {
        await this.ensureCollectionExists();
        const data = await this.get(id);
        if (!data) return null;
        updater(data);
        return this.adapter.update(this.collectionId, data);
    }

    public async get(id: string): Promise<T | null> {
        await this.ensureCollectionExists();
        return this.adapter.get(this.collectionId, id);
    }
}

export default Database;
