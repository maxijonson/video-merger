import chalk from "chalk";
import { ErrorRequestHandler } from "express";
import { MulterError } from "multer";
import Fault from "../errors/Fault";

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error(chalk.red(err.message));
    console.error(chalk.red(err.stack));

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

    return res.status(500).send({
        code: 500,
        message: "Internal server error",
    });
};

export default errorHandler;
