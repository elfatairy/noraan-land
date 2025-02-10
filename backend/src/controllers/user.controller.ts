import { NextFunction, Request, Response } from "express";
import { validateAge, validateEmail, validateGender, validateName, validatePassword, validateSessionType, validateString } from "../utils/validation.util";
import { authenticateUser, createUser, createUserSession, emailExists, getUserByEmail, getUserSession, getUserCourseSubscriptionStatus, nameExists, updateUser, verifyGoogleToken, getUserEnrolledCourses, getUserNextWeekSessions } from "../services/user.service";
import { compare } from "bcrypt";
import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import { addUserCourse, addUserCourseSubscriptionStatus, approvePaypalSubscription, approvePaypalSubscriptionSandBox, getCourse, getPaymentDetails, getUserCourse, getUserSubscriptionDetails, savePaymobSubscription } from "../services/course.service";
import { getRecordings, getSession, getSessions } from "../services/session.service";
import { IndividualSession, SessionStatus, SessionType, SubscriptionStatus } from "@prisma/client";
import { getDateSession } from "../services/calendar.service";
import { getZoomAccessToken, getMeeting } from "../services/zoom.service";
import { getPaypalAccessToken, getPaypalSubscription } from "../services/paypal.service";
import { prisma } from "../configs/db.config";
import { createPaymobSubscription } from "../services/paymob.service";

// Helper function to serialize BigInt values
const serializeBigInt = (data: any) => {
  return JSON.parse(JSON.stringify(data, (_, value) => 
    typeof value === 'bigint' ? value.toString() : value
  ));
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password || !validateEmail(email) || !validatePassword(password)) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data"
      });
      return;
    }

    const user = await getUserByEmail(email);
    if (!user || !user.password) {
      res.status(404).json({
        name: "EMAIL_PASSWORD_INCORRECT",
        message: "Either the email or password is incorrect"
      });
      return;
    }

    const correct = await compare(password, user.password);
    if (!correct) {
      res.status(404).json({
        name: "EMAIL_PASSWORD_INCORRECT",
        message: "Either the email or password is incorrect"
      });
      return;
    }

    const { user: userDetails, token } = await authenticateUser(user.id, user.email);

    res.json({
      message: "User Logged In Successfully",
      data: {
        token,
        user: userDetails
      }
    })

  } catch (err: any) {
    console.log("ERROR: ", err);
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error"
    });
    next(err);
  }
}

export const googleLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idToken } = req.body;

    const verificationResponse = await verifyGoogleToken(idToken);
    if (verificationResponse.error || !verificationResponse.payload) {
      res.status(400).json({
        name: "ERROR_VERIFING_GOOGLE",
        message: verificationResponse.error
      })
      return;
    }

    const { email, name } = verificationResponse.payload;
    if (!email || !name) {
      res.status(400).json({
        name: "GOOGLE_ACCOUNT_EMPTY",
        message: "This google account profile's name or email is empty"
      })
      return;
    }

    let data;
    if (!(await emailExists(email))) {
      const { id: userId } = await createUser(name, email);
      data = await authenticateUser(userId, email);
    } else {
      const user = await getUserByEmail(email);
      if (!user) {
        throw Error()
      }
      const { token } = await authenticateUser(user.id, email);
      data = {
        user, token
      }
    }

    res.json({
      message: "User Logged In Successfully",
      data
    })

  } catch (err: any) {
    console.log("ERROR: ", err);
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error"
    });
    next(err);
  }
}

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, age, gender, location, password } = req.body;
    if (!name || !validateString(name, 255, 4) ||
      !email || !validateEmail(email) ||
      !password || !validatePassword(password) ||
      (gender && !validateGender(gender)) ||
      (age && !validateAge(age)) ||
      (location && !validateString(location, 255, 1))) {

      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data"
      });
      return;
    }

    if (await emailExists(email)) {
      res.status(409).json({
        name: "EMAIL_ALREADY_EXISTS",
        message: "Email already exists"
      });
      return;
    }

    if (await nameExists(name)) {
      res.status(409).json({
        name: "NAME_ALREADY_EXISTS",
        message: "Name already exists"
      });
      return;
    }

    const options: any = {};
    if(age) 
      options.age = age;
    if(location) 
      options.location = location;
    if(gender) 
      options.gender = gender;

    const { id: userId } = await createUser(name, email, options, password);
    const { user, token } = await authenticateUser(userId, email);

    res.json({
      message: "User Registered Successfully",
      data: {
        token,
        user
      }
    })

  } catch (err: any) {
    console.log("ERROR: ", err);
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error"
    });
    next(err);
  }
}

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, age, gender, location } = req.body;
    const { id: userId } = res.locals.user;

    console.log("id");
    console.log(userId);
    if ((name && !validateString(name, 255, 4)) ||
      (gender && !validateGender(gender)) ||
      (age && !validateAge(age)) ||
      (location && !validateString(location, 255, 1))) {

      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data"
      });
      return;
    }

    if (name && await nameExists(name)) {
      res.status(409).json({
        name: "NAME_ALREADY_EXISTS",
        message: "Name already exists"
      });
      return;
    }

    const data: any = {};
    if(name) 
      data.name = name;
    if(age) 
      data.age = age;
    if(location) 
      data.location = location;
    if(gender) 
      data.gender = gender;

    const user = await updateUser(userId, data);

    res.json({
      message: "Profile Updated Successfully",
      data: {
        user
      }
    })

  } catch (err: any) {
    console.log("ERROR: ", err);
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error"
    });
    next(err);
  }
}

