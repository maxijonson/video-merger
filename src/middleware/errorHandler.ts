import chalk from "chalk";
import fs from "fs-extra";
import { ErrorRequestHandler } from "express";
import { MulterError } from "multer";
import Fault from "../errors/Fault";

const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
    if (req.files) {
        const files = req.files as Express.Multer.File[];
        files.forEach((file) => {
            fs.remove(file.path);
        });
    }

    if (err instanceof Fault) {
        return res.status(err.httpCode).send({
            code: err.httpCode,
            message: err.message,
        });
    }

    if (err instanceof MulterError) {
        return res.status(400).send({
            code: 400,
            message: err.message,
        });
    }

    console.error(chalk.red(err.message));
    console.error(chalk.red(err.stack));

    return res.status(500).send({
        code: 500,
        message: "Internal server error",
    });
};

export default errorHandler;
