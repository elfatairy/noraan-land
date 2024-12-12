import express, { Request, Response } from "express";
import * as courseController from "../../controllers/course.controller";
export const router = express.Router();

router.get('/newCourseUsers/:courseId', courseController.newUsers);
router.get('/courseGroupUsers/:courseId', courseController.groupUsers);
router.get('/courseIndividualUsers/:courseId', courseController.individualUsers);