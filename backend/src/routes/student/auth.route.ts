import express, { Request, Response } from "express";
import * as userController from "../../controllers/user.controller";
export const router = express.Router();

router.post('/login', userController.login);