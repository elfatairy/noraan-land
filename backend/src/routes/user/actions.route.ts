import express, { Request, Response } from "express";
import { verifyToken } from "../../middlewares/auth.middleware";
import * as userController from "../../controllers/user.controller"
export const router = express.Router();

router.post('/applyForCourse', userController.applyForCourse)
router.post('/approvePaypal/:courseId', userController.approvePaypal)
router.post('/joinSession/:courseId/:sessionId', userController.joinSession)

router.get('/nextWeekSessions', userController.nextWeekSessions)
router.get('/enrolledCourses', userController.getUserCourses)