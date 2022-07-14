import { Tedis } from "tedis";
import { parseRedisUrl } from "parse-redis-url-simple";
import ConfigService from "../../ConfigService/ConfigService";
import Model from "../Models/Model";
import Adapter from "./Adapter";

// TODO: I'm a noob, first time using Redis. Feels like I'm doing it wrong... PR welcome!
// Currently, there is not true collection. Each item is a string entry with the key using the format `collection:id`.
// Each item is stored as a JSON string and parsed when accessed by the app.

const config = ConfigService.getConfig();

class RedisAdapter extends Adapter {
    private client!: Tedis;

    public async init(): Promise<void> {
        this.client = new Tedis(RedisAdapter.getConfig());
        return new Promise<void>((resolve, reject) => {
            this.client.on("connect", () => {
                resolve();
            });

            this.client.on("error", (err) => {
                reject(err);
            });
        });
    }

    public async createCollection(
        id: string,
        overwrite: boolean
    ): Promise<boolean> {
        const exists = await this.hasCollection(id);
        if (exists) {
            if (!overwrite) return false;
            const keys = await this.getAllKeys(id);
            await this.client.del("", ...keys);
        }
        return true;
    }

    public async hasCollection(id: string): Promise<boolean> {
        const keys = await this.getAllKeys(id);
        return keys.length > 0;
    }

    public async insert<T extends Model>(
        collectionId: string,
        data: T,
        overwrite: boolean
    ): Promise<T | null> {
        const exists = await this.has(collectionId, data.id);
        if (exists && !overwrite) return null;
        const reply = await this.client.set(
            this.index(collectionId, data.id),
            JSON.stringify(data)
        );
        if (!reply) return null;
        return data;
    }

    public async get<T extends Model>(
        collectionId: string,
        id: string
    ): Promise<T | null> {
        const reply = await this.client.get(this.index(collectionId, id));
        if (!reply || typeof reply !== "string") return null;
        return JSON.parse(reply) as T;
    }

    public async has(collectionId: string, id: string): Promise<boolean> {
        const n = await this.client.exists(this.index(collectionId, id));
        return n === 1;
    }

    public async count(collectionId: string): Promise<number> {
        const keys = await this.getAllKeys(collectionId);
        return keys.length;
    }

    public async update<T extends Model>(
        collectionId: string,
        data: T
    ): Promise<T | null> {
        return this.insert(collectionId, data, true);
    }

    public async delete(collectionId: string, id: string): Promise<boolean> {
        const reply = await this.client.del(this.index(collectionId, id));
        return reply === 1;
    }

    public async getAll<T extends Model>(collectionId: string): Promise<T[]> {
        const keys = await this.getAllKeys(collectionId);
        const data = await Promise.all(keys.map((key) => this.client.get(key)));
        return data.map((d) => JSON.parse(d as string)) as T[];
    }

    public async close(): Promise<void> {
        this.client.close();
    }

    private index(collectionId: string, id: string): string {
        return `${collectionId}:${id}`;
    }

    private async getAllKeys(collectionId: string): Promise<string[]> {
        const keys = await this.client.keys(this.index(collectionId, "*"));
        return keys;
    }

    private static getConfig() {
        const [redisConfig] = parseRedisUrl(config.redisURL);
        if (!redisConfig) throw new Error("Invalid Redis URl");
        return {
            host: redisConfig.host,
            port: redisConfig.port,
            password: redisConfig.password,
        };
    }
}

export default RedisAdapter;
