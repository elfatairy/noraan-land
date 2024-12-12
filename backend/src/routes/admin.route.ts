import express from "express";
export const router = express.Router();
import {router as adminAuthRouter} from './admin/auth.route';
import {router as adminActionsRouter} from './admin/actions.route';
import { checkAdmin, verifyToken } from "../middlewares/auth.middleware";

router.use("/auth", adminAuthRouter);   
router.use("/actions", verifyToken, checkAdmin, adminActionsRouter);   