import express, { Request, Response } from "express";
import * as calendarController from "../controllers/calendar.controller";
import { checkAdmin, verifyToken } from "../middlewares/auth.middleware";
export const router = express.Router();

router.get('/busyDates', verifyToken, checkAdmin, calendarController.getBusyDates);
router.get('/nextWeekDates', verifyToken, checkAdmin, calendarController.getNextWeekDates);