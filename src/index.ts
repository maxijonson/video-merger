import express, { Request, Response } from "express";
import _ from "lodash";
import chalk from "chalk";
import "dotenv/config";
import "./config/config";
import authenticate from "./middleware/authenticate";
import logRequest from "./middleware/logRequest";
import flush from "./utils/flush";
import ConfigService from "./services/ConfigService/ConfigService";
import errorHandler from "./middleware/errorHandler";
import uploadMany from "./middleware/uploadMany";
import MergerService from "./services/MergerService/MergerService";
import DatabaseService from "./services/DatabaseService/DatabaseService";
import prepareRequestBody from "./middleware/prepareRequestBody";

const app = express();
const config = ConfigService.getConfig();

app.use(prepareRequestBody, authenticate, logRequest);

app.get("/", (_req, res) => {
    return res.sendStatus(200);
});

app.post(
    "/",
    uploadMany,
    async (req: Request<{}, {}, { creationDate?: string }>, res: Response) => {
        const files = req.files! as Express.Multer.File[];

        const mergerId = await MergerService.create();
        await MergerService.append(mergerId, ...files);
        await MergerService.sendMergedFile(mergerId, res);
    }
);

app.post("/create", async (_req, res) => {
    const mergerId = await MergerService.create();
    return res.send({ id: mergerId });
});

app.post("/flush", async (_req, res) => {
    flush();
    return res.sendStatus(200);
});

app.post("/add/:id", uploadMany, async (req: Request<{ id: string }>, res) => {
    const { id } = req.params;
    const files = req.files! as Express.Multer.File[];
    await MergerService.append(id, ...files);
    return res.sendStatus(200);
});

app.post(
    "/:id",
    async (
        req: Request<{ id: string }, {}, { creationDate?: string }>,
        res
    ) => {
        const { id } = req.params;
        await MergerService.sendMergedFile(id, res);
    }
);

app.use(errorHandler);

DatabaseService.onReady(() => {
    app.listen(config.port, () => {
        flush();

        console.info(chalk.bold.keyword("orange")("🎥 VIDEO MERGER"));
        Object.entries(config).forEach(([key, value]) => {
            const paddedKey = _.padEnd(key, 25, " ");
            console.info(chalk.keyword("orange")(`🔧 ${paddedKey}: ${value}`));
        });
        console.info();
    });
});
