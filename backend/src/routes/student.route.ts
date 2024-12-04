import express from "express";
export const router = express.Router();
import {router as studentAuthRouter} from './student/auth.route';

router.use("/auth", studentAuthRouter);