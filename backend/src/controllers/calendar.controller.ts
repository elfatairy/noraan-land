import { NextFunction, Request, Response } from "express";
import { getDates, getDateSession } from "../services/calendar.service";
import { CalendarDateChangingStatus, CalendarDateStatus } from "@prisma/client";
import { serialize } from "../utils/helper.util";

export const getUpcomingDates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dates = await getDates({
      endDate: { gt: new Date() }
    });
    const parsedDates: { startDate: Date, endDate: Date, status: CalendarDateStatus, changingStatus: CalendarDateChangingStatus }[] = [];

    dates.forEach(date => {
      const { startDate, endDate, status, changingStatus } = date;
      parsedDates.push({ startDate, endDate, status, changingStatus });
    })

    res.json({
      message: "Upcoming dates retrieved successfully",
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
      status: CalendarDateStatus.AVAILABLE,
      startDate: {
        gt: now,
        lt: nextWeekDate
      }
    });
    const parsedDates: any[] = [];

    await Promise.allSettled(dates.map(async date => {
      const session = serialize(await getDateSession(date.id))
      parsedDates.push({ ...date, session })
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