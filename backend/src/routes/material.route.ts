import express from "express";
import { checkAdmin, checkSubscribed } from "../middlewares/auth.middleware";
import * as materialController from "../controllers/material.controller"
import { validateCourse, validateFile, validateFolder, validatePath } from "../middlewares/validation.middleware";
export const router = express.Router();
const folderRouter = express.Router();
const fileRouter = express.Router();

folderRouter.get('/', checkSubscribed, materialController.open); //
folderRouter.post('/', checkAdmin, materialController.addFolder); //
router.use('/folder/:courseId**', validateCourse, validatePath, validateFolder, folderRouter) //

fileRouter.get('/', checkSubscribed, validateFile, materialController.download); //
fileRouter.post('/', checkAdmin, materialController.upload); //
router.use('/file/:courseId**', validateCourse, validatePath, fileRouter) //

router.patch('/:courseId**', checkAdmin, validateCourse, validatePath, materialController.rename); //
router.delete('/:courseId**', checkAdmin, validateCourse, validatePath, materialController.remove); //