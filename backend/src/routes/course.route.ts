import express, { Request, Response } from "express";
import * as courseController from "../controllers/course.controller";
import { checkAdmin, verifyToken } from "../middlewares/auth.middleware";
export const router = express.Router();

router.post('/', verifyToken, checkAdmin, courseController.create);
router.get('/', verifyToken, courseController.getAll);
router.get('/:id', verifyToken, courseController.getAll);