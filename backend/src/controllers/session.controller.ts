import { NextFunction, Request, Response } from "express";
import { validateDate, validateEmail, validateName, validatePassword, validateQuizesLink, validateSessionType, validateString } from "../utils/validation.util";
import { authenticateUser, createUser, emailExists, getUserByEmail, nameExists, userExists, verifyGoogleToken } from "../services/user.service";
import { createCourse, getAllCourses, getCourse, getCourseUser } from "../services/course.service";
import { createGroupSessionService, createIndividualSessionService } from "../services/session.service";
import { isDateAvailable } from "../services/calendar.service";
import { SessionType } from "@prisma/client";

export const createGroupSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { courseId, title, description, quizzesLink, date, duration, isFree = false } = req.body;
    if (!courseId || !title || !date || !validateDate(date) || !duration || (description && !validateString(description, 255, 0)) || (quizzesLink && (quizzesLink && !validateString(quizzesLink, 255, 0)))) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data"
      });
      return;
    }

    const courseExistsRes = await getCourse({ id: courseId });
    if (!courseExistsRes) {
      res.status(409).json({
        name: "COURSE_DOESNT_EXIST",
        message: "No course with this id"
      });
      return;
    }

    const dateAvailable = await isDateAvailable(date, duration);
    if (!dateAvailable) {
      res.status(409).json({
        name: "DATE_NOT_AVAILABLE",
        message: "This date is not available, please choose another date/duration"
      });
      return;
    }

    if (quizzesLink && !validateQuizesLink(quizzesLink)) {
      res.status(400).json({
        name: "QUIZES_NOT_VALID",
        message: "The quizes link isn't a valid link"
      });
      return;
    }

    const createdSession = await createGroupSessionService(courseId, title, date, duration, isFree, quizzesLink, description);
    res.json({
      message: "Session created successfully",
      data: {
        session: createdSession
      }
    })

    throw Error("Shouldn't happen");

  } catch (err: any) {
    console.log("ERROR: ", err);
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error"
    });
    next(err);
  }
}

export const createIndividualSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { courseId, userId, title, description, quizzesLink, date, duration, isFree = false } = req.body;
    if (!courseId || !userId || !title || !date || !validateDate(date) || !duration || (description && !validateString(description, 255, 0)) || (quizzesLink && !validateString(quizzesLink, 255, 0))) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data"
      });
      return;
    }

    const courseExistsRes = await getCourse({ id: courseId });
    if (!courseExistsRes) {
      res.status(409).json({
        name: "COURSE_DOESNT_EXIST",
        message: "No course with this id"
      });
      return;
    }

    const userExistsRes = await userExists({ id: userId });
    if (!userExistsRes) {
      res.status(409).json({
        name: "USER_DOESNT_EXIST",
        message: "No user with this id"
      });
      return;
    }

    const courseUser = await getCourseUser(userId, courseId);
    if(courseUser == null) {
      res.status(409).json({
        name: "USER_COURSE_DOESNT_EXIST",
        message: "This user hasn't applier for this course yet"
      });
      return;
    }
    if(courseUser.sessionType != SessionType.INDIVIDUAL) {
      res.status(409).json({
        name: "NOT_INDIVIDUAL",
        message: "Can't scedule individual session for user unless he applied as individual"
      });
      return;
    }

    const dateAvailable = await isDateAvailable(date, duration);
    if (!dateAvailable) {
      res.status(409).json({
        name: "DATE_NOT_AVAILABLE",
        message: "This date is not available, please choose another date/duration"
      });
      return;
    }

    if (quizzesLink && !validateQuizesLink(quizzesLink)) {
      res.status(400).json({
        name: "QUIZES_NOT_VALID",
        message: "The quizes link isn't a valid link"
      });
      return;
    }

    const createdSession = await createIndividualSessionService(courseId, userId, title, date, duration, isFree, quizzesLink, description);
    res.json({
      message: "Session created successfully",
      data: {
        session: createdSession
      }
    })

    throw Error("Shouldn't happen");

  } catch (err: any) {
    console.log("ERROR: ", err);
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error"
    });
    next(err);
  }
}

export const getWithId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data"
      });
      return;
    }

    const courseExistsRes = await getCourse({ id: Number(id) });
    if (!courseExistsRes) {
      res.status(409).json({
        name: "COURSE_DOESNT_EXIST",
        message: "No course with this id"
      });
      return;
    }

    const course = (await getCourse({ id: Number(id) }))!;

    res.json({
      message: "Courses retrieved successfully",
      data: {
        course
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

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courses = await getAllCourses();

    res.json({
      message: "Courses retrieved successfully",
      data: {
        courses
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