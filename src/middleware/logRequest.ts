import chalk from "chalk";
import { RequestHandler } from "express";
import ConfigService from "../services/ConfigService/ConfigService";

const config = ConfigService.getConfig();

const logRequest: RequestHandler = (req, _res, next) => {
    if (!config.requestLogging) return next();
    const now = new Date();
    console.info(
        chalk.bold.bgCyan("[REQ]"),
        chalk.cyan(`${now.toString()} - ${req.method} ${req.url}`)
    );
    return next();
};

export default logRequest;
