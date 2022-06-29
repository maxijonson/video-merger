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
    MERGE_LIFESPAN,
    PORT,
} from "./config/constants";
import authenticate from "./middleware/authenticate";
import logMiddleware from "./middleware/logRequest";
import receiveVideos from "./middleware/receiveVideos";
import flush from "./utils/flush";

const app = express();
const removeTimeouts: NodeJS.Timeout[] = [];

app.get("/", logMiddleware, (_req, res) => {
    return res.sendStatus(200);
});

app.post(
    "/",
    authenticate,
    logMiddleware,
    receiveVideos.array("files", MAX_FILE_COUNT),
    async (req, res) => {
        const { files } = req;

        if (!files) return res.status(400).send("No files were uploaded.");
        if (!_.isArray(files))
            return res.status(400).send("Invalid file data structure.");
        if (files.length === 0)
            return res.status(400).send("No files were uploaded.");

        const outputFilePath = path.join(OUTPUTS_DIR, `${uuid()}.mp4`);
        const fileCommands = files.map(
            (f) => `file ${f.path.replace(/\\/g, "/")}`
        );
        const listFilePath = path.join(LISTS_DIR, `${uuid()}.txt`);
        const ffmpegCommand = `ffmpeg -f concat -safe 0 -i ${listFilePath} -c copy ${outputFilePath}`;

        await fs.outputFile(listFilePath, fileCommands.join("\n"));

        removeTimeouts.push(
            setTimeout(async () => {
                await Promise.all([
                    fs.remove(listFilePath),
                    fs.remove(outputFilePath),
                    ...files.map((f) => {
                        return fs.remove(f.path);
                    }),
                ]);
            }, MERGE_LIFESPAN)
        );

        exec(ffmpegCommand, async (err) => {
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
    await flush(removeTimeouts);
    return res.sendStatus(200);
});

app.listen(PORT, () => {
    flush();
    console.info(`Server is running on port ${PORT}`);
});
