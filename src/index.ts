import express from "express";
import _ from "lodash";
import chalk from "chalk";
import { FILES_FIELD } from "./config/constants";
import authenticate from "./middleware/authenticate";
import logMiddleware from "./middleware/logRequest";
import receiveVideos from "./middleware/receiveVideos";
import flush from "./utils/flush";
import CleanupService from "./services/CleanupService/CleanupService";
import validateFiles from "./middleware/validateFiles";
import {
    MAX_FILE_COUNT,
    MAX_FILE_SIZE,
    CLEANUP_OUTPUT_DELAY,
    PASSWORD,
    PORT,
    CLEANUP_MERGERS_DELAY,
    CLEANUP_INPUT_DELAY,
} from "./config/config";
import MergerService from "./services/MergerService/MergerService";

const app = express();
const cleanupService = new CleanupService();
const mergerService = new MergerService();

app.get("/", authenticate, logMiddleware, (_req, res) => {
    return res.sendStatus(200);
});

app.post(
    "/",
    authenticate,
    logMiddleware,
    receiveVideos.array(FILES_FIELD, MAX_FILE_COUNT),
    validateFiles,
    async (req, res) => {
        const files = req.files! as Express.Multer.File[];

        try {
            const mergerId = mergerService.create();
            mergerService.append(mergerId, ...files);

            const output = await mergerService.merge(mergerId);
            if (!output) {
                throw new Error("No output");
            }
            cleanupService.scheduleCleanup([output], CLEANUP_OUTPUT_DELAY);
            res.sendFile(output);
        } catch (err) {
            res.status(500);
            if (err instanceof Error) {
                console.error(chalk.red(err.message));
                res.send(err.message);
            }
        }

        cleanupService.scheduleCleanup(
            files.map((f) => f.path),
            CLEANUP_INPUT_DELAY
        );
    }
);

app.post("/flush", authenticate, logMiddleware, async (_req, res) => {
    cleanupService.clear();
    flush();
    return res.sendStatus(200);
});

app.listen(PORT, () => {
    flush();
    console.info(chalk.hex("#ffa500")(`🔧 Password: ${PASSWORD}`));
    console.info(chalk.hex("#ffa500")(`🔧 Port: ${PORT}`));
    console.info(chalk.hex("#ffa500")(`🔧 Max File Count: ${MAX_FILE_COUNT}`));
    console.info(chalk.hex("#ffa500")(`🔧 Max File Size: ${MAX_FILE_SIZE}`));
    console.info(
        chalk.hex("#ffa500")(
            `🔧 Cleanup Files Delay: ${CLEANUP_OUTPUT_DELAY / 1000}s`
        )
    );
    console.info(
        chalk.hex("#ffa500")(
            `🔧 Cleanup Mergers Delay: ${CLEANUP_MERGERS_DELAY / 1000}s`
        )
    );
    console.info();

    if (CLEANUP_MERGERS_DELAY > CLEANUP_OUTPUT_DELAY) {
        console.warn(
            chalk.hex("#ffa500")(
                `⚠ Cleanup Mergers Delay is greater than Cleanup Files Delay. This means mergers may attempt to use files that no longer exist!`
            )
        );
    }
});
