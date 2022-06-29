import path from "path";

export const PORT = process.env.PORT || 3000;
export const MAX_FILE_COUNT = 10;
export const TMP_DIR = path.join(__dirname, "..", "tmp");
export const UPLOADS_DIR = path.join(TMP_DIR, "uploads");
export const OUTPUTS_DIR = path.join(TMP_DIR, "outputs");
export const LISTS_DIR = path.join(TMP_DIR, "lists");
export const MERGE_LIFESPAN = 1000 * 10;
export const FILES_FIELD = "files";
