import express from "express";
import _ from "lodash";
import chalk from "chalk";
import "./config/config";
import { FILES_FIELD } from "./config/constants";
import authenticate from "./middleware/authenticate";
import logRequest from "./middleware/logRequest";
import upload from "./middleware/upload";
import flush from "./utils/flush";
import validateFiles from "./middleware/validateFiles";
import MergerService from "./services/MergerService/MergerService";
import ConfigService from "./services/ConfigService/ConfigService";
import errorHandler from "./middleware/errorHandler";

const app = express();
const mergerService = MergerService.instance;
const config = ConfigService.instance.getConfig();

app.use(authenticate, logRequest);

app.get("/", (_req, res) => {
    return res.sendStatus(200);
});

app.post(
    "/",
    upload.array(FILES_FIELD, config.maxFileUploadCount),
    validateFiles,
    async (req, res) => {
        const files = req.files! as Express.Multer.File[];

        const mergerId = mergerService.create();
        mergerService.append(mergerId, ...files);

        const output = await mergerService.merge(mergerId);

        return res.sendFile(output);
    }
);

app.post("/flush", async (_req, res) => {
    flush();
    return res.sendStatus(200);
});

app.listen(config.port, () => {
    flush();

    Object.entries(config).forEach(([key, value]) => {
        const paddedKey = _.padEnd(key, 25, " ");
        console.info(chalk.keyword("orange")(`🔧 ${paddedKey}: ${value}`));
    });
});

app.use(errorHandler);
