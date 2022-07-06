/* eslint-disable no-underscore-dangle */
declare global {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
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

        /**
         * Delay before:
         * - A merger's associated files (input and output) are deleted to free storage
         * - A merger is deleted to free memory
         *
         * Adjust this depending on how long you want to allow users to prepare a merger and then merge it.
         */
        cleanupMergersDelay: number;

        /** Enable request logging */
        requestLogging: boolean;

        /** Enable merger logging */
        mergerLogging: boolean;
    }
}

class ConfigService {
    // eslint-disable-next-line no-use-before-define
    private static serviceInstance: ConfigService;

    // Should eventually be a full config object with the use of addConfig
    private config: Config = {} as Config;

    private constructor() {}

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