export const applyForCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { courseId, availableTime, userNotes, sessionType } = req.body;
    const { id: userId, user } = res.locals;

    if (!courseId ||
      !availableTime || !validateString(availableTime, 255, 1) ||
      (userNotes && !validateString(userNotes, 255, 0)) ||
      !sessionType || !validateSessionType(sessionType)
    ) {

      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data"
      });
      return;
    }

    const course = await getCourse({ id: courseId });
    if (!course) {
      res.status(409).json({
        name: "COURSE_DOESNT_EXIST",
        message: "No course with this id"
      });
      return;
    }

    if (await getUserCourse(userId, courseId)) {
      res.status(409).json({
        name: "USER_COURSE_ALERADY_EXIST",
        message: "This user has already applied for this course"
      });
      return;
    }

    const userCourse = await addUserCourse(userId, courseId, sessionType, availableTime, userNotes);
    await addUserCourseSubscriptionStatus(userCourse.id);

    res.json({
      message: "User applied for course successfully",
      data: {
        user,
        course,
        availableTime,
        userNotes
      }
    })

  } catch (err: any) {
    console.log("ERROR: ", err);
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error"
    });
    next(err);
  }
}

export const getCourseSessions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courseId = Number(req.params.courseId);
    const { id: userId } = res.locals;

    if (!courseId) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data"
      });
      return;
    }

    const course = await getCourse({ id: courseId });
    if (!course) {
      res.status(409).json({
        name: "COURSE_DOESNT_EXIST",
        message: "No course with this id"
      });
      return;
    }

    const userCourse = await getUserCourse(userId, courseId);
    if (!userCourse) {
      res.status(409).json({
        name: "USER_COURSE_DOESNT_EXIST",
        message: "This user has not applied for this course"
      });
      return;
    }

    console.log(userCourse)
    const subscriptionStatus = await getUserCourseSubscriptionStatus(userCourse.id);

    const sessions = await Promise.all(
      (await getSessions({
        courseId
      }, userCourse.sessionType)).map(async session => {
        const { id, description, isFree, status, title, startedAt } = session;
        let teacherNotes = "";
        if (userCourse.sessionType == SessionType.INDIVIDUAL) {
          teacherNotes = (<IndividualSession>session).notes ?? "";
        } else if (userCourse.sessionType == SessionType.GROUP) {
          const userSession = await getUserSession(userId, session.id);
          if(userSession) {
            teacherNotes = userSession.notes ?? "";
          }
        }

        const recordings = await getRecordings(session.id, userCourse.sessionType) ?? [];
        const recordingsGuids: string[] = [];
        await Promise.allSettled(recordings.map(async recording => {
          recordingsGuids.push(subscriptionStatus == SubscriptionStatus.SUBSCRIBED ? recording.bunnyGuid : "")
        }));
        
        return { id, description, isFree, status, title, teacherNotes, startedAt, recordings: recordingsGuids };
      })
    );

    res.json({
      message: "Course Sessions returned Successfully",
      data: {
        subscriptionStatus,
        sessions: JSON.parse(JSON.stringify(sessions, (_, v) => typeof v === 'bigint' ? v.toString() : v))
      }
    })

  } catch (err: any) {
    console.log("ERROR: ", err);
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error"
    });
    next(err);
  }
}

