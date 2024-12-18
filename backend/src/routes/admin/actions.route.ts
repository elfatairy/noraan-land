import express, { Request, Response } from "express";
import * as courseController from "../../controllers/course.controller";
import * as sessionController from "../../controllers/session.controller";
export const router = express.Router();

router.get('/newCourseUsers/:courseId', courseController.newUsers);
router.get('/courseGroupUsers/:courseId', courseController.groupUsers);
router.get('/courseIndividualUsers/:courseId', courseController.individualUsers);

router.post('/startMeeting/:sessionType/:sessionId', sessionController.startSession)
router.post('/endSession/:sessionType/:sessionId', sessionController.endSession)

router.post('/uploadRecords/:sessionType/:sessionId', sessionController.uploadRecords)