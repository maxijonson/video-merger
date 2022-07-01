import chalk from "chalk";
import { ErrorRequestHandler } from "express";
import Fault from "../errors/Fault";

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error(chalk.red(err.message));
    console.error(chalk.red(err.stack));

    if (err instanceof Fault) {
        return res.status(err.httpCode).send(err.message);
    }
    return res.status(500).send("An unexpected error has occurred.");
};

export default errorHandler;
