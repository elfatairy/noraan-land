import { NextFunction, Request, Response } from "express";
import * as jwt from 'jsonwebtoken';
import { ROLES } from "../utils/constants.util";
import { getUserByEmail, getUserById } from "../services/user.service";
import { getCourseUser } from "../services/course.service";

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
        if (!token) {
            res.status(400).json({
                name: "UNAUTHENTICATED",
                message: "User is unauthenticated and this request requires authentication"
            });
            return;
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY ?? "") as jwt.JwtPayload;

        if (!decodedToken.exp || new Date().getTime() / 1000 > decodedToken.exp) {
            res.status(400).json({
                name: "TOKEN_EXPIRED",
                message: "The token you are using expird, please log in again to retrieve another token."
            });
            return;
        }


        const { iat, exp, ...tokenData } = decodedToken;
        res.locals = { ...res.locals, ...tokenData };
        next();
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            res.status(400).json({
                name: "TOKEN_EXPIRED",
                message: "The token you are using expird, please log in again to retrieve another token."
            });
            return;
        }

        res.status(500).json({
            name: "INTERNAL_SERVER_ERROR",
            message: "Internal Server Error"
        });
        next(err);
    }
}

export const checkAdmin = (req: Request, res: Response, next: NextFunction) => {
    try {
        const role = res.locals.role;
        if (role == null || role != ROLES.ADMIN) {
            res.status(400).json({
                name: "UNAUTHORIZED",
                message: "This request needs permessions the user doesn't have"
            });
            return;
        }

        next();
    } catch (err) {
        res.status(500).json({
            name: "INTERNAL_SERVER_ERROR",
            message: "Internal Server Error"
        });
        next(err);
    }
}

export const checkUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, role } = res.locals;
        if (role == null || id == null || role != ROLES.USER) {
            res.status(400).json({
                name: "UNAUTHORIZED",
                message: "This request needs permessions the user doesn't have"
            });
            return;
        }
        const userExists = await getUserById(res.locals.id);
        if (!userExists) {
            res.status(400).json({
                name: "UNAUTHORIZED",
                message: "This request needs permessions the user doesn't have"
            });
            return;
        }
        const { password, ...user } = userExists;
        res.locals.user = user;

        next();
    } catch (err) {
        res.status(500).json({
            name: "INTERNAL_SERVER_ERROR",
            message: "Internal Server Error"
        });
        next(err);
    }
}

export const checkSubscribed = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, role } = res.locals;
        const courseId = Number(req.params.courseId);
        
        if (role == ROLES.ADMIN) {
            next();
            return;
        }
        
        if (role == null || id == null) {
            res.status(400).json({
                name: "UNAUTHORIZED",
                message: "This request needs permessions the user doesn't have"
            });
            return;
        }

        if (!courseId) {
            res.status(400).json({
                name: "INVALID_PAYLOAD",
                message: "Invalid payload data"
            });
            return;
        }

        const userExists = await getUserById(id);
        if (!userExists) {
            res.status(400).json({
                name: "UNAUTHORIZED",
                message: "This request needs permessions the user doesn't have"
            });
            return;
        }

        const courseUser = await getCourseUser(id, courseId);
        if(!courseUser || courseUser.subscribtionStatus == 'UNSUBSCRIBED') {
            res.status(400).json({
                name: "UNSUBSCRIBED",
                message: "User is unsubscribed for this course and so can't view this"
            });
            return;
        }
        
        const { password, ...user } = userExists;
        res.locals.user = user;

        next();
    } catch (err) {
        res.status(500).json({
            name: "INTERNAL_SERVER_ERROR",
            message: "Internal Server Error"
        });
        next(err);
    }
}