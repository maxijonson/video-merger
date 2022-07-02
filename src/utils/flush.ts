import fs from "fs-extra";
import { UPLOADS_DIR, OUTPUTS_DIR, INPUTS_DIR } from "../config/constants";

const flush = async () => {
    await Promise.all([
        fs.emptyDir(UPLOADS_DIR),
        fs.emptyDir(OUTPUTS_DIR),
        fs.emptyDir(INPUTS_DIR),
    ]);
};

export default flush;
