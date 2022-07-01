import { RequestHandler } from "express-serve-static-core";
import _ from "lodash";
import { FILES_FIELD } from "../config/constants";
import ConfigService from "../services/ConfigService/ConfigService";
import upload from "./upload";
import validateFiles from "./validateFiles";

const config = ConfigService.instance.getConfig();

// Compose 'upload' and 'validateFiles' middlewares
const uploadMany: RequestHandler = (req, _res, next) => {
    return upload.array(FILES_FIELD, config.maxFileUploadCount)(
        req,
        _res,
        (err) => {
            if (err) return next(err);
            return validateFiles(req, _res, next);
        }
    );
};

export default uploadMany;
