import { NextFunction, Request, Response } from "express";
import { prisma } from "../configs/db.config";
import bcrypt from 'bcrypt';
import { generateToken } from "../utils/token.util";
import { OAuth2Client } from "google-auth-library";
import { ROLES } from "../utils/constants.util";
import { Gender, Prisma } from "@prisma/client";

export const userExists = async (conditions: Prisma.UserWhereInput) => {
    const user = await prisma.user.findFirst({
        where: conditions
    });

    return user !== null;
}

export const emailExists = async (email: string) => {
    const user = await prisma.user.findFirst({
        where: {
            email
        }
    });

    return user !== null;
}

export const nameExists = async (name: string) => {
    const user = await prisma.user.findFirst({
        where: {
            name
        }
    });

    return user !== null;
}

export const createUser = async (name: string, email: string, options?: Record<string, string>, password?: string) => {
    const salt = await bcrypt.genSalt();
    const hashedPassword = password ? await bcrypt.hash(password, salt) : null;

    const user = await prisma.user.create({
        data: {
            name,
            email,
            ...options,
            password: hashedPassword
        },
        select: {
            id: true,
            name: true,
            email: true,
            age: true,
            location: true,
            gender: true,
        }
    });

    return user;
}

export const updateUser = async (userId: number, data: Record<string, string>) => {
    const user = await prisma.user.update({
        where: {
            id: userId
        },
        data: data,
        select: {
            id: true,
            name: true,
            email: true,
            age: true,
            location: true,
            gender: true,
        }
    });

    return user;
}

export const getUserByEmail = async (email: string) => await prisma.user.findFirst({
    where: {
        email
    },
    select: {
        id: true,
        name: true,
        email: true,
        password: true,
        age: true,
        location: true,
        gender: true,
    }
});

export const getUserById = async (id: number) => await prisma.user.findFirst({
    where: {
        id
    },
    select: {
        id: true,
        name: true,
        email: true,
        password: true,
        age: true,
        location: true,
        gender: true,
    }
});

export const authenticateUser = async (id: number, email: string) => {
    const token = generateToken({ id, email, role: ROLES.USER }, process.env.JWT_EXPIRY ?? '7d');

    const user = await prisma.user.findFirst({
        where: {
            id
        },
        select: {
            id: true,
            name: true,
            email: true,
            age: true,
            location: true,
            gender: true,
        }
    });

    return { user, token };
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const verifyGoogleToken = async (idToken: string) => {
    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        return { payload: ticket.getPayload() };
    } catch (error) {
        return { error: "Invalid user detected. Please try again" };
    }
}

export const createUserSession = async (userId: number, sessionId: number) => await prisma.userSession.create({
    data: {
        userId,
        sessionId
    }
})

export const getUserSession = async (userId: number, sessionId: number) => await prisma.userSession.findFirst({
    where: {
        userId,
        sessionId
    }
})

export const getUserCourseSubscriptionStatus = async (userCourseId: number) => (await prisma.userCourseSubscription.findFirstOrThrow({
    where: {
        userCourseId
    }
}))?.subscriptionStatus

export const getUserEnrolledCourses = async (userId: number) => (await prisma.userCourse.findMany({
    where: { userId },
    include: {
        course: {}
    }
})).map(item => item.course);

export const getUserNextWeekSessions = async (userId: number) => {
    const now = new Date();
    const nextWeekDate = new Date(now.getTime() + 604800000);

    return (await prisma.userCourse.findMany({
        where: {
            userId
        },
        include: {
            course: {
                include: {
                    groupSessions: {
                        where: {
                            calendarDate: {
                                endDate: {
                                    lt: nextWeekDate
                                },
                                startDate: {
                                    gt: now
                                }
                            }
                        }
                    },
                    individualSessions: {
                        where: {
                            calendarDate: {
                                endDate: {
                                    lt: nextWeekDate
                                },
                                startDate: {
                                    gt: now
                                }
                            }
                        }
                    }
                }
            }
        }
    })).map(item => [
        ...item.course.groupSessions,
        ...item.course.individualSessions
    ].map(session => ({
        ...session,
        courseId: item.course.id,
        courseName: item.course.name,
    }))).reduce((acc, cur) => [...acc, ...cur], []);
}