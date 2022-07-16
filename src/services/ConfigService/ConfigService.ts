// Do not use type unions, because the ConfigService casts process.env entries based on the type of the default value.

import Service from "../Service/Service";

// If you use a type union (e.g. string | number) and use a number as default value the ConfigService will cast the process.env entry to a number. Hence, the type string will NEVER be used.
interface Config {
    /** Port number of the app. Leave as-is for Heroku. */
    port: number;

    /** Password that should be used in 'Authorization' header */
    password: string;

    /** Whether or not to authenticate routes with a password */
    usePassword: boolean;

    /** Maximum amount of files that can be uploaded at once */
    maxFileUploadCount: number;

    /** Maximum file size of individual file uploaded (total would be maxFileUploadSize * maxFileUploadCount) */
    maxFileUploadSize: number;

    /** Maximum total files a merger can hold */
    maxMergerFileCount: number;

    /** Maximum total size a merger can hold */
    maxMergerFileSize: number;

    /** Maximum amount of total mergers that can exist at the same time */
    maxMergers: number;

    /**
     * Delay before:
     * - A merger's associated files (input and output) are deleted to free storage
     * - A merger is deleted to free memory
     *
     * Adjust this depending on how long you want to allow users to prepare a merger and then merge it.
     */
    cleanupMergersDelay: number;

    /**
     * Whether or not to clean up the merger immediately after sending a merged video, instead of waiting for `cleanupMergersDelay`.
     */
    cleanAfterMerge: boolean;

    /**
     * Which database adapter to use.
     *
     * Possible values:
     * - `fs` - Uses a JSON file system to store data with LowDB.
     * - `redis` - Uses a Redis database to store data. (Requires Redis to be installed)
     * - `mongo` - Uses a MongoDB database to store data. (Requires MongoDB to be installed)
     */
    dbAdapter: "fs" | "redis" | "mongo";

    /**
     * The Redis URL to use when dbAdapter is `redis`.
     */
    redisURL: string;

    /**
     * The MongoDB URL to use when dbAdapter is `mongo`.
     */
    mongoURL: string;

    /** Enable request logging */
    requestLogging: boolean;

    /** Enable merger logging */
    mergerLogging: boolean;

    /** Enable database logging */
    dbLogging: boolean;
}

class ConfigService extends Service {
    // eslint-disable-next-line no-use-before-define
    private static serviceInstance: ConfigService;

    // Should eventually be a full config object with the use of addConfig
    private config: Config = {} as Config;

    private constructor() {
        super("Config Service");
        this.notifyReady();
    }

    public static get instance(): ConfigService {
        if (!ConfigService.serviceInstance) {
            ConfigService.serviceInstance = new ConfigService();
        }
        return ConfigService.serviceInstance;
    }

    public getConfig(): Config {
        return { ...this.config };
    }

    public addConfig<K extends keyof Config>(
        key: K,
        processKey: string,
        defaultValue: Config[K]
    ) {
        if (this.config[key]) {
            return this;
        }

        switch (typeof defaultValue) {
            case "string":
                this.config[key] = (process.env[processKey] ||
                    defaultValue) as Config[K];
                break;
            case "number":
                this.config[key] = (Number(process.env[processKey]) ||
                    defaultValue) as Config[K];
                break;
            case "boolean":
                this.config[key] = (
                    process.env[processKey] === "true" ||
                    process.env[processKey] === "false"
                        ? process.env[processKey] === "true"
                        : defaultValue
                ) as Config[K];
                break;
            default:
                this.config[key] = defaultValue;
                break;
        }

        return this;
    }
}

export default ConfigService.instance;
