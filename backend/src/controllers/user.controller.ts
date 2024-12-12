import { NextFunction, Request, Response } from "express";
import { validateEmail, validateName, validatePassword, validateSessionType, validateString } from "../utils/validation.util";
import { authenticateUser, createUser, emailExists, getUserByEmail, nameExists, verifyGoogleToken } from "../services/user.service";
import { compare } from "bcrypt";
import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import { addCourseUser, getCourse, getCourseUser } from "../services/course.service";

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
    const { name, email, password } = req.body;
    if (!name || !validateString(name, 255, 4) ||
      !email || !validateEmail(email) ||
      !password || !validatePassword(password)) {

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

    const { id: userId } = await createUser(name, email, password);
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

    if (await getCourseUser(userId, courseId)) {
      res.status(409).json({
        name: "USER_COURSE_ALERADY_EXIST",
        message: "This user has already applied for this course"
      });
      return;
    }

    await addCourseUser(userId, courseId, sessionType, availableTime, userNotes);

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