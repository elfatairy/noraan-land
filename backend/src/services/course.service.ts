import { prisma } from "../configs/db.config";
import { Prisma, SessionType } from "@prisma/client";

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

export const getCourse = async (conditions: Prisma.CourseWhereInput) => await prisma.course.findFirst({
    where: conditions
})

export const getAllCourses = async () => await prisma.course.findMany()

export const getCourseUsers = async (courseId: number, conditions: Prisma.UserCourseWhereInput) => await prisma.course.findFirst({
    where: {
        id: courseId
    }
}).userCourses({
    where: conditions
})

export const viewCourseUser = async (courseId: number, userId: number) => (await prisma.userCourse.updateMany({
    where: {
        userId,
        courseId
    },
    data: {
        viewedByAdmin: true
    }
})).count == 1

export const getCourseUser = async (userId: number, courseId: number) => await prisma.userCourse.findFirst({
    where: {
        userId,
        courseId
    }
})

export const addCourseUser = async (userId: number, courseId: number, sessionType: SessionType, availableTime: string, userNotes?: string) => await prisma.userCourse.create({
    data: {
        userId,
        courseId,
        availableTime,
        userNotes,
        sessionType
    },
})