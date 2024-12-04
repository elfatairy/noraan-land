import { NextFunction, Request, Response } from "express";

import { errorLogger, logger } from "../utils/logging.util";

export const logRequest = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { method, url, body, params, query } = req;
        const ip =
            req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        const headers = req.headers;
        const userAgent = headers["user-agent"];
        const origin = headers["origin"];
        const host = headers["host"];

        const log = {   
            method,
            url,
            body,
            params,
            query,
            ip,
            userAgent,
            origin,
            host,
        };
        logger.log({
            level: "info",
            message: JSON.stringify(log),
        });
        next();
    } catch (error: any) {
        errorLogger.log({
            level: "error",
            message: error.message,
        });
    }
};

module.exports = {
    logRequest,
};