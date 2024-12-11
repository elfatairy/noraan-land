import express, { Request, Response } from "express";
import * as sessionController from "../controllers/session.controller";
import { checkAdmin, verifyToken } from "../middlewares/auth.middleware";
export const router = express.Router();

router.post('/group', verifyToken, checkAdmin, sessionController.createGroupSession);
router.post('/individual', verifyToken, checkAdmin, sessionController.createIndividualSession);