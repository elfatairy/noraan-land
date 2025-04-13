import { NextFunction, Request, Response } from "express";
import {
  validateAge,
  validateEmail,
  validateGender,
  validatePassword,
  validatePhone,
  validateSessionType,
  validateString,
} from "../utils/validation.util";
import {
  authenticateStudent,
  createStudent,
  createStudentSession,
  emailExists,
  getStudentByEmail,
  getStudentSession,
  getStudentCourseSubscriptionStatus,
  nameExists,
  updateStudent,
  verifyGoogleCredentialToken,
  getStudentEnrolledCourses,
  getStudentNextWeekSessions,
  getStudentsService,
  assignHours,
  assignGroup,
  getStudentReportsService,
} from "../services/student.service";
import { compare } from "bcrypt";
import {
  addStudentCourse,
  addStudentCourseSubscriptionStatus,
  approvePaymobSubscription,
  approvePaypalSubscription,
  cancelStudentCourseSubscription,
  getCourse,
  getStudentCourse,
  getStudentSubscriptionDetails,
  initiatePaypalSubscription,
  makeFreeSubscription,
  revokeSubscription,
  savePaymobSubscription,
  savePaymobTransactionId,
} from "../services/course.service";
import {
  getRecordings,
  getSession,
  getSessions,
} from "../services/session.service";
import { SubscriptionMethod, SubscriptionStatus } from "@prisma/client";
import { getDate } from "../services/calendar.service";
import { JOIN_LINK_SHOW } from "../utils/constants.util";
import { serialize } from "../utils/helper.util";
import { getGroup } from "../services/group.service";
import {
  cancelPaymobSubscription,
  createPaymobPlan,
  createPaymobSubscription,
} from "../services/paymob.service";
import {
  cancelPaypalSubscription,
  createPaypalPlan,
  getPaypalSubscription,
} from "../services/paypal.service";

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const students = await getStudentsService();

    res.json({
      message: "Students Returned Successfully",
      data: {
        students,
      },
    });
  } catch (err: any) {
    console.log("ERROR: ", err);
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error",
    });
    next(err);
  }
};

export const getStudents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const students = await getStudentsService();

    const studentsWithCourses: typeof students = [];

    await Promise.allSettled(
      students.map(async (student) => {
        const courses = await getStudentEnrolledCourses(student.id);
        if (courses.length > 0) {
          studentsWithCourses.push(student);
        }
      })
    );

    res.json({
      message: "Students Returned Successfully",
      data: {
        students: studentsWithCourses,
      },
    });
  } catch (err: any) {
    console.log("ERROR: ", err);
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error",
    });
    next(err);
  }
};

export const assignHoursToStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const studentId = Number(req.params.studentId);
    const courseId = Number(req.params.courseId);
    const { hours } = req.body;

    if (!studentId || !courseId || hours == null) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data",
      });
      return;
    }

    const studentCourse = await getStudentCourse({
      studentId: studentId,
      courseId,
    });
    if (!studentCourse) {
      res.status(409).json({
        name: "USER_COURSE_DOESNT_EXIST",
        message: "This student has not applied for this course",
      });
      return;
    }

    if (!studentCourse.StudentCourseSubscription)
      throw "studentCourse.StudentCourseSubscription is undefined";

    const shouldRevokeSubscription =
      studentCourse.hours != null &&
      studentCourse.StudentCourseSubscription?.subscriptionStatus ==
        SubscriptionStatus.SUBSCRIBED;

    const updatedStudentCourse = await assignHours(studentCourse.id, hours);

    if (hours == 0) {
      await makeFreeSubscription(studentCourse.id);
    } else if (shouldRevokeSubscription) {
      await cancelStudentCourseSubscription(studentCourse.id);
      await revokeSubscription(studentCourse.id);
    }

    res.json({
      message: "Hours assigned to student successfully",
      data: {
        studentCourse: updatedStudentCourse,
      },
    });
  } catch (err: any) {
    console.log("ERROR: ", err);
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error",
    });
    next(err);
  }
};

export const getStudentReports = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const studentId = Number(req.params.studentId);
    const courseId = Number(req.params.courseId);

    if (!studentId || !courseId) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data",
      });
      return;
    }

    const studentCourse = await getStudentCourse({
      studentId: studentId,
      courseId,
    });
    if (!studentCourse) {
      res.status(409).json({
        name: "USER_COURSE_DOESNT_EXIST",
        message: "This student has not applied for this course",
      });
      return;
    }

    const reports = await getStudentReportsService(studentCourse.id, studentId);

    res.json({
      message: "Student reports returned successfully",
      data: {
        reports,
      },
    });
  } catch (err: any) {
    console.log("ERROR: ", err);
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error",
    });
    next(err);
  }
};

export const assignGroupToStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const studentId = Number(req.params.studentId);
    const courseId = Number(req.params.courseId);
    const { groupId } = req.body;

    if (!studentId || !courseId || !groupId) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data",
      });
      return;
    }

    const studentCourse = await getStudentCourse({
      studentId: studentId,
      courseId,
    });
    if (!studentCourse) {
      res.status(409).json({
        name: "USER_COURSE_DOESNT_EXIST",
        message: "This student has not applied for this course",
      });
      return;
    }

    const group = await getGroup({ courseId, id: groupId });
    if (!group) {
      res.status(409).json({
        name: "GROUP_DOESNT_EXIST",
        message: "Group doesn't exist or doesn't belong to this course",
      });
      return;
    }

    if (!studentCourse.StudentCourseSubscription)
      throw "studentCourse.StudentCourseSubscription is undefined";

    const shouldRevokeSubscription =
      studentCourse.groupId == null &&
      studentCourse.StudentCourseSubscription.subscriptionStatus ==
        SubscriptionStatus.SUBSCRIBED;

    const updatedStudentCourse = await assignGroup(studentCourse.id, groupId);

    if (shouldRevokeSubscription) {
      await cancelStudentCourseSubscription(studentCourse.id);
      await revokeSubscription(studentCourse.id);
    }

    res.json({
      message: "Group assigned to student successfully",
      data: {
        studentCourse: updatedStudentCourse,
      },
    });
  } catch (err: any) {
    console.log("ERROR: ", err);
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error",
    });
    next(err);
  }
};

export const convertStudentToPrivate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const studentId = Number(req.params.studentId);
    const courseId = Number(req.params.courseId);

    if (!studentId || !courseId) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data",
      });
      return;
    }

    const studentCourse = await getStudentCourse({
      studentId: studentId,
      courseId,
    });
    if (!studentCourse) {
      res.status(409).json({
        name: "USER_COURSE_DOESNT_EXIST",
        message: "This student has not applied for this course",
      });
      return;
    }

    if (studentCourse.groupId == null) {
      res.status(409).json({
        name: "USER_ALREADY_PRIVATE",
        message: "Student is already private in this course",
      });
      return;
    }

    if (!studentCourse.StudentCourseSubscription)
      throw "studentCourse.StudentCourseSubscription is undefined";

    const shouldRevokeSubscription =
      studentCourse.StudentCourseSubscription.subscriptionStatus ==
      SubscriptionStatus.SUBSCRIBED;

    const updatedStudentCourse = await assignGroup(studentCourse.id, null);

    if (shouldRevokeSubscription) {
      await cancelStudentCourseSubscription(studentCourse.id);
      await revokeSubscription(studentCourse.id);
    }

    res.json({
      message: "Student converted to private successfully",
      data: {
        studentCourse: updatedStudentCourse,
      },
    });
  } catch (err: any) {
    console.log("ERROR: ", err);
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error",
    });
    next(err);
  }
};

export const getStudentCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const studentId = Number(req.params.studentId);

    if (!studentId) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data",
      });
      return;
    }

    const courses = await getStudentEnrolledCourses(studentId);

    res.json({
      message: "Student Courses Returned Successfully",
      data: {
        courses,
      },
    });
  } catch (err: any) {
    console.log("ERROR: ", err);
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error",
    });
    next(err);
  }
};

export const getMe = (req: Request, res: Response, next: NextFunction) => {
  try {
    const student = res.locals.student;

    res.json({
      message: "Profile Retruned Successfully",
      data: {
        student,
      },
    });
  } catch (err: any) {
    console.log("ERROR: ", err);
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error",
    });
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (
      !email ||
      !password ||
      !validateEmail(email) ||
      !validatePassword(password)
    ) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data",
      });
      return;
    }

    const student = await getStudentByEmail(email);
    if (!student || !student.password) {
      res.status(404).json({
        name: "EMAIL_PASSWORD_INCORRECT",
        message: "Either the email or password is incorrect",
      });
      return;
    }

    const correct = await compare(password, student.password);
    if (!correct) {
      res.status(404).json({
        name: "EMAIL_PASSWORD_INCORRECT",
        message: "Either the email or password is incorrect",
      });
      return;
    }

    const { student: studentDetails, token } = await authenticateStudent(
      student.id,
      student.email
    );

    res.json({
      message: "Student Logged In Successfully",
      data: {
        token,
        student: studentDetails,
      },
    });
  } catch (err: any) {
    console.log("ERROR: ", err);
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error",
    });
    next(err);
  }
};

export const googleLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { mode, phoneNumber , code , credential } = req.body;

    if (!phoneNumber || !validatePhone(phoneNumber)) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data",
      });
      return;
    }

    const verificationResponse = await verifyGoogleCredentialToken(mode, code , credential);
    if (verificationResponse.error || !verificationResponse.payload) {
      res.status(400).json({
        name: "ERROR_VERIFING_GOOGLE",
        message: verificationResponse.error,
      });
      console.log(verificationResponse.error);
      return;
    }

    const { email, name } = verificationResponse.payload;
    if (!email || !name) {
      res.status(400).json({
        name: "GOOGLE_ACCOUNT_EMPTY",
        message: "This google account profile's name or email is empty",
      });
      return;
    }

    let data;
    if (!(await emailExists(email))) {
      const { id: studentId } = await createStudent(name, email, phoneNumber);
      data = await authenticateStudent(studentId, email);
    } else {
      const student = await getStudentByEmail(email);
      if (!student) {
        throw Error();
      }
      const { token } = await authenticateStudent(student.id, email);
      data = {
        student,
        token,
      };
    }

    res.json({
      message: "Student Logged In Successfully",
      data,
    });
  } catch (err: any) {
    console.log("ERROR: ", err);
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error",
    });
    next(err);
  }
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, phone, age, gender, location, password } = req.body;
    if (
      !name ||
      !validateString(name, 255, 4) ||
      !email ||
      !validateEmail(email) ||
      !phone ||
      !validatePhone(phone) ||
      !password ||
      !validatePassword(password) ||
      (gender && !validateGender(gender)) ||
      (age && !validateAge(age)) ||
      (location && !validateString(location, 255, 1))
    ) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data",
      });
      return;
    }

    if (await emailExists(email)) {
      res.status(409).json({
        name: "EMAIL_ALREADY_EXISTS",
        message: "Email already exists",
      });
      return;
    }

    if (await nameExists(name)) {
      res.status(409).json({
        name: "NAME_ALREADY_EXISTS",
        message: "Name already exists",
      });
      return;
    }

    const options: any = {};
    if (age != undefined) options.age = age != "" ? Number(age) : null;
    if (location) options.location = location != "" ? location : null;
    if (gender) options.gender = gender != "" ? gender : null;

    const { id: studentId } = await createStudent(
      name,
      email,
      phone,
      options,
      password
    );
    const { student, token } = await authenticateStudent(studentId, email);

    res.json({
      message: "Student Registered Successfully",
      data: {
        token,
        student,
      },
    });
  } catch (err: any) {
    console.log("ERROR: ", err);
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error",
    });
    next(err);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, age, phone, gender, location } = req.body;
    const { id: studentId } = res.locals.student;

    console.log("id");
    console.log(studentId);
    if (
      (name && !validateString(name, 255, 4)) ||
      (gender && !validateGender(gender)) ||
      (age && !validateAge(age)) ||
      (phone && !validatePhone(phone)) ||
      (location && !validateString(location, 255, 1))
    ) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data",
      });
      return;
    }

    if (name && (await nameExists(name))) {
      res.status(409).json({
        name: "NAME_ALREADY_EXISTS",
        message: "Name already exists",
      });
      return;
    }

    const data: any = {};
    if (name) data.name = name;
    if (phone) data.phone = phone;
    if (age != undefined) data.age = age != "" ? Number(age) : null;
    if (location) data.location = location != "" ? location : null;
    if (gender) data.gender = gender != "" ? gender : null;

    const student = await updateStudent(studentId, data);

    res.json({
      message: "Profile Updated Successfully",
      data: {
        student,
      },
    });
  } catch (err: any) {
    console.log("ERROR: ", err);
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error",
    });
    next(err);
  }
};

export const applyForCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId, availableTime, studentNotes, sessionType } = req.body;
    const { id: studentId, student } = res.locals;

    if (
      !courseId ||
      !availableTime ||
      !validateString(availableTime, 255, 1) ||
      (studentNotes && !validateString(studentNotes, 255, 0)) ||
      !sessionType ||
      !validateSessionType(sessionType)
    ) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data",
      });
      return;
    }

    const course = await getCourse({ id: courseId });
    if (!course) {
      res.status(409).json({
        name: "COURSE_DOESNT_EXIST",
        message: "No course with this id",
      });
      return;
    }

    if (await getStudentCourse({ studentId, courseId })) {
      res.status(409).json({
        name: "USER_COURSE_ALERADY_EXIST",
        message: "This student has already applied for this course",
      });
      return;
    }

    const studentCourse = await addStudentCourse(
      studentId,
      courseId,
      sessionType,
      availableTime,
      studentNotes
    );
    await addStudentCourseSubscriptionStatus(studentCourse.id);

    res.json({
      message: "Student applied for course successfully",
      data: {
        student,
        course,
        availableTime,
        studentNotes,
        preferredSessionType: sessionType,
      },
    });
  } catch (err: any) {
    console.log("ERROR: ", err);
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error",
    });
    next(err);
  }
};

export const getCourseSessions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const courseId = Number(req.params.courseId);
    const { id: studentId } = res.locals;

    if (!courseId) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data",
      });
      return;
    }

    const course = await getCourse({ id: courseId });
    if (!course) {
      res.status(409).json({
        name: "COURSE_DOESNT_EXIST",
        message: "No course with this id",
      });
      return;
    }

    const studentCourse = await getStudentCourse({ studentId, courseId });
    if (!studentCourse) {
      res.status(409).json({
        name: "USER_COURSE_DOESNT_EXIST",
        message: "This student has not applied for this course",
      });
      return;
    }

    const subscriptionStatus = await getStudentCourseSubscriptionStatus(
      studentCourse.id
    );

    const sessions = await Promise.all(
      (
        await getSessions({
          courseId,
        })
      ).map(async (session) => {
        const {
          id,
          description,
          isFree,
          status,
          sessionType,
          groupId,
          privateStudentId,
          title,
          startedAt,
        } = session;

        let report = null;
        const studentSession = await getStudentSession(studentId, session.id);
        if (studentSession) {
          const { notes, attendence, tardy, homeWork } = studentSession;
          report = { notes, attendence, tardy, homeWork };
        }

        const sessionDate = await getDate({
          id: session.calendarDateId,
        });

        let zoomLink = null;
        if (
          subscriptionStatus === SubscriptionStatus.SUBSCRIBED &&
          sessionDate.startDate.getTime() - new Date().getTime() <=
            JOIN_LINK_SHOW
        ) {
          zoomLink = course.zoomLink;
        }

        const recordings = (await getRecordings(session.id)) ?? [];
        const recordingsUuids: string[] = [];
        await Promise.allSettled(
          recordings.map(async (recording) => {
            recordingsUuids.push(
              subscriptionStatus == SubscriptionStatus.SUBSCRIBED
                ? recording.videoUuid
                : ""
            );
          })
        );

        return {
          id,
          description,
          isFree,
          status,
          sessionType,
          groupId,
          privateStudentId,
          title,
          report,
          zoomLink,
          startedAt,
          recordings: recordingsUuids,
        };
      })
    );

    res.json({
      message: "Course Sessions returned Successfully",
      data: {
        subscriptionStatus,
        sessions: serialize(sessions),
      },
    });
  } catch (err: any) {
    console.log("ERROR: ", err);
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error",
    });
    next(err);
  }
};

export const joinSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const courseId = Number(req.params.courseId);
    const sessionId = Number(req.params.sessionId);
    const { id: studentId } = res.locals.student;

    if (!sessionId || !courseId) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data",
      });
      return;
    }

    const course = await getCourse({ id: courseId });
    if (!course) {
      res.status(409).json({
        name: "COURSE_DOESNT_EXIST",
        message: "No course with this id",
      });
      return;
    }

    const studentCourse = await getStudentCourse({ studentId, courseId });
    if (!studentCourse) {
      res.status(409).json({
        name: "USER_COURSE_DOESNT_EXIST",
        message: "This student has not applied for this course",
      });
      return;
    }

    const session = await getSession(sessionId);
    if (!session) {
      res.status(409).json({
        name: "SESSION_DOESNT_EXIST",
        message: "No session with this id",
      });
      return;
    }

    const subscriptionStatus = await getStudentCourseSubscriptionStatus(
      studentCourse.id
    );

    if (
      subscriptionStatus != SubscriptionStatus.SUBSCRIBED &&
      !session.isFree
    ) {
      res.status(409).json({
        name: "CANT_JOIN",
        message: "Renew the subscription to join this meeting",
      });
      return;
    }

    const studentSession = await getStudentSession(studentId, sessionId);
    if (!studentSession) await createStudentSession(studentId, sessionId);

    res.json({
      message: "Student joined session Successfully",
      data: {},
    });
  } catch (err: any) {
    console.log("ERROR: ", err);
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error",
    });
    next(err);
  }
};

export const paypalIntention = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const courseId = Number(req.params.courseId);
    const { id: studentId, ...student } = res.locals.student;

    if (!courseId) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data",
      });
      return;
    }
    const course = await getCourse({ id: courseId });
    if (!course) {
      res.status(409).json({
        name: "COURSE_DOESNT_EXIST",
        message: "No course with this id",
      });
      return;
    }
    const studentCourse = await getStudentCourse({ studentId, courseId });
    if (!studentCourse) {
      res.status(409).json({
        name: "USER_COURSE_DOESNT_EXIST",
        message: "This student has not applied for this course",
      });
      return;
    }
    const subscriptionStatus = await getStudentCourseSubscriptionStatus(
      studentCourse.id
    );
    if (subscriptionStatus == SubscriptionStatus.SUBSCRIBED) {
      res.status(409).json({
        name: "ALREADY_SUBSCRIBED",
        message: "Student already subscribed to this course",
      });
      return;
    }

    console.log(course);
    if (!course.paypalProductId) throw "This course doesn't have product id";

    if (studentCourse.hours == null) {
      res.status(409).json({
        name: "HOURS_NOT_SPECIFIED",
        message: "The admin should specify the hours for the student first",
      });
      return;
    }

    const price = studentCourse.groupId
      ? studentCourse.hours * course.groupPrice
      : studentCourse.hours * course.privatePrice;

    const paypalPlanId = await createPaypalPlan(
      `${student.name} - ${course.name}`,
      course.paypalProductId,
      price
    );
    if (!paypalPlanId) throw Error("Error creating paypal plans");

    await initiatePaypalSubscription(studentCourse.id, paypalPlanId);

    res.json({
      message: "Paypal Subscription Intention Made Successfully",
      data: {
        paypalPlanId,
      },
    });
  } catch (err: any) {
    console.log("ERROR: ", err);
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error",
    });
    next(err);
  }
};

export const approvePaypal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const courseId = Number(req.params.courseId);
    const { id: studentId } = res.locals.student;
    const { subscriptionId } = req.body;

    if (!courseId || !subscriptionId) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data",
      });
      return;
    }
    const course = await getCourse({ id: courseId });
    if (!course) {
      res.status(409).json({
        name: "COURSE_DOESNT_EXIST",
        message: "No course with this id",
      });
      return;
    }
    const studentCourse = await getStudentCourse({ studentId, courseId });
    if (!studentCourse) {
      res.status(409).json({
        name: "USER_COURSE_DOESNT_EXIST",
        message: "This student has not applied for this course",
      });
      return;
    }
    const subscriptionStatus = await getStudentCourseSubscriptionStatus(
      studentCourse.id
    );
    if (subscriptionStatus == SubscriptionStatus.SUBSCRIBED) {
      res.status(409).json({
        name: "ALREADY_SUBSCRIBED",
        message: "Student already subscribed to this course",
      });
      return;
    }
    const subscription = await getPaypalSubscription(subscriptionId);
    if (subscription.status != "ACTIVE") {
      res.status(409).json({
        name: "SUBSCRIBTION_NOT_VALID",
        message: "This subscription is not valid",
      });
    }
    const alreadyUsed = await getStudentSubscriptionDetails({
      paypalSubscriptionId: subscriptionId,
    });
    if (alreadyUsed) {
      res.status(409).json({
        name: "SUBSCRIBTION_NOT_VALID",
        message: "This subscription is not valid",
      });
    }
    await approvePaypalSubscription(studentCourse.id, subscriptionId);
    res.json({
      message: "Subscription Completed Successfully",
      data: {},
    });
  } catch (err: any) {
    console.log("ERROR: ", err);
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error",
    });
    next(err);
  }
};

export const approvePaypalSandbox = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // try {
  //   const courseId = Number(req.params.courseId);
  //   const { id: studentId } = res.locals.student;
  //   const { subscriptionId } = req.body;
  //   if (!courseId || !subscriptionId) {
  //     res.status(400).json({
  //       name: "INVALID_PAYLOAD",
  //       message: "Invalid payload data",
  //     });
  //     return;
  //   }
  //   const course = await getCourse({ id: courseId });
  //   if (!course) {
  //     res.status(409).json({
  //       name: "COURSE_DOESNT_EXIST",
  //       message: "No course with this id",
  //     });
  //     return;
  //   }
  //   console.log(studentId);
  //   const studentCourse = await getStudentCourse(studentId, courseId);
  //   if (!studentCourse) {
  //     res.status(409).json({
  //       name: "USER_COURSE_DOESNT_EXIST",
  //       message: "This student has not applied for this course",
  //     });
  //     return;
  //   }
  //   await approvePaypalSubscriptionSandBox(studentCourse.id);
  //   res.json({
  //     message: "Subscription Completed Successfully",
  //     data: {},
  //   });
  // } catch (err: any) {
  //   console.log("ERROR: ", err);
  //   res.status(500).json({
  //     name: "INTERNAL_SERVER_ERROR",
  //     message: "Internal Server Error",
  //   });
  //   next(err);
  // }
};

export const paymobIntention = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const courseId = Number(req.params.courseId);
    const { id: studentId, ...student } = res.locals.student;
    if (!courseId) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data",
      });
      return;
    }
    const course = await getCourse({ id: courseId });
    if (!course) {
      res.status(409).json({
        name: "COURSE_DOESNT_EXIST",
        message: "No course with this id",
      });
      return;
    }
    const studentCourse = await getStudentCourse({ studentId, courseId });
    if (!studentCourse) {
      res.status(409).json({
        name: "USER_COURSE_DOESNT_EXIST",
        message: "This student has not applied for this course",
      });
      return;
    }
    const subscriptionStatus = await getStudentCourseSubscriptionStatus(
      studentCourse.id
    );
    if (subscriptionStatus == SubscriptionStatus.SUBSCRIBED) {
      res.status(409).json({
        name: "ALREADY_SUBSCRIBED",
        message: "Student already subscribed to this course",
      });
      return;
    }

    if (studentCourse.hours == null) {
      res.status(409).json({
        name: "HOURS_NOT_SPECIFIED",
        message: "The admin should specify the hours for the student first",
      });
      return;
    }

    const price = studentCourse.groupId
      ? studentCourse.hours * course.groupPrice
      : studentCourse.hours * course.privatePrice;
    const paymobPlanId = await createPaymobPlan(student.name, price);
    if (!paymobPlanId) throw Error("Error creating paymob plan");
    console.log(paymobPlanId);

    const subscription = await createPaymobSubscription(
      student.name,
      student.email,
      price,
      paymobPlanId
    );
    if (!subscription) throw Error("Error while creating subscription intent");

    await savePaymobSubscription(
      studentCourse.id,
      paymobPlanId,
      subscription.id
    );
    res.json({
      message: "Subscription Intention Completed Successfully",
      data: {
        clientSecret: subscription.client_secret,
      },
    });
  } catch (err: any) {
    console.log("ERROR: ", err);
    console.log(err.response.data);
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error",
    });
    next(err);
  }
};

export const paymobResponse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const obj = req.body.obj;

    if (!obj.success) {
      console.log("FAILED PAYMOB PAYMENT");
      console.log(req.body.obj);
    }

    savePaymobTransactionId(obj.payment_key_claims.next_payment_intention, req.body.obj.id);
  } catch (err: any) {
    console.log("ERROR: ", err);
  }
};

export const subscriptionWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(req.body);
    const {subscription_data} = req.body;

    if(subscription_data.state == "active") {
      approvePaymobSubscription(req.body.transaction_id, subscription_data.id);
    }
    
  } catch (err: any) {
    console.log("ERROR: ", err);
  }
};

export const getMyCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: studentId , preferredSessionType:preferredSessionType } = res.locals.student;

    let enrolledCourses = await getStudentEnrolledCourses(studentId);
    let enrolledCoursesWithStatus: ((typeof enrolledCourses)[number] & {
      subscriptionStatus: SubscriptionStatus;
    })[] = [];

    await Promise.allSettled(enrolledCourses.map(async (studentCourse) => {
      enrolledCoursesWithStatus.push({
        ...studentCourse,
        subscriptionStatus: await getStudentCourseSubscriptionStatus(
          studentCourse.studentCourseId
        ),
      });
    }));
    
    res.json({
      message: "Enrolled Courses Retreived Successfully",
      data: {
        preferredSessionType,
        courses: enrolledCoursesWithStatus,
      },
    });
  } catch (err: any) {
    console.log("ERROR: ", err);
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error",
    });
    next(err);
  }
};

export const nextWeekSessions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: studentId } = res.locals.student;

    const nextWeekSessions = await getStudentNextWeekSessions(studentId);

    const serializedSessions = serialize(nextWeekSessions);

    res.json({
      message: "Next Week Sessions Retrieved Successfully",
      data: {
        sessions: serializedSessions,
      },
    });
  } catch (err: any) {
    console.log("ERROR: ", err);
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error",
    });
    next(err);
  }
};