export const joinSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courseId = Number(req.params.courseId);
    const sessionId = Number(req.params.sessionId);
    const { id: userId } = res.locals.user;

    if (!sessionId || !courseId) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data"
      });
      return;
    }

    const course = await getCourse({ id: courseId });
    if (!course) {
      res.status(409).json({
        name: "COURSE_DOESNT_EXIST",
        message: "No course with this id"
      });
      return;
    }

    console.log(userId);
    const userCourse = await getUserCourse(userId, courseId);
    if (!userCourse) {
      res.status(409).json({
        name: "USER_COURSE_DOESNT_EXIST",
        message: "This user has not applied for this course"
      });
      return;
    }

    const session = await getSession(sessionId, userCourse.sessionType);
    console.log(session);
    if (!session) {
      res.status(409).json({
        name: "SESSION_DOESNT_EXIST",
        message: "No session with this id"
      });
      return;
    }

    const subscriptionStatus = await getUserCourseSubscriptionStatus(userCourse.id);

    if (subscriptionStatus != SubscriptionStatus.SUBSCRIBED && !session.isFree) {
      res.status(409).json({
        name: "CANT_JOIN",
        message: "Renew the subscription to join this meeting"
      });
      return;
    }

    if (session.status != SessionStatus.RUNNING || !session.meetingId) {
      res.status(409).json({
        name: "MEETING_NOT_RUNNING",
        message: "This meeting is not running now"
      });
      return;
    }

    const accessToken = await getZoomAccessToken();
    const { join_url } = await getMeeting(accessToken, session.meetingId);

    if (userCourse.sessionType == SessionType.GROUP) {
      const userSession = await getUserSession(userId, sessionId);
      if(!userSession)
        await createUserSession(userId, sessionId);
    }

    res.json({
      message: "User joined session Successfully",
      data: {
        join_url
      }
    })

  } catch (err: any) {
    console.log("ERROR: ", err);
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error"
    });
    next(err);
  }
}

export const approvePaypal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courseId = Number(req.params.courseId);
    const { id: userId } = res.locals.user;
    const { subscriptionId } = req.body;

    if (!courseId || !subscriptionId) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data"
      });
      return;
    }

    const course = await getCourse({ id: courseId });
    if (!course) {
      res.status(409).json({
        name: "COURSE_DOESNT_EXIST",
        message: "No course with this id"
      });
      return;
    }

    console.log(userId);
    const userCourse = await getUserCourse(userId, courseId);
    if (!userCourse) {
      res.status(409).json({
        name: "USER_COURSE_DOESNT_EXIST",
        message: "This user has not applied for this course"
      });
      return;
    }

    const subscriptionStatus = await getUserCourseSubscriptionStatus(userCourse.id);

    if (subscriptionStatus == SubscriptionStatus.SUBSCRIBED) {
      res.status(409).json({
        name: "ALREADY_SUBSCRIBED",
        message: "User already subscribed to this course"
      });
      return;
    }

    const accessToken = await getPaypalAccessToken();
    const subscription = await getPaypalSubscription(subscriptionId, accessToken);

    if(subscription.status != 'ACTIVE') {
      res.status(409).json({
        name: "SUBSCRIBTION_NOT_VALID",
        message: "This subscription is not valid"
      })
    }

    const alreadyUsed = await getUserSubscriptionDetails({ paypalSubscriptionId: subscriptionId });
    if(alreadyUsed) {
      res.status(409).json({
        name: "SUBSCRIBTION_NOT_VALID",
        message: "This subscription is not valid"
      })
    }

    await approvePaypalSubscription(userCourse.id, subscriptionId);

    res.json({
      message: "Subscription Completed Successfully",
      data: {
      }
    })

  } catch (err: any) {
    console.log("ERROR: ", err);
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error"
    });
    next(err);
  }
}

