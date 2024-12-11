import { NextFunction, Request, Response } from "express";
import { prisma } from "../configs/db.config";
import bcrypt from 'bcrypt';
import { generateToken } from "../utils/token.util";
import { OAuth2Client } from "google-auth-library";
import { ROLES, SESSION_TYPE } from "../utils/constants.util";
import { Prisma } from "@prisma/client";
import { createCalendarDate } from "./calendar.service";

export const createGroupSessionService = async (courseId: number, title: string, date: string, duration: number, description?: string, quizzesLink?: string) => {
    const calendarDateId = await createCalendarDate(date, duration, SESSION_TYPE.GROUP);
    const session = await prisma.groupSession.create({
        data: {
            title,
            description,
            quizzesLink,
            courseId,
            calendarDateId
        }
    });

    return session;
}

export const createIndividualSessionService = async (courseId: number, userId: number, title: string, date: string, duration: number, description?: string, quizzesLink?: string) => {
    const calendarDateId = await createCalendarDate(date, duration, SESSION_TYPE.INDIVIDUAL);
    const session = await prisma.individualSession.create({
        data: {
            courseId, 
            userId, 
            title, 
            calendarDateId, 
            description, 
            quizzesLink
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