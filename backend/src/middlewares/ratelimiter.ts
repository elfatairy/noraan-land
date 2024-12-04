import { rateLimit } from "express-rate-limit";
export const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 60 * 7,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: "Too many requests, please try again later.",
    statusCode: 429,
});

export const authRateLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    limit: 1000,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: "Too many auth requests, please try again later.",
    statusCode: 429,
});

export const updateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 15,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: "Too many update requests, please try again later.",
    statusCode: 429,
});
