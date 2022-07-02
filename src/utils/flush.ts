import fs from "fs-extra";
import { DIR_UPLOADS, DIR_OUTPUTS, DIR_INPUTS } from "../config/constants";

const flush = async () => {
    await Promise.all([
        fs.emptyDir(DIR_UPLOADS),
        fs.emptyDir(DIR_OUTPUTS),
        fs.emptyDir(DIR_INPUTS),
    ]);
};

export default flush;
