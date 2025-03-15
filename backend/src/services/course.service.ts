import { prisma } from "../configs/db.config";
import {
  Prisma,
  SessionType,
  SubscriptionMethod,
  SubscriptionStatus,
} from "@prisma/client";

export const createCourse = async (
  name: string,
  privatePrice: number,
  groupPrice: number,
  description: string,
  zoomLink: string,
  paypalProductId: string
) => {
  const course = await prisma.course.create({
    data: {
      name,
      privatePrice,
      groupPrice,
      description,
      zoomLink,
      paypalProductId,
    },
    omit: {
      paypalProductId: true,
    },
  });

  return course;
};

export const updateCourse = async (courseId: number, options: any) => {
  const course = await prisma.course.update({
    where: {
      id: courseId,
    },
    data: options,
    omit: {
      paypalProductId: true,
    },
  });

  return course;
};

export const getCourse = async (conditions: Prisma.CourseWhereInput) =>
  await prisma.course.findFirst({
    where: conditions
  });

export const getAllCourses = async () =>
  await prisma.course.findMany({
    omit: {
      paypalProductId: true,
    },
  });

export const getStudentCourses = async (
  courseId: number,
  conditions: Prisma.StudentCourseWhereInput
) =>
  await prisma.course
    .findFirst({
      where: {
        id: courseId,
      },
      omit: {
        paypalProductId: true,
      },
    })
    .studentCourses({
      where: conditions,
      include: {
        student: {
          select: {
            name: true,
          },
        },
        StudentCourseSubscription: {},
      },
    });

export const getUnasignedStudentCourse = async () =>
  await prisma.studentCourse.findMany({
    where: {
      hours: null,
    },
    include: {
      student: {},
      course: {
        omit: {
          paypalProductId: true,
        },
      },
    },
  });

export const getStudentCourse = async (
  conditions: Prisma.StudentCourseWhereInput
) =>
  await prisma.studentCourse.findFirst({
    where: conditions,
    include: {
      StudentCourseSubscription: {
        select: {
          subscriptionStatus: true,
        },
      },
    },
  });

export const addStudentCourse = async (
  studentId: number,
  courseId: number,
  sessionType: SessionType,
  availableTime: string,
  studentNotes?: string
) =>
  await prisma.studentCourse.create({
    data: {
      studentId,
      courseId,
      availableTime,
      studentNotes,
      preferredSessionType: sessionType,
    },
  });

export const addStudentCourseSubscriptionStatus = async (
  studentCourseId: number
) =>
  await prisma.studentCourseSubscription.create({
    data: {
      studentCourseId,
    },
  });

export const getStudentSubscriptionDetails = async (
  conditions: Prisma.StudentCourseSubscriptionWhereInput
) =>
  await prisma.studentCourseSubscription.findFirst({
    where: conditions,
  });

export const initiatePaypalSubscription = async (
  studentCourseId: number,
  paypalPlanId: string
) =>
  await prisma.studentCourseSubscription.update({
    where: {
      studentCourseId,
    },
    data: {
      paypalPlanId,
    },
  });

export const approvePaypalSubscription = async (
  studentCourseId: number,
  paypalSubscriptionId: string
) =>
  await prisma.studentCourseSubscription.update({
    where: {
      studentCourseId,
    },
    data: {
      subscriptionStatus: SubscriptionStatus.SUBSCRIBED,
      subscriptionMethod: SubscriptionMethod.PAYPAL,
      paypalSubscriptionId,
    },
  });

export const approvePaypalSubscriptionSandBox = async (
  studentCourseId: number
) =>
  await prisma.studentCourseSubscription.update({
    where: {
      studentCourseId,
    },
    data: {
      subscriptionStatus: SubscriptionStatus.SUBSCRIBED,
      subscriptionMethod: SubscriptionMethod.PAYPAL,
      paymobSubscriptionId: "SANDBOX",
    },
  });

export const savePaymobSubscription = async (
  studentCourseId: number,
  paymobPlanId: number,
  paymobSubscriptionId: string
) =>
  await prisma.studentCourseSubscription.update({
    where: {
      studentCourseId,
    },
    data: {
      paymobSubscriptionId,
      paymobPlanId,
      subscriptionStatus: SubscriptionStatus.SUBSCRIBED,
      subscriptionMethod: SubscriptionMethod.PAYMOB,
    },
  });

export const makeFreeSubscription = async (studentCourseId: number) =>
  await prisma.studentCourseSubscription.update({
    where: {
      studentCourseId,
    },
    data: {
      subscriptionStatus: SubscriptionStatus.SUBSCRIBED,
      subscriptionMethod: SubscriptionMethod.FREE,
      paypalSubscriptionId: null,
      paymobSubscriptionId: null,
      paypalPlanId: null,
      paymobPlanId: null,
    },
  });
