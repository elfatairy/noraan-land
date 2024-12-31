import { NextFunction, Request, Response } from "express";
import { validateEmail, validateName, validatePassword } from "../utils/validation.util";
import { authenticateUser, createUser, emailExists, getUserByEmail, getUserSession, nameExists, verifyGoogleToken } from "../services/user.service";
import bcrypt, { compare } from "bcrypt";
import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import { generateToken } from "../utils/token.util";
import { ROLES } from "../utils/constants.util";
import { getCourse, getCourseUser } from "../services/course.service";
import { getRecordings, getSessions } from "../services/session.service";
import { IndividualSession, SessionType } from "@prisma/client";

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data"
      });
      return;
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD!, salt);

    const correctPass = await compare(password, hashedPassword);
    const correctUserName = username == process.env.ADMIN_USERNAME;
    if (!correctPass || !correctUserName) {
      res.status(404).json({
        name: "USERNAME_PASSWORD_INCORRECT",
        message: "Either the username or password is incorrect"
      });
      return;
    }
    const token = generateToken({ username, role: ROLES.ADMIN }, process.env.JWT_EXPIRY ?? '7d');

    res.json({
      message: "Admin Logged In Successfully",
      data: {
        token
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
    const sessions = await Promise.all(
      (await getSessions({
        courseId
      }, SessionType.GROUP)).map(async session => {
        const { id, description, isFree, status, title, startedAt } = session;

        const recordings = await getRecordings(session.id, SessionType.GROUP) ?? [];
        const recordingsGuids: string[] = [];
        recordings.forEach(recording => {
          recordingsGuids.push(recording.bunnyGuid)
        });

        return { id, description, isFree, status, title, startedAt, recordings: recordingsGuids };
      })
    );

    res.json({
      message: "Course Sessions returned Successfully",
      data: {
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