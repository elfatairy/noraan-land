import express from "express";
import * as calendarController from "../controllers/calendar.controller";
import { checkAdmin, verifyToken } from "../middlewares/auth.middleware";
export const router = express.Router();

router.get('/upcomingDates', verifyToken, checkAdmin, calendarController.getUpcomingDates); //
router.get('/nextWeekDates', verifyToken, checkAdmin, calendarController.getNextWeekDates); //