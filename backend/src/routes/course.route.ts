import express, { NextFunction, Request, Response } from "express";
import * as courseController from "../controllers/course.controller";
import { checkAdmin, checkSubscribed, verifyToken } from "../middlewares/auth.middleware";
import * as userController from "../controllers/user.controller"
import * as adminController from "../controllers/admin.controller"
import * as quizController from "../controllers/quiz.controller"
import { ROLES } from "../utils/constants.util";
export const router = express.Router();

router.post('/', verifyToken, checkAdmin, courseController.create);
router.get('/', courseController.getAll);
router.get('/:id', verifyToken, courseController.get);
router.patch('/:id', verifyToken, checkAdmin, courseController.update);
router.get('/:courseId/courseSessions', verifyToken, (req: Request, res: Response, next: NextFunction) => {
    if(res.locals.role == ROLES.ADMIN) {
        return adminController.getCourseSessions(req, res, next);    
    } else if (res.locals.role == ROLES.USER){
        return userController.getCourseSessions(req, res, next);    
    }
})
router.post('/:courseId/quiz', verifyToken, checkAdmin, quizController.create);
router.get('/:courseId/quiz', verifyToken, checkSubscribed, quizController.getAll);

router.delete('/:courseId/quiz/:quizId', verifyToken, checkAdmin, quizController.deleteQuiz);