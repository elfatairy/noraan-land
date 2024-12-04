import express from "express";
export const router = express.Router();
import {router as userAuthRouter} from './user/auth.route';

router.use("/auth", userAuthRouter);