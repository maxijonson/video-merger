import ConfigService from "../services/ConfigService/ConfigService";

const KB = 1024;
const MB = KB * KB;

declare global {
    // Do not use type unions, because the ConfigService casts process.env entries based on the type of the default value.
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

        /**
         * Delay before:
         * - A merger's associated files (input and output) are deleted to free storage
         * - A merger is deleted to free memory
         *
         * Adjust this depending on how long you want to allow users to prepare a merger and then merge it.
         */
        cleanupMergersDelay: number;
    }
}

// Edit default values here.
ConfigService.instance
    .addConfig("port", "PORT", 3000)
    .addConfig("password", "PASSWORD", "letmein")
    .addConfig("usePassword", "USE_PASSWORD", true)
    .addConfig("maxFileUploadCount", "MAX_FILE_UPLOAD_COUNT", 10)
    .addConfig("maxFileUploadSize", "MAX_FILE_UPLOAD_SIZE", 100 * MB)
    .addConfig("maxMergerFileCount", "MAX_MERGER_FILE_COUNT", 10)
    .addConfig("maxMergerFileSize", "MAX_MERGER_FILE_SIZE", 100 * MB)
    .addConfig("cleanupMergersDelay", "CLEANUP_MERGERS_DELAY", 1000 * 5);
