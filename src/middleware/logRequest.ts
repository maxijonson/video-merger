import { RequestHandler } from "express";

const logMiddleware: RequestHandler = (req, res, next) => {
    const now = new Date();
    console.info(`[REQ] ${now.toString()} - ${req.method} ${req.url}`);
    next();
};

export default logMiddleware;
