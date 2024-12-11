import { NextFunction, Request, Response } from "express";
import { prisma } from "../configs/db.config";
import bcrypt from 'bcrypt';
import { generateToken } from "../utils/token.util";
import { OAuth2Client } from "google-auth-library";
import { ROLES, SESSION_TYPE } from "../utils/constants.util";
import { CalendarDateStatus, CalendarDateType, Prisma } from "@prisma/client";
import { sessionTypeToCalendarType } from "../utils/helper.util";

export const isDateAvailable = async (dateIso: string, duration: number) => {
    const newStartDate = new Date(dateIso);
    const newEndDate = new Date(newStartDate.getTime() + duration * 60000);
    
    if (newStartDate < new Date()) {
        return false;
    }

    const busy = await prisma.calendarDate.findFirst({
        where: {
            AND: [
                {
                    startDate: {
                        lt: newEndDate
                    }
                },
                {
                    endDate: {
                        gt: newStartDate
                    }
                }
            ]
        }
    });

    return !busy;
}

export const createCalendarDate = async (dateIso: string, duration: number, type: SESSION_TYPE) => {
    const startDate = new Date(dateIso);
    const endDate = new Date(startDate.getTime() + duration * 60000);

    const calendarType = sessionTypeToCalendarType(type);

    const { id: dateId } = await prisma.calendarDate.create({
        data: {
            startDate,
            endDate,
            duration,
            type: calendarType
        },
        select: {
            id: true
        }
    });

    return dateId;
}

export const getDates = async (dateCondition: Prisma.CalendarDateWhereInput | {} = {}) => await prisma.calendarDate.findMany({
    where: dateCondition
})

export const getDateSession = async (id: number) => {
    const date = await prisma.calendarDate.findFirstOrThrow({
        where: {
            id
        }
    });
    if(date.type == CalendarDateType.GROUP_SESSION) {
        return await prisma.calendarDate.findFirstOrThrow({
            where: {
                id
            }
        }).groupSession();
    } else if (date.type == CalendarDateType.INDIVIDUAL_SESSION) {
        return await prisma.calendarDate.findFirstOrThrow({
            where: {
                id
            }
        }).individualSession();
    }
}

