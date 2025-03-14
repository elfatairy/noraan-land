import express from "express";
import * as studentController from "../../controllers/student.controller"
export const router = express.Router();

router.post('/applyForCourse', studentController.applyForCourse) //
router.post('/joinSession/:courseId/:sessionId', studentController.joinSession) //

router.post('/approvePaypal/:courseId', studentController.approvePaypal)
router.post('/approvePaypalSandbox/:courseId', studentController.approvePaypalSandbox)
router.post('/intentPaymob/:courseId', studentController.paymobIntention)

router.get('/nextWeekSessions', studentController.nextWeekSessions) //
router.get('/enrolledCourses', studentController.getMyCourses) //