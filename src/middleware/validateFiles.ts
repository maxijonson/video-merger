import { RequestHandler } from "express";
import _ from "lodash";
import UploadEmptyFault from "../errors/UploadEmptyFault";
import UploadInvalidStructureFault from "../errors/UploadInvalidStructureFault";

const validateFiles: RequestHandler = (req, _res, next) => {
    if (!req.files) return next(new UploadEmptyFault());

    const { files } = req;

    if (!files) return next(new UploadEmptyFault());
    if (!_.isArray(files)) return next(new UploadInvalidStructureFault());
    if (files.length === 0) return next(new UploadEmptyFault());

    return next();
};

export default validateFiles;
