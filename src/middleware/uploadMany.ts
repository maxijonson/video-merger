import { RequestHandler } from "express-serve-static-core";
import _ from "lodash";
import { FIELD_FILES } from "../config/constants";
import ConfigService from "../services/ConfigService/ConfigService";
import upload from "./upload";
import validateFiles from "./validateFiles";

const config = ConfigService.getConfig();

const uploadMany: RequestHandler = (req, _res, next) => {
    return upload.array(FIELD_FILES, config.maxFileUploadCount)(
        req,
        _res,
        (err) => {
            if (err) return next(err);
            return validateFiles(req, _res, next);
        }
    );
};

export default uploadMany;