export const approvePaypalSandbox = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courseId = Number(req.params.courseId);
    const { id: userId } = res.locals.user;
    const { subscriptionId } = req.body;

    if (!courseId || !subscriptionId) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data"
      });
      return;
    }

    const course = await getCourse({ id: courseId });
    if (!course) {
      res.status(409).json({
        name: "COURSE_DOESNT_EXIST",
        message: "No course with this id"
      });
      return;
    }

    console.log(userId);
    const userCourse = await getUserCourse(userId, courseId);
    if (!userCourse) {
      res.status(409).json({
        name: "USER_COURSE_DOESNT_EXIST",
        message: "This user has not applied for this course"
      });
      return;
    }

    await approvePaypalSubscriptionSandBox(userCourse.id);

    res.json({
      message: "Subscription Completed Successfully",
      data: {
      }
    })

  } catch (err: any) {
    console.log("ERROR: ", err);
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error"
    });
    next(err);
  }
}

export const paymobIntention = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courseId = Number(req.params.courseId);
    const { id: userId, ...user } = res.locals.user;
  
    if (!courseId) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data"
      });
      return;
    }

    const course = await getCourse({ id: courseId });
    if (!course) {
      res.status(409).json({
        name: "COURSE_DOESNT_EXIST",
        message: "No course with this id"
      });
      return;
    }

    const userCourse = await getUserCourse(userId, courseId);
    if (!userCourse) {
      res.status(409).json({
        name: "USER_COURSE_DOESNT_EXIST",
        message: "This user has not applied for this course"
      });
      return;
    }

    const subscriptionStatus = await getUserCourseSubscriptionStatus(userCourse.id);

    if (subscriptionStatus == SubscriptionStatus.SUBSCRIBED) {
      res.status(409).json({
        name: "ALREADY_SUBSCRIBED",
        message: "User already subscribed to this course"
      });
      return;
    }

    const paymentDetails = await getPaymentDetails(course.id);
    const planId = userCourse.sessionType == SessionType.GROUP ? paymentDetails.paymobGroupPlanId : paymentDetails.paymobIndividualPlanId;
    if(!planId) throw Error("Plan id not found");

    const subscription = await createPaymobSubscription(user.name, 
      user.email, 
      userCourse.sessionType == SessionType.GROUP ? course.groupPrice! : course.individualPrice!, 
      planId);
    if(!subscription) throw Error("Error while creating subscription intent");

    await savePaymobSubscription(userCourse.id, subscription.id);

    res.json({
      message: "Subscription Intention Completed Successfully",
      data: {
        clientSecret: subscription.client_secret
      }
    })

  } catch (err: any) {
    console.log("ERROR: ", err);
    console.log(err.response.data);
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error"
    });
    next(err);
  }
}

export const paymobResponse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("PAYMOB Response params:");
    console.log(req.query);

    res.status(200).end();
  } catch (err: any) {
    console.log("ERROR: ", err);
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error"
    });
    next(err);
  }
}

export const getUserCourses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: userId } = res.locals.user;

    const enrolledCourses = await getUserEnrolledCourses(userId);

    res.json({
      message: "Enrolled Courses Retreived Successfully",
      data: {
        courses: enrolledCourses
      }
    })

  } catch (err: any) {
    console.log("ERROR: ", err);
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error"
    });
    next(err);
  }
}

export const nextWeekSessions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: userId } = res.locals.user;

    const nextWeekSessions = await getUserNextWeekSessions(userId);
    
    // Serialize the sessions before sending the response
    const serializedSessions = serializeBigInt(nextWeekSessions);

    res.json({
      message: "Enrolled Courses Retrieved Successfully",
      data: {
        sessions: serializedSessions
      }
    });

  } catch (err: any) {
    console.log("ERROR: ", err);
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error"
    });
    next(err);
  }
}