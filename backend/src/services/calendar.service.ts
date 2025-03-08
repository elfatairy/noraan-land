import { prisma } from "../configs/db.config";
import {
  CalendarDateChangingStatus,
  CalendarDateStatus,
  Prisma,
} from "@prisma/client";

export const isDateAvailable = async (
  dateIso: string,
  duration: number,
  ignoreIds: number[] = []
) => {
  const newStartDate = new Date(dateIso);
  const newEndDate = new Date(newStartDate.getTime() + duration * 60000);

  if (newStartDate < new Date()) {
    return false;
  }

  const busy = await prisma.calendarDate.findFirst({
    where: {
      startDate: {
        lt: newEndDate,
      },
      endDate: {
        gt: newStartDate,
      },
      status: CalendarDateStatus.AVAILABLE,
      NOT: {
        session: {
          id: {
            in: ignoreIds,
          },
        },
      },
    },
  });

  return !busy;
};

export const createCalendarDate = async (
  dateIso: string,
  duration: number,
  changed: boolean = false
) => {
  const startDate = new Date(dateIso);
  const endDate = new Date(startDate.getTime() + duration * 60000);

  const { id: dateId } = await prisma.calendarDate.create({
    data: {
      startDate,
      endDate,
      duration,
      changingStatus: changed
        ? CalendarDateChangingStatus.CHANGED
        : CalendarDateChangingStatus.UNCHANGED,
    },
    select: {
      id: true,
    },
  });

  return dateId;
};

export const getDates = async (
  dateCondition: Prisma.CalendarDateWhereInput | {} = {}
) =>
  await prisma.calendarDate.findMany({
    where: dateCondition,
  });

export const getDate = async (
  dateCondition: Prisma.CalendarDateWhereInput | {} = {}
) =>
  await prisma.calendarDate.findFirstOrThrow({
    where: dateCondition,
  });

export const getDateSession = async (id: number) => {
  return await prisma.calendarDate
    .findFirstOrThrow({
      where: {
        id,
      },
    })
    .session();
};
