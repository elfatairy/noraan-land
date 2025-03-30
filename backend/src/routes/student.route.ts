import express from "express";
import {router as studentAuthRouter} from './student/auth.route';
import {router as studentActionsRouter} from './student/actions.route';
import { checkAdmin, checkStudent, verifyToken } from "../middlewares/auth.middleware";
import * as studentController from '../controllers/student.controller'
export const router = express.Router();

router.use("/auth", studentAuthRouter); //
router.use("/actions", verifyToken, checkStudent, studentActionsRouter);

router.get("/", verifyToken, checkAdmin, studentController.getAll); //
router.get("/enrolled", verifyToken, checkAdmin, studentController.getStudents); //
router.get("/:studentId/courses", verifyToken, checkAdmin, studentController.getStudentCourses); //
router.get("/:studentId/courses/:courseId/reports", verifyToken, checkAdmin, studentController.getStudentReports); //
router.patch("/:studentId/courses/:courseId/assignHours", verifyToken, checkAdmin, studentController.assignHoursToStudent); //
router.patch("/:studentId/courses/:courseId/assignGroup", verifyToken, checkAdmin, studentController.assignGroupToStudent); //
router.patch("/:studentId/courses/:courseId/convertToPrivate", verifyToken, checkAdmin, studentController.convertStudentToPrivate); //