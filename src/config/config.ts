import ConfigService from "../services/ConfigService/ConfigService";

const KB = 1024;
const MB = KB * KB;
// const GB = MB * KB;
// const TB = MB * MB;

ConfigService.addConfig("port", "PORT", 3000)
    .addConfig("password", "PASSWORD", "letmein")
    .addConfig("usePassword", "USE_PASSWORD", true)
    .addConfig("maxFileUploadCount", "MAX_FILE_UPLOAD_COUNT", 10)
    .addConfig("maxFileUploadSize", "MAX_FILE_UPLOAD_SIZE", 100 * MB)
    .addConfig("maxMergerFileCount", "MAX_MERGER_FILE_COUNT", 10)
    .addConfig("maxMergerFileSize", "MAX_MERGER_FILE_SIZE", 100 * MB)
    .addConfig("maxMergers", "MAX_MERGERS", 5)
    .addConfig("cleanupMergersDelay", "CLEANUP_MERGERS_DELAY", 1000 * 45)
    .addConfig("requestLogging", "REQUEST_LOGGING", true)
    .addConfig("mergerLogging", "MERGER_LOGGING", true)
    .addConfig("dbLogging", "DB_LOGGING", true)
    .addConfig("dbAdapter", "DB_ADAPTER", "fs")
    .addConfig("redisURL", "REDIS_URL", "redis://localhost:6379")
    .addConfig("mongoURL", "MONGO_URL", "mongodb://localhost:27017")
    .addConfig("cleanAfterMerge", "CLEAN_AFTER_MERGE", true);
