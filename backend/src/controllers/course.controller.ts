import { NextFunction, Request, Response } from "express";
import { validateEmail, validateName, validatePassword } from "../utils/validation.util";
import { authenticateUser, createUser, emailExists, getUserByEmail, nameExists, verifyGoogleToken } from "../services/user.service";
import bcrypt, { compare } from "bcrypt";
import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import { generateToken } from "../utils/token.util";
import { courseExists, createCourse, getAllCourses, getCourse } from "../services/course.service";

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, individualPrice, groupPrice } = req.body;
    if (!name) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data"
      });
      return;
    }

    if(!individualPrice && !groupPrice) {
      res.status(400).json({
        name: "REQUIRED_PRICE",
        message: "At least one of group price / individual price should have a value"
      });
      return;
    }
    
    const courseExistsRes = await courseExists({ name });
    if(courseExistsRes) {
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
    
    const courseExistsRes = await courseExists({ id: Number(id) });
    if(!courseExistsRes) {
      res.status(409).json({
        name: "COURSE_DOESNT_EXIST",
        message: "No course with this id"
      });
      return;
    }

    const course = (await getCourse(Number(id)))!;

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