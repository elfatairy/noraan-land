import express, { NextFunction, Request, Response } from "express";
import * as courseController from "../controllers/course.controller";
import { checkAdmin, verifyToken } from "../middlewares/auth.middleware";
import * as userController from "../controllers/user.controller"
import * as adminController from "../controllers/admin.controller"
import { ROLES } from "../utils/constants.util";
export const router = express.Router();

router.post('/', verifyToken, checkAdmin, courseController.create);
router.get('/', verifyToken, courseController.getAll);
router.get('/:id', verifyToken, courseController.getAll);
router.get('/:courseId/courseSessions', verifyToken, (req: Request, res: Response, next: NextFunction) => {
    if(res.locals.role == ROLES.ADMIN) {
        return adminController.getCourseSessions(req, res, next);    
    } else if (res.locals.role == ROLES.USER){
        return userController.getCourseSessions(req, res, next);    
    }
})