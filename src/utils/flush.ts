import fs from "fs-extra";
import { UPLOADS_DIR, OUTPUTS_DIR, LISTS_DIR } from "../config/constants";

const flush = async (timeouts: NodeJS.Timeout[] = []) => {
    timeouts.forEach((t) => clearTimeout(t));

    await Promise.all([
        fs.emptyDir(UPLOADS_DIR),
        fs.emptyDir(OUTPUTS_DIR),
        fs.emptyDir(LISTS_DIR),
    ]);
};

export default flush;
