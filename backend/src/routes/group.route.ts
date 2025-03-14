import express from "express";
import * as courseController from "../controllers/course.controller";
export const router = express.Router({ mergeParams: true });

router.post('/', courseController.createGroup); //
router.get('/', courseController.courseGroups); //
router.delete('/:groupId', courseController.deleteGroup); //