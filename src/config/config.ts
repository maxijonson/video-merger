export const PORT = Number(process.env.PORT) || 3000; // Leave as-is for Heroku
export const PASSWORD = process.env.PASSWORD || "letmein";
export const MAX_FILE_COUNT = Number(process.env.MAX_FILE_COUNT) || 10;
export const MAX_FILE_SIZE =
    Number(process.env.MAX_FILE_SIZE) || 1024 * 1024 * 100; // 100MB
export const MERGE_LIFESPAN = Number(process.env.MERGE_LIFESPAN) || 1000 * 60;
