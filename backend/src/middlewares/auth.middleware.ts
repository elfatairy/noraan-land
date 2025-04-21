import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { ROLES } from "../utils/constants.util";
import {
  getStudentById,
  getStudentCourseSubscriptionStatus,
} from "../services/student.service";
import { getStudentCourse } from "../services/course.service";

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) {
      res.status(400).json({
        name: "UNAUTHENTICATED",
        message:
          "Student is unauthenticated and this request requires authentication",
      });
      return;
    }

    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY ?? ""
    ) as jwt.JwtPayload;

    if (!decodedToken.exp || new Date().getTime() / 1000 > decodedToken.exp) {
      res.status(400).json({
        name: "TOKEN_EXPIRED",
        message:
          "The token you are using expird, please log in again to retrieve another token.",
      });
      return;
    }

    const { iat, exp, ...tokenData } = decodedToken;
    res.locals = { ...res.locals, ...tokenData };
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(400).json({
        name: "TOKEN_EXPIRED",
        message:
          "The token you are using expird, please log in again to retrieve another token.",
      });
      return;
    }

    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error",
    });
    next(err);
  }
};

export const parseTokenIfAny = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) {
      next();
      return;
    }

    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY ?? ""
    ) as jwt.JwtPayload;

    if (!decodedToken.exp || new Date().getTime() / 1000 > decodedToken.exp) {
      next();
      return;
    }

    const { iat, exp, ...tokenData } = decodedToken;
    res.locals = { ...res.locals, ...tokenData };
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      next();
      return;
    }

    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error",
    });
    next(err);
  }
};

export const checkAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = res.locals.role;
    if (role == null || role != ROLES.ADMIN) {
      res.status(400).json({
        name: "UNAUTHORIZED",
        message: "This request needs permessions the student doesn't have",
      });
      return;
    }

    next();
  } catch (err) {
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error",
    });
    next(err);
  }
};

export const checkStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, role } = res.locals;
    if (role == null || id == null || role != ROLES.USER) {
      res.status(400).json({
        name: "UNAUTHORIZED",
        message: "This request needs permessions the student doesn't have",
      });
      return;
    }
    const studentExists = await getStudentById(res.locals.id);
    if (!studentExists) {
      res.status(400).json({
        name: "UNAUTHORIZED",
        message: "This request needs permessions the student doesn't have",
      });
      return;
    }
    const { password, ...student } = studentExists;
    res.locals.student = student;

    next();
  } catch (err) {
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error",
    });
    next(err);
  }
};

export const checkSubscribed = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, role, courseId } = res.locals;

    if (role == ROLES.ADMIN) {
      next();
      return;
    }

    if (role == null || id == null) {
      res.status(400).json({
        name: "UNAUTHORIZED",
        message: "This request needs permessions the student doesn't have",
      });
      return;
    }

    if (!courseId) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data",
      });
      return;
    }

    const studentExists = await getStudentById(id);
    if (!studentExists) {
      res.status(400).json({
        name: "UNAUTHORIZED",
        message: "This request needs permessions the student doesn't have",
      });
      return;
    }

    const studentCourse = await getStudentCourse({ studentId: id, courseId });
    if (
      !studentCourse ||
      (await getStudentCourseSubscriptionStatus(studentCourse.id)) ==
        "UNSUBSCRIBED"
    ) {
      res.status(400).json({
        name: "UNSUBSCRIBED",
        message:
          "Student is unsubscribed for this course and so can't view this",
      });
      return;
    }

    const { password, ...student } = studentExists;
    res.locals.student = student;

    next();
  } catch (err) {
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error",
    });
    next(err);
  }
};
