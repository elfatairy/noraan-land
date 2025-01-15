import { prisma } from "../configs/db.config";
import { Prisma, SessionType, SubscriptionMethod, SubscriptionStatus } from "@prisma/client";

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

export const createCoursePaymentDetails = async (courseId: number, paypalGroupPlanId: string, paypalIndividualPlanId: string) => {
    const paymentDetails = await prisma.paymentDetails.create({
        data: {
            courseId,
            paypalGroupPlanId,
            paypalIndividualPlanId
        }
    });

    return paymentDetails;
}

export const getPaymentDetails = async (courseId: number) => await prisma.paymentDetails.findFirstOrThrow({
    where: {
        courseId
    }
})

export const updateCourse = async (courseId: number, options: any) => {
    const course = await prisma.course.update({
        where: {
            id: courseId
        },
        data: options
    })

    return course;
}

export const getCourse = async (conditions: Prisma.CourseWhereInput) => await prisma.course.findFirst({
    where: conditions
})

export const getAllCourses = async () => await prisma.course.findMany()

export const getUserCourses = async (courseId: number, conditions: Prisma.UserCourseWhereInput) => await prisma.course.findFirst({
    where: {
        id: courseId
    }
}).userCourses({
    where: conditions,
    include: {
        user: {
            select: {
                name: true
            }
        }
    }
})

export const viewUserCourse = async (courseId: number, userId: number) => (await prisma.userCourse.updateMany({
    where: {
        userId,
        courseId
    },
    data: {
        viewedByAdmin: true
    }
})).count == 1

export const getUserCourse = async (userId: number, courseId: number) => await prisma.userCourse.findFirst({
    where: {
        userId,
        courseId
    }
})

export const addUserCourse = async (userId: number, courseId: number, sessionType: SessionType, availableTime: string, userNotes?: string) => await prisma.userCourse.create({
    data: {
        userId,
        courseId,
        availableTime,
        userNotes,
        sessionType
    },
})

export const addUserCourseSubscriptionStatus = async (userCourseId: number) => await prisma.userCourseSubscription.create({
    data: {
        userCourseId
    }
})

export const getUserSubscriptionDetails = async (conditions: Prisma.UserCourseSubscriptionWhereInput) => await prisma.userCourseSubscription.findFirst({
    where: conditions
})

export const approvePaypalSubscription = async (userCourseId: number, paypalSubscriptionId: string) => await prisma.userCourseSubscription.update({
    where: {
        userCourseId
    },
    data: {
        subscriptionStatus: SubscriptionStatus.SUBSCRIBED,
        subscriptionMethod: SubscriptionMethod.PAYPAL,
        paypalSubscriptionId
    }
})