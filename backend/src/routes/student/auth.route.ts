import express from "express";
import * as studentController from "../../controllers/student.controller";
import { checkStudent, verifyToken } from "../../middlewares/auth.middleware";
export const router = express.Router();

router.post('/login', studentController.login); //
router.post('/google-login', studentController.googleLogin); //
router.post('/register', studentController.register); //
router.patch('/update-profile', verifyToken, checkStudent, studentController.updateProfile); //
router.get('/getMe', verifyToken, checkStudent, studentController.getMe) //