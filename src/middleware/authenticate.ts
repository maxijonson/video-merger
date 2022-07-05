import { RequestHandler } from "express";
import ConfigService from "../services/ConfigService/ConfigService";

const config = ConfigService.getConfig();

/**
 * It goes without saying this is a very insecure way to do it, but it's a
 * simple way to get started. I'm not planning on making this a public API, so
 * this will be fine for myself.
 */
const authenticate: RequestHandler = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (config.usePassword && authHeader !== config.password) {
        console.info("[AUTH] Authentication failed", authHeader);
        return res.status(401).send("Unauthorized");
    }
    return next();
};

export default authenticate;
