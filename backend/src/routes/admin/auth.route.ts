import express, { Request, Response } from "express";
import * as adminController from "../../controllers/admin.controller";
export const router = express.Router();

router.post('/login', adminController.login); //