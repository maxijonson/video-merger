export const PORT = Number(process.env.PORT) || 3000; // Leave as-is for Heroku
export const PASSWORD = process.env.PASSWORD || "letmein";
export const MAX_FILE_COUNT = Number(process.env.MAX_FILE_COUNT) || 10;

export const MAX_FILE_SIZE =
    Number(process.env.MAX_FILE_SIZE) || 1024 * 1024 * 100; // 100MB

export const CLEANUP_INPUT_DELAY =
    Number(process.env.CLEANUP_INPUT_DELAY) || 1000;

export const CLEANUP_OUTPUT_DELAY =
    Number(process.env.CLEANUP_OUTPUT_DELAY) || 1000 * 60;

export const CLEANUP_MERGERS_DELAY =
    Number(process.env.CLEANUP_MERGERS_DELAY) || 1000 * 45;
