import express from "express";
import { router as sessionRouter } from "./session.route";
import { router as courseStudentsRouter } from "./courseStudents.route";
import { router as groupRouter } from "./group.route";
import { router as quizRouter } from "./quiz.route";
import * as courseController from "../controllers/course.controller";
import { checkAdmin, verifyToken } from "../middlewares/auth.middleware";
export const router = express.Router();

router.post("/", verifyToken, checkAdmin, courseController.create); //
router.get("/", courseController.getAll); //
router.get("/:courseId", verifyToken, courseController.get); //
router.patch("/:courseId", verifyToken, checkAdmin, courseController.update); //

router.get("/students/new",  verifyToken, checkAdmin, courseController.newStudents); //

router.use("/:courseId/groups", verifyToken, checkAdmin, groupRouter); //
router.use("/:courseId/students", verifyToken, checkAdmin, courseStudentsRouter); //
router.use("/:courseId/sessions", verifyToken, sessionRouter); //
router.use("/:courseId/quizzes", verifyToken, quizRouter); //
