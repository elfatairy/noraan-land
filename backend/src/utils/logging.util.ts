import winston from "winston";
import morgan from "morgan";
import fs from "fs";
import path from "path";

const errorLogStream = fs.createWriteStream(
    path.join(__dirname, "../errors.log"),
    { flags: "a" }
);

const baseLogStream = fs.createWriteStream(
    path.join(__dirname, "../logs.log"),
    { flags: "a" }
);

export const HTTPErrorLogger = morgan("combined", {
    skip: function (req, res) {
        return res.statusCode < 400;
    },
    stream: errorLogStream,
});

export const HTTPLogger = morgan("combined", {
    skip: function (req, res) {
        return res.statusCode >= 400;
    },
    stream: baseLogStream,
});

const levels = {
    error: 0,
    warn: 1,
    info: 2
};

export const logger = winston.createLogger({
    levels: levels,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: "./logs/app.log" }),
    ],
});

export const errorLogger = winston.createLogger({
    levels: levels,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: "./logs/error.log", level: "error" }),
    ],
});

export const infoLogger = winston.createLogger({
    levels: levels,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: "./logs/info.log", level: "info" }),
    ],
});