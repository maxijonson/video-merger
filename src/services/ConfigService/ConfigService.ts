/* eslint-disable no-underscore-dangle */
declare global {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Config {}
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

export default ConfigService;
