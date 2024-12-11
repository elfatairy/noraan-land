import { CalendarDateType } from "@prisma/client";
import { prisma } from "../configs/db.config";
import { SESSION_TYPE } from "./constants.util";

export const sessionTypeToCalendarType = (sessionType: SESSION_TYPE): CalendarDateType => {
  switch (sessionType) {
    case SESSION_TYPE.GROUP:
      return CalendarDateType.GROUP_SESSION;
    case SESSION_TYPE.INDIVIDUAL:
      return CalendarDateType.INDIVIDUAL_SESSION
    default:
      throw Error("Invalid session type")
  }
}