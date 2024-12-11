import express from "express";
export const router = express.Router();
import {router as adminAuthRouter} from './admin/auth.route';
import {router as adminActionsRouter} from './admin/actions.route';

router.use("/auth", adminAuthRouter);   
router.use("/actions", adminActionsRouter);   