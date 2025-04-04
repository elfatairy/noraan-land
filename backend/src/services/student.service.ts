import { prisma } from "../configs/db.config";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/token.util";
import { OAuth2Client } from "google-auth-library";
import { JOIN_LINK_SHOW, ROLES } from "../utils/constants.util";
import { CalendarDateStatus, Prisma } from "@prisma/client";
import { StringValue } from "../../types";

export const emailExists = async (email: string) => {
  const student = await prisma.student.findFirst({
    where: {
      email,
    },
  });

  return student !== null;
};

export const nameExists = async (name: string) => {
  const student = await prisma.student.findFirst({
    where: {
      name,
    },
  });

  return student !== null;
};

export const createStudent = async (
  name: string,
  email: string,
  phone: string,
  options?: Record<string, string>,
  password?: string
) => {
  const salt = await bcrypt.genSalt();
  const hashedPassword = password ? await bcrypt.hash(password, salt) : null;

  const student = await prisma.student.create({
    data: {
      name,
      phone,
      email,
      ...options,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      age: true,
      location: true,
      gender: true,
    },
  });

  return student;
};

export const updateStudent = async (
  studentId: number,
  data: Record<string, string>
) => {
  const student = await prisma.student.update({
    where: {
      id: studentId,
    },
    data: data,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      age: true,
      location: true,
      gender: true,
    },
  });

  return student;
};

export const getStudentByEmail = async (email: string) =>
  await prisma.student.findFirst({
    where: {
      email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      age: true,
      location: true,
      gender: true,
    },
  });

export const getStudentById = async (id: number) =>
  await prisma.student.findFirst({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      phone: true,
      age: true,
      location: true,
      gender: true,
    },
  });

export const authenticateStudent = async (id: number, email: string) => {
  const expireIn: StringValue = (process.env.JWT_EXPIRY as StringValue) ?? "7d";
  const token = generateToken({ id, email, role: ROLES.USER }, expireIn);

  const student = await prisma.student.findFirst({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      age: true,
      location: true,
      gender: true,
    },
  });

  return { student, token };
};

const client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: 'postmessage',
});
 
export const verifyGoogleCredentialToken = async (mode: string, code:string|null , credential:string|null) => {
  let idToken = "";
  if (mode == "code" && code) {
    const { tokens } = await client.getToken(code); 
    console.log(tokens);
    if (!tokens.id_token) throw new Error("No ID token received from Google");
    idToken = tokens.id_token;

  }else if (mode == "credential" && credential) {
    idToken = credential;
  
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
console.log(ticket.getPayload());
    return { payload: ticket.getPayload() };
  } catch (error) {
    return { error: "Invalid student detected. Please try again" };
  }

};




export const createStudentSession = async (
  studentId: number,
  sessionId: number
) =>
  await prisma.studentSession.create({
    data: {
      studentId,
      sessionId,
    },
  });

export const getStudentSession = async (studentId: number, sessionId: number) =>
  await prisma.studentSession.findFirst({
    where: {
      studentId,
      sessionId,
    },
  });

export const getStudentCourseSubscriptionStatus = async (
  studentCourseId: number
) =>
  (
    await prisma.studentCourseSubscription.findFirstOrThrow({
      where: {
        studentCourseId,
      },
    })
  )?.subscriptionStatus;
  
export const getStudentEnrolledCourses = async (studentId: number) =>
  (
    await prisma.studentCourse.findMany({
      where: { studentId },
      include: {
        course: {
          omit: {
            zoomLink: true,
            paypalProductId: true,
          },
        },
      },
    }) 
  ).map((item) => {
    return { ...item.course, hours: item.hours, studentCourseId: item.id  , preferredSessionType: item.preferredSessionType };
  });

export const getStudentNextWeekSessions = async (studentId: number) => {
  const now = new Date();
  const nextWeekDate = new Date(now.getTime() + 604800000); // 7 days in milliseconds

  const studentCourses = await prisma.studentCourse.findMany({
    where: {
      studentId,
    },
    select: {
      course: {
        select: {
          id: true,
          name: true,
          zoomLink: true,
          sessions: {
            where: {
              calendarDate: {
                endDate: {
                  lt: nextWeekDate,
                },
                startDate: {
                  gt: now,
                },
                status: CalendarDateStatus.AVAILABLE,
              },
            },
            select: {
              id: true,
              title: true,
              description: true,
              status: true,
              isFree: true,
              startedAt: true,
              createdAt: true,
              updatedAt: true,
              calendarDateId: true,
              calendarDate: {
                select: {
                  startDate: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // Process and combine sessions with BigInt conversion
  const sessions = studentCourses.flatMap((studentCourse) => {
    const course = studentCourse.course;

    return studentCourse.course.sessions
      .map((session) => ({
        ...session,
        id: Number(session.id),
        courseId: Number(course.id),
        courseName: course.name,
        zoomLink: course.zoomLink,
        showLink:
          new Date(session.calendarDate.startDate).getTime() -
            new Date().getTime() <=
          JOIN_LINK_SHOW,
        calendarDateId: Number(session.calendarDateId),
      }))
      .map((session) => {
        const { calendarDate, ...sessionContent } = session;
        return sessionContent;
      });
  });

  return sessions.sort((a, b) => {
    const dateA = a.startedAt || a.createdAt;
    const dateB = b.startedAt || b.createdAt;
    return new Date(dateA).getTime() - new Date(dateB).getTime();
  });
};

export const getStudentsService = async () => {
  const students = await prisma.student.findMany({
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      age: true,
      location: true,
      gender: true,
    },
  });
  return students;
};

export const getStudentReportsService = async (
  studentCourseId: number,
  studentId: number
) => {
  const reports = (
    await prisma.studentCourse.findFirst({
      where: {
        id: studentCourseId,
      },
      select: {
        course: {
          select: {
            sessions: {
              select: {
                title: true,
                StudentSession: {
                  where: {
                    studentId,
                  },
                },
              },
            },
          },
        },
      },
    })
  )?.course.sessions.flatMap((session) => ({
    sessionTitle: session.title,
    ...session.StudentSession[0],
  }));

  return reports;
};

export const assignHours = async (studentCourseId: number, hours: number) =>
  await prisma.studentCourse.update({
    where: {
      id: studentCourseId,
    },
    data: {
      hours,
    },
  });

export const assignGroup = async (
  studentCourseId: number,
  groupId: number | null
) =>
  await prisma.studentCourse.update({
    where: {
      id: studentCourseId,
    },
    data: {
      groupId,
    },
  });
