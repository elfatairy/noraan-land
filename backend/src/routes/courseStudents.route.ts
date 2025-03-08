import express from "express";
import * as courseController from "../controllers/course.controller";
export const router = express.Router({ mergeParams: true });

router.get("/new", courseController.newCourseStudents); //
router.get("/group/:groupId", courseController.groupStudents); //
router.get("/private", courseController.privateStudents); //