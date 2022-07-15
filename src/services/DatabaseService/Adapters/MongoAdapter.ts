import mongoose from "mongoose";
import ConfigService from "../../ConfigService/ConfigService";
import Model from "../Models/Model";
import Adapter from "./Adapter";

const config = ConfigService.getConfig();

class MongoAdapter extends Adapter {
    private connection!: mongoose.Connection;
    private db!: mongoose.Connection["db"];

    public async init(): Promise<void> {
        this.connection = await mongoose
            .createConnection(config.mongoURL)
            .asPromise();
        this.db = this.connection.db;
    }

    public async createCollection(
        id: string,
        overwrite: boolean
    ): Promise<boolean> {
        const exists = await this.hasCollection(id);
        if (exists) {
            if (!overwrite) return false;
            await this.db.dropCollection(id);
        }
        await this.db.createCollection(id);
        return true;
    }

    public async hasCollection(id: string): Promise<boolean> {
        const collections = await this.db.collections({ nameOnly: true });
        return collections.some(
            (collection) => collection.collectionName === id
        );
    }

    public async insert<T extends Model>(
        collectionId: string,
        data: T,
        overwrite: boolean
    ): Promise<T | null> {
        const exists = await this.has(collectionId, data.id);
        if (exists && !overwrite) return null;
        const collection = await this.getCollection(collectionId);
        await collection.insertOne(data);
        return data;
    }

    public async get<T extends Model>(
        collectionId: string,
        id: string
    ): Promise<T | null> {
        const collection = await this.getCollection(collectionId);
        const data = await collection.findOne<T>({ id });
        return data;
    }

    public async has(collectionId: string, id: string): Promise<boolean> {
        const doc = await this.get(collectionId, id);
        return doc !== null;
    }

    public async count(collectionId: string): Promise<number> {
        const collection = await this.getCollection(collectionId);
        return collection.countDocuments();
    }

    public async update<T extends Model>(
        collectionId: string,
        data: T
    ): Promise<T | null> {
        const collection = await this.getCollection(collectionId);
        const exists = await this.has(collectionId, data.id);
        if (!exists) return null;
        await collection.updateOne({ id: data.id }, { $set: data });
        return data;
    }

    public async delete(collectionId: string, id: string): Promise<boolean> {
        const collection = await this.getCollection(collectionId);
        const exists = await this.has(collectionId, id);
        if (!exists) return false;
        await collection.deleteOne({ id });
        return true;
    }

    public async getAll<T extends Model>(collectionId: string): Promise<T[]> {
        const collection = await this.getCollection(collectionId);
        const data = await collection.find<T>({}).toArray();
        return data;
    }

    public async close(): Promise<void> {
        await this.connection.close();
    }

    private async getCollection(id: string) {
        return this.db.collection(id);
    }
}

export default MongoAdapter;
