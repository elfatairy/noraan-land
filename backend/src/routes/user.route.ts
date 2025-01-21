import express from "express";
export const router = express.Router();
import * as userController from '../controllers/user.controller';
import {router as userAuthRouter} from './user/auth.route';
import {router as userActionsRouter} from './user/actions.route';
import { checkUser, verifyToken } from "../middlewares/auth.middleware";

router.use("/auth", userAuthRouter);
router.use("/actions", verifyToken, checkUser, userActionsRouter);