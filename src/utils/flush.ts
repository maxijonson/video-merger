import fs from "fs-extra";
import {
    DIR_UPLOADS,
    DIR_OUTPUTS,
    DIR_INPUTS,
    DB_MERGERS,
} from "../config/constants";
import DatabaseService from "../services/DatabaseService/DatabaseService";
import MergerModel from "../services/DatabaseService/Models/MergerModel";

const flush = async () => {
    const mergersDb = DatabaseService.getDatabase(
        DB_MERGERS,
        MergerModel.fromJSON
    );

    await Promise.all([
        mergersDb.clear(),
        fs.emptyDir(DIR_UPLOADS),
        fs.emptyDir(DIR_OUTPUTS),
        fs.emptyDir(DIR_INPUTS),
    ]);
};

export default flush;
