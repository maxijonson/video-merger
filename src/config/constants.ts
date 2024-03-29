import path from "path";
import { fileURLToPath } from "url";

// eslint-disable-next-line no-underscore-dangle
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const DIR_SRC = path.join(__dirname, "..");
export const DIR_TMP = path.join(DIR_SRC, "tmp");
export const DIR_UPLOADS = path.join(DIR_TMP, "uploads");
export const DIR_OUTPUTS = path.join(DIR_TMP, "outputs");
export const DIR_INPUTS = path.join(DIR_TMP, "inputs");
export const DIR_DATA = path.join(DIR_TMP, "data");

export const FIELD_FILES = "files";
export const FIELD_CREATION_DATE = "creationDate";

export const DB_MERGERS = "mergers";
