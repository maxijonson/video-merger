import { Low, JSONFile } from "lowdb";
import path from "path";
import { DIR_DATA } from "../../../config/constants";
import Model from "../Models/Model";
import Adapter from "./Adapter";

class FSAdapter extends Adapter {
    private db: Low<any>;

    constructor() {
        super();
        const adapter = new JSONFile(path.join(DIR_DATA, "db.json"));
        this.db = new Low(adapter);
    }

    public async init(): Promise<void> {
        await this.db.read();
        if (!this.db.data) {
            this.db.data = {};
            await this.save();
        }
    }

    public async createCollection(
        id: string,
        overwrite: boolean
    ): Promise<boolean> {
        const exists = await this.hasCollection(id);
        if (exists && !overwrite) return false;
        this.db.data[id] = {};
        await this.save();
        return true;
    }

    public async hasCollection(id: string): Promise<boolean> {
        return !!this.db.data[id];
    }

    public async insert<T extends Model>(
        collectionId: string,
        data: T,
        overwrite: boolean
    ): Promise<T | null> {
        const exists = await this.has(collectionId, data.id);
        if (exists && !overwrite) return null;
        this.db.data[collectionId][data.id] = data;
        await this.save();
        return data;
    }

    public async get<T extends Model>(
        collectionId: string,
        id: string
    ): Promise<T | null> {
        const exists = this.has(collectionId, id);
        if (!exists) return null;
        return this.db.data[collectionId][id] as T;
    }

    public async has(collectionId: string, id: string): Promise<boolean> {
        return !!this.db.data[collectionId][id];
    }

    public async update<T extends Model>(
        collectionId: string,
        data: T
    ): Promise<T | null> {
        const exists = this.has(collectionId, data.id);
        if (!exists) return null;
        this.db.data[collectionId][data.id] = data;
        await this.save();
        return data;
    }

    public async delete(collectionId: string, id: string): Promise<boolean> {
        const exists = this.has(collectionId, id);
        if (!exists) return false;
        delete this.db.data[collectionId][id];
        await this.save();
        return true;
    }

    public async getAll<T extends Model>(collectionId: string): Promise<T[]> {
        return Object.values(this.db.data[collectionId]);
    }

    private save(): Promise<void> {
        return this.db.write();
    }
}

export default FSAdapter;
