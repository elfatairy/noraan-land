import { NextFunction, Request, Response } from "express";
import * as jwt from 'jsonwebtoken';
import { ROLES } from "../utils/constants.util";

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

        res.locals.role = decodedToken.role;
        next();
    } catch (err) {
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