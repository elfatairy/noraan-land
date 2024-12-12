import { prisma } from "../configs/db.config";
import { CalendarDateStatus, CalendarDateType, Prisma } from "@prisma/client";
import { createCalendarDate } from "./calendar.service";

export const createGroupSessionService = async (courseId: number, title: string, date: string, duration: number, isFree: boolean, description?: string, quizzesLink?: string) => {
    const calendarDateId = await createCalendarDate(date, duration, CalendarDateType.GROUP_SESSION);
    const session = await prisma.groupSession.create({
        data: {
            title,
            description,
            quizzesLink,
            courseId,
            calendarDateId,
            isFree
        }
    });

    return session;
}

export const createIndividualSessionService = async (courseId: number, userId: number, title: string, date: string, duration: number, isFree: boolean, description?: string, quizzesLink?: string) => {
    const calendarDateId = await createCalendarDate(date, duration, CalendarDateType.INDIVIDUAL_SESSION);
    const session = await prisma.individualSession.create({
        data: {
            courseId, 
            userId, 
            title, 
            calendarDateId, 
            description, 
            quizzesLink,
            isFree
        }
    });

    return session;
}

export const getGroupSession = async (id: number) => await prisma.groupSession.findFirst({
    where: {
        id,
    }
})

export const getIndividualSession = async (id: number) => await prisma.individualSession.findFirst({
    where: {
        id,
    }
})