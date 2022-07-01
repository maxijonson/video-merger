import { RequestHandler } from "express";
import _ from "lodash";
import UploadEmptyFault from "../errors/UploadEmptyFault";
import UploadInvalidStructureFault from "../errors/UploadInvalidStructureFault";

const validateFiles: RequestHandler = (req, _res, next) => {
    if (!req.files) throw new UploadEmptyFault();

    const { files } = req;

    if (!files) throw new UploadEmptyFault();
    if (!_.isArray(files)) throw new UploadInvalidStructureFault();
    if (files.length === 0) throw new UploadEmptyFault();

    return next();
};

export default validateFiles;
