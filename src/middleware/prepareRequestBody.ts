import express, { RequestHandler } from "express";

const prepareRequestBody: RequestHandler = (req, res, next) => {
    return express.json()(req, res, (err) => {
        if (err) return next(err);
        return express.urlencoded({ extended: true })(req, res, (err2) => {
            if (err2) return next(err2);
            if (req.body === undefined) {
                req.body = {};
            }
            return next();
        });
    });
};

export default prepareRequestBody;
