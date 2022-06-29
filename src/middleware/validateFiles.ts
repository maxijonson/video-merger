import { RequestHandler } from "express";
import _ from "lodash";
import { ERROR_INVALID_STRUCTURE, ERROR_NO_FILES } from "../config/errors";

const validateFiles =
    (fileField?: string): RequestHandler =>
    async (req, res, next) => {
        if (!req.files) return res.status(400).send(ERROR_NO_FILES);

        const files =
            fileField && !_.isArray(req.files)
                ? req.files[fileField]
                : req.files;

        if (!files) return res.status(400).send(ERROR_NO_FILES);
        if (!_.isArray(files))
            return res.status(400).send(ERROR_INVALID_STRUCTURE);
        if (files.length === 0) return res.status(400).send(ERROR_NO_FILES);

        return next();
    };

export default validateFiles;
