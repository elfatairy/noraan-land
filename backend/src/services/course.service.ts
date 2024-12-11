import { NextFunction, Request, Response } from "express";
import { prisma } from "../configs/db.config";
import bcrypt from 'bcrypt';
import { generateToken } from "../utils/token.util";
import { OAuth2Client } from "google-auth-library";
import { ROLES } from "../utils/constants.util";
import { Prisma } from "@prisma/client";

export const courseExists = async (conditions: Prisma.CourseWhereInput) => {
    const course = await prisma.course.findFirst({
        where: conditions
    });

    return course !== null;
}

export const createCourse = async (name: string, groupPrice: number, individualPrice: number, description: string) => {
    const course = await prisma.course.create({
        data: {
            name,
            groupPrice, 
            individualPrice,
            description
        }
    })

    return course;
}

export const getCourse = async (id: number) => await prisma.course.findFirst({
    where: {
        id,
    }
})

export const getAllCourses = async () => await prisma.course.findMany()