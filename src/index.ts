import express, { Request, Response } from "express";
import _ from "lodash";
import chalk from "chalk";
import "./config/config";
import authenticate from "./middleware/authenticate";
import logRequest from "./middleware/logRequest";
import flush from "./utils/flush";
import MergerService from "./services/MergerService/MergerService";
import ConfigService from "./services/ConfigService/ConfigService";
import errorHandler from "./middleware/errorHandler";
import uploadMany from "./middleware/uploadMany";
import parseDate from "./utils/parseDate";

const app = express();
const mergerService = MergerService.instance;
const config = ConfigService.instance.getConfig();

app.use(authenticate, logRequest);

app.get("/", (_req, res) => {
    return res.sendStatus(200);
});

app.post(
    "/",
    uploadMany,
    async (req: Request<{}, {}, { creationDate: string }>, res: Response) => {
        const files = req.files! as Express.Multer.File[];

        const mergerId = mergerService.create();
        mergerService.append(mergerId, ...files);

        const output = await mergerService.merge(
            mergerId,
            parseDate(req.body.creationDate)
        );

        return res.sendFile(output);
    }
);

app.post("/create", (_req, res) => {
    const mergerId = mergerService.create();
    return res.send({ id: mergerId });
});

app.post("/flush", async (_req, res) => {
    flush();
    return res.sendStatus(200);
});

app.post("/add/:id", uploadMany, (req: Request<{ id: string }>, res) => {
    const { id } = req.params;
    const files = req.files! as Express.Multer.File[];
    mergerService.append(id, ...files);
    return res.sendStatus(200);
});

app.post(
    "/:id",
    async (req: Request<{ id: string }, {}, { creationDate: string }>, res) => {
        const { id } = req.params;

        const output = await mergerService.merge(
            id,
            parseDate(req.body.creationDate)
        );

        return res.sendFile(output);
    }
);

app.listen(config.port, () => {
    flush();

    console.info(chalk.bold.keyword("orange")("🎥 VIDEO MERGER"));
    Object.entries(config).forEach(([key, value]) => {
        const paddedKey = _.padEnd(key, 25, " ");
        console.info(chalk.keyword("orange")(`🔧 ${paddedKey}: ${value}`));
    });
    console.info();
});

app.use(errorHandler);
