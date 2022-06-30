import { RequestHandler } from "express";
import _ from "lodash";
import { ERROR_INVALID_STRUCTURE, ERROR_NO_FILES } from "../config/errors";

const validateFiles: RequestHandler = async (req, res, next) => {
    if (!req.files) return res.status(400).send(ERROR_NO_FILES);

    const { files } = req;

    if (!files) return res.status(400).send(ERROR_NO_FILES);
    if (!_.isArray(files)) return res.status(400).send(ERROR_INVALID_STRUCTURE);
    if (files.length === 0) return res.status(400).send(ERROR_NO_FILES);

    return next();
};

export default validateFiles;
