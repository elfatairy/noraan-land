import express, { Request, Response } from "express";
import * as userController from "../../controllers/user.controller";
import { checkUser, verifyToken } from "../../middlewares/auth.middleware";
export const router = express.Router();

router.post('/login', userController.login);

router.post('/google-login', userController.googleLogin);

router.post('/register', userController.register);

router.patch('/update-profile', verifyToken, checkUser, userController.updateProfile);