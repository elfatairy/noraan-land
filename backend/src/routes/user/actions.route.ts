import express, { Request, Response } from "express";
import { verifyToken } from "../../middlewares/auth.middleware";
import * as userController from "../../controllers/user.controller"
export const router = express.Router();

router.post('/applyForCourse', userController.applyForCourse)
router.post('/joinSession/:courseId/:sessionId', userController.joinSession)

router.post('/approvePaypal/:courseId', userController.approvePaypal)
router.post('/approvePaypalSandbox/:courseId', userController.approvePaypalSandbox)
router.post('/intentPaymob/:courseId', userController.paymobIntention)

router.get('/nextWeekSessions', userController.nextWeekSessions)
router.get('/enrolledCourses', userController.getUserCourses)