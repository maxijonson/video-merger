import fs from "fs-extra";
import path from "path";
import { exec } from "child_process";
import { v4 as uuid } from "uuid";
import express from "express";
import _ from "lodash";
import {
    OUTPUTS_DIR,
    LISTS_DIR,
    MAX_FILE_COUNT,
    PORT,
    FILES_FIELD,
} from "./config/constants";
import authenticate from "./middleware/authenticate";
import logMiddleware from "./middleware/logRequest";
import receiveVideos from "./middleware/receiveVideos";
import flush from "./utils/flush";
import CleanupService from "./services/CleanupService/CleanupService";
import validateFiles from "./middleware/validateFiles";

const app = express();
const cleanupService = new CleanupService();

app.get("/", authenticate, logMiddleware, (_req, res) => {
    return res.sendStatus(200);
});

app.post(
    "/",
    authenticate,
    logMiddleware,
    receiveVideos.array(FILES_FIELD, MAX_FILE_COUNT),
    validateFiles(),
    async (req, res) => {
        const files = req.files! as Express.Multer.File[];
        const outputFilePath = path.join(OUTPUTS_DIR, `${uuid()}.mp4`);
        const listFilePath = path.join(LISTS_DIR, `${uuid()}.txt`);
        const ffmpegCommand = `ffmpeg -f concat -safe 0 -i ${listFilePath} -c copy ${outputFilePath}`;
        const cleanupId = cleanupService.prepare([
            listFilePath,
            outputFilePath,
            ...files.map((f) => f.path),
        ]);

        await fs.outputFile(
            listFilePath,
            files.map((f) => `file ${f.path.replace(/\\/g, "/")}`).join("\n")
        );

        exec(ffmpegCommand, async (err) => {
            cleanupService.schedule(cleanupId);

            if (err) {
                console.error(err);
                return res.status(500).send("Error while merging files.");
            }

            console.info(`[OUT] ${new Date().toString()} - ${outputFilePath}`);
            if (req.query.base64 !== undefined) {
                const base64 = await fs.readFile(outputFilePath, "base64");
                return res.send(base64);
            }
            return res.sendFile(outputFilePath);
        });
        return undefined;
    }
);

app.post("/flush", authenticate, logMiddleware, async (_req, res) => {
    cleanupService.cancelAll();
    flush();
    return res.sendStatus(200);
});

app.listen(PORT, () => {
    flush();
    console.info(`Server is running on port ${PORT}`);
});
