import express, { Request, Response } from "express";
import * as userController from "../../controllers/user.controller";
export const router = express.Router();

router.post('/login', userController.login);

router.post('/google-login', userController.googleLogin);

router.post('/register', userController.register);