import { NextFunction, Request, Response } from "express";
import { validateEmail, validateName, validatePassword, validateString } from "../utils/validation.util";
import { authenticateUser, createUser, emailExists, getUserByEmail, nameExists, verifyGoogleToken } from "../services/user.service";
import bcrypt, { compare } from "bcrypt";
import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import { generateToken } from "../utils/token.util";
import { getCourse, createCourse, getAllCourses, getCourseUsers, viewCourseUser } from "../services/course.service";
import { SessionType } from "@prisma/client";

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, individualPrice, groupPrice } = req.body;
    if (!name || (description && (description && (description && !validateString(description, 255, 0))))) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data"
      });
      return;
    }

    if (!individualPrice && !groupPrice) {
      res.status(400).json({
        name: "REQUIRED_PRICE",
        message: "At least one of group price / individual price should have a value"
      });
      return;
    }

    const courseExistsRes = await getCourse({ name });
    if (courseExistsRes) {
      res.status(409).json({
        name: "COURSE_ALREADY_EXISTS",
        message: "This course name is already used, use a different one"
      });
      return;
    }

    const createdCourse = await createCourse(name, groupPrice, individualPrice, description);

    res.json({
      message: "Courese created successfully",
      data: {
        course: createdCourse
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

export const newUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courseId = Number(req.params.courseId);
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

    const lastWeekDate = new Date(new Date().getTime() - 604800000);
    const courseUsers = await getCourseUsers(courseId, {
      OR: [
        { viewedByAdmin: false },
        { createdAt: { gt: lastWeekDate } }
      ]
    }) ?? [];

    await Promise.all(courseUsers?.map(async courseUser => {
      await viewCourseUser(courseId, courseUser.userId);
    }))

    res.json({
      message: "New Course users retrieved successfully",
      data: {
        unviewedUsers: courseUsers
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

export const groupUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courseId = Number(req.params.courseId);
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

    const courseUsers = await getCourseUsers(courseId, {
      sessionType: SessionType.GROUP
    }) ?? [];

    res.json({
      message: "Course users retrieved successfully",
      data: {
        courseUsers
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


export const individualUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courseId = Number(req.params.courseId);
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

    const courseUsers = await getCourseUsers(courseId, {
      sessionType: SessionType.INDIVIDUAL
    }) ?? [];

    res.json({
      message: "Course users retrieved successfully",
      data: {
        courseUsers
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