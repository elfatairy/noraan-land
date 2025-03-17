import { prisma } from "../configs/db.config";
import {
  Prisma,
  SessionType,
  SubscriptionMethod,
  SubscriptionStatus,
} from "@prisma/client";
import { cancelPaymobSubscription } from "./paymob.service";
import { cancelPaypalSubscription } from "./paypal.service";

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
    where: conditions,
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
        StudentCourseSubscription: true,
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
      StudentCourseSubscription: true,
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
      subscriptionMethod: SubscriptionMethod.PAYPAL,
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
      subscriptionMethod: SubscriptionMethod.PAYMOB,
    },
  });

export const approvePaymobSubscription = async (subscriptionId: string) =>
  await prisma.studentCourseSubscription.updateMany({
    where: {
      paymobSubscriptionId: subscriptionId,
    },
    data: {
      subscriptionStatus: SubscriptionStatus.SUBSCRIBED,
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

export const revokeSubscription = async (studentCourseId: number) =>
  await prisma.studentCourseSubscription.update({
    where: {
      studentCourseId,
    },
    data: {
      subscriptionStatus: SubscriptionStatus.UNSUBSCRIBED,
      subscriptionMethod: null,
      paymobPlanId: null,
      paymobSubscriptionId: null,
      paypalPlanId: null,
      paypalSubscriptionId: null,
    },
  });

export const revokeCoursePrivateSubscriptions = async (courseId: number) => {
  const studentCourses = await prisma.studentCourse.findMany({
    where: {
      courseId,
      groupId: null,
    },
    include: {
      StudentCourseSubscription: true,
    },
  });

  await prisma.studentCourseSubscription.updateMany({
    where: {
      studentCourseId: {
        in: studentCourses.map((sc) => sc.id),
      },
    },
    data: {
      subscriptionStatus: SubscriptionStatus.UNSUBSCRIBED,
      subscriptionMethod: null,
      paymobPlanId: null,
      paymobSubscriptionId: null,
      paypalPlanId: null,
      paypalSubscriptionId: null,
    },
  });
};

export const revokeCourseGroupSubscriptions = async (courseId: number) => {
  const studentCourses = await prisma.studentCourse.findMany({
    where: {
      courseId,
      groupId: {
        not: null,
      },
    },
    include: {
      StudentCourseSubscription: true,
    },
  });

  await prisma.studentCourseSubscription.updateMany({
    where: {
      studentCourseId: {
        in: studentCourses.map((sc) => sc.id),
      },
    },
    data: {
      subscriptionStatus: SubscriptionStatus.UNSUBSCRIBED,
      subscriptionMethod: null,
      paymobPlanId: null,
      paymobSubscriptionId: null,
      paypalPlanId: null,
      paypalSubscriptionId: null,
    },
  });
};

export const cancelStudentCourseSubscription = async (studentCourseId: number) => {
  const studentCourse = await getStudentCourse({
    id: studentCourseId
  });

  if(!studentCourse) throw "studentCourse is null";

  if (!studentCourse.StudentCourseSubscription)
    throw "studentCourse.StudentCourseSubscription is undefined";

  if (
    studentCourse.StudentCourseSubscription.subscriptionMethod ==
      SubscriptionMethod.PAYMOB &&
    studentCourse.StudentCourseSubscription.paymobSubscriptionId &&
    studentCourse.StudentCourseSubscription.paymobPlanId
  ) {
    await cancelPaymobSubscription(
      studentCourse.StudentCourseSubscription.paymobSubscriptionId,
      studentCourse.StudentCourseSubscription.paymobPlanId
    );
  } else if (
    studentCourse.StudentCourseSubscription.subscriptionMethod ==
      SubscriptionMethod.PAYPAL &&
    studentCourse.StudentCourseSubscription.paypalSubscriptionId &&
    studentCourse.StudentCourseSubscription.paypalPlanId
  ) {
    await cancelPaypalSubscription(
      studentCourse.StudentCourseSubscription.paypalSubscriptionId,
      studentCourse.StudentCourseSubscription.paypalPlanId
    );
  }
};
