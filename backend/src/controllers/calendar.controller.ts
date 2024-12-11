import { NextFunction, Request, Response } from "express";
import { getAllCourses } from "../services/course.service";
import { getDates, getDateSession } from "../services/calendar.service";
import { CalendarDateType, Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../configs/db.config";
import { getGroupSession } from "../services/session.service";

export const getBusyDates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dates = await getDates({
      endDate: { gt: new Date() }
    });
    const parsedDates: { startDate: Date, endDate: Date }[] = [];

    dates.forEach(date => {
      const { startDate, endDate } = date;
      parsedDates.push({ startDate, endDate });
    })

    res.json({
      message: "Busy dates retrieved successfully",
      data: {
        dates: parsedDates
      }
    })

  } catch (err: any) {
    console.log("ERROR: ", err);
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error"
    });
    next(err);
  }
}

export const getNextWeekDates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const nextWeekDate = new Date(now.getTime() + 604800000);
    const dates = await getDates({
      endDate: {
        lt: nextWeekDate
      },
      startDate: {
        gt: now
      }
    });
    const parsedDates: any[] = [];

    await Promise.all(dates.map(async date => {
      const session = await getDateSession(date.id)
      parsedDates.push({...date, session})
    }))

    res.json({
      message: "Next week dates retrieved successfully",
      data: {
        dates: parsedDates
      }
    })

  } catch (err: any) {
    console.log("ERROR: ", err);
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error"
    });
    next(err);
  }
}