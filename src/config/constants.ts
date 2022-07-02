import path from "path";

export const DIR_TMP = path.join(__dirname, "..", "tmp");
export const DIR_UPLOADS = path.join(DIR_TMP, "uploads");
export const DIR_OUTPUTS = path.join(DIR_TMP, "outputs");
export const DIR_INPUTS = path.join(DIR_TMP, "inputs");

export const FIELD_FILES = "files";
export const FIELD_CREATION_DATE = "creationDate";
