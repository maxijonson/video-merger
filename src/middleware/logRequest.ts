import chalk from "chalk";
import { RequestHandler } from "express";

const logRequest: RequestHandler = (req, res, next) => {
    const now = new Date();
    console.info(
        chalk.bold.bgCyan("[REQ]"),
        chalk.cyan(`${now.toString()} - ${req.method} ${req.url}`)
    );
    next();
};

export default logRequest;
