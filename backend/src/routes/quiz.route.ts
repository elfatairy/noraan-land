import express from "express";
import * as quizController from "../controllers/quiz.controller"
import { checkAdmin, checkSubscribed, verifyToken } from "../middlewares/auth.middleware";
import { validateCourse } from "../middlewares/validation.middleware";
export const router = express.Router({ mergeParams: true });

router.post('/', checkAdmin, quizController.create); //
router.get('/', validateCourse, checkSubscribed, quizController.getAll); //
router.delete('/:quizId', checkAdmin, quizController.deleteQuiz); //
