import { NextFunction, Request, Response } from "express";
import { existsSync, statSync } from "fs";
import { join } from "path";
import { getCourse } from "../services/course.service";
import { decoder } from "../utils/helper.util";

export const validatePath = (req: Request, res: Response, next: NextFunction) => {
    try {
        let subPath = "";
        const leadingFolder = "/api/materials/folder/";
        const leadingFile = "/api/materials/file/";
        const leading = "/api/materials/";
        if (req.originalUrl.slice(0, leadingFolder.length) == leadingFolder) {
            subPath = decoder(req.originalUrl.slice(leadingFolder.length).replace('%20', ' '));
        } else if (req.originalUrl.slice(0, leadingFile.length) == leadingFile) {
            subPath = decoder(req.originalUrl.slice(leadingFile.length));
        } else {
            subPath = decoder(req.originalUrl.slice(leading.length));
        }
        const path = join(__dirname, '../../uploads', subPath);
        res.locals.path = path;

        const exists = existsSync(path);
        if (!exists) {
            res.status(404).json({
                name: "PATH_DOESNT_EXIST",
                message: "This path doesn't exist"
            })
            return;
        }

        next();
    } catch (err: any) {
        console.log("ERROR: ", err);
        res.status(500).json({
            name: "INTERNAL_SERVER_ERROR",
            message: "Internal Server Error"
        });
        next(err);
    }
}

export const validateFolder = (req: Request, res: Response, next: NextFunction) => {
    try {
        const stats = statSync(res.locals.path);
        if (!stats.isDirectory()) {
            res.status(400).json({
                name: "NOT_DIRECTORY",
                message: "This is not a directory"
            })
            return;
        }
        next();
    } catch (err: any) {
        console.log("ERROR: ", err);
        res.status(500).json({
            name: "INTERNAL_SERVER_ERROR",
            message: "Internal Server Error"
        });
        next(err);
    }
}

export const validateFile = (req: Request, res: Response, next: NextFunction) => {
    try {
        const stats = statSync(res.locals.path);
        if (stats.isDirectory()) {
            res.status(400).json({
                name: "NOT_FILE",
                message: "This is not a file"
            })
            return;
        }
        next();
    } catch (err: any) {
        console.log("ERROR: ", err);
        res.status(500).json({
            name: "INTERNAL_SERVER_ERROR",
            message: "Internal Server Error"
        });
        next(err);
    }
}

export const validateCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courseId = Number(req.params.courseId);

        if (!courseId) {
            res.status(400).json({
                name: "INVALID_PAYLOAD",
                message: "Invalid payload data"
            });
            return;
        }

        const courseExistsRes = await getCourse({ id: courseId });
        if (!courseExistsRes) {
            res.status(409).json({
                name: "COURSE_DOESNT_EXIST",
                message: "No course with this id"
            });
            return;
        }
        
        res.locals.courseId = courseId;
        next();
    } catch (err: any) {
        console.log("ERROR: ", err);
        res.status(500).json({
            name: "INTERNAL_SERVER_ERROR",
            message: "Internal Server Error"
        });
        next(err);
    }
}