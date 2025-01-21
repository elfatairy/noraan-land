import { NextFunction, Request, Response } from "express";
import { validateDate, validateEmail, validateName, validatePassword, validateQuizesLink, validateSessionType, validateString } from "../utils/validation.util";
import { authenticateUser, createUser, emailExists, getUserByEmail, getUserSession, nameExists, userExists, verifyGoogleToken } from "../services/user.service";
import { createCourse, getAllCourses, getCourse, getUserCourse } from "../services/course.service";
import { createGroupSessionService, createIndividualSessionService, createRecording, endSessionService, getSession, saveGruopStudentNotes, saveIndividualStudentNotes, startSessionService, uploadRecording } from "../services/session.service";
import { isDateAvailable } from "../services/calendar.service";
import { SessionStatus, SessionType } from "@prisma/client";
import { createMeeting, getZoomAccessToken } from "../services/zoom.service";

export const createGroupSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { courseId, title, description, date, duration, isFree = false } = req.body;
    if (!courseId || !title || !date || !validateDate(date) || !duration || (description && !validateString(description, 255, 0))) {
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

    const createdSession = await createGroupSessionService(courseId, title, date, duration, isFree, description);
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
    const { courseId, userId, title, description, date, duration, isFree = false } = req.body;
    if (!courseId || !userId || !title || !date || !validateDate(date) || !duration || (description && !validateString(description, 255, 0))) {
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

    const userCourse = await getUserCourse(userId, courseId);
    if (userCourse == null) {
      res.status(409).json({
        name: "USER_COURSE_DOESNT_EXIST",
        message: "This user hasn't applier for this course yet"
      });
      return;
    }
    if (userCourse.sessionType != SessionType.INDIVIDUAL) {
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

    // if (quizzesLink && !validateQuizesLink(quizzesLink)) {
    //   res.status(400).json({
    //     name: "QUIZES_NOT_VALID",
    //     message: "The quizes link isn't a valid link"
    //   });
    //   return;
    // }

    const createdSession = await createIndividualSessionService(courseId, userId, title, date, duration, isFree, description);
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

export const startSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionType } = req.params;
    const sessionId = Number(req.params.sessionId);

    if (!sessionId || !validateSessionType(sessionType)) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data"
      });
      return;
    }

    const session = await getSession(sessionId, SessionType[sessionType as keyof typeof SessionType]);
    if (!session) {
      res.status(409).json({
        name: "SESSION_DOESNT_EXIST",
        message: "No sesesion with that id"
      });
      return;
    }

    if (session.status != SessionStatus.UPCOMING) {
      res.status(409).json({
        name: "MEETING_STARTED_ENDED",
        message: "Can't start a meeting that had already started / ended"
      });
      return;
    }

    const accessToken = await getZoomAccessToken();

    const { id: meetingId, start_url } = await createMeeting(accessToken, session.title);
    await startSessionService(meetingId, sessionId, SessionType[sessionType as keyof typeof SessionType]);

    res.json({
      message: "Meeting Started Successfully",
      data: {
        startUrl: start_url
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

export const endSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionType } = req.params;
    const sessionId = Number(req.params.sessionId);
    const { sessionContent, notes } = req.body;

    const validNotes =
      !notes ||
      (sessionType == SessionType.GROUP && Array.isArray(notes)) ||
      (sessionType == SessionType.INDIVIDUAL && typeof notes == "string");

    if (!sessionId || !validateSessionType(sessionType) ||
      (sessionContent && !validateString(sessionContent, 255, 1)) ||
      !validNotes) {

      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data"
      });
      return;

    }

    const session = await getSession(sessionId, SessionType[sessionType as keyof typeof SessionType]);
    if (!session) {
      res.status(409).json({
        name: "SESSION_DOESNT_EXIST",
        message: "No sesesion with that id"
      });
      return;
    }

    if (session.status != SessionStatus.RUNNING) {
      res.status(409).json({
        name: "MEETING_HASNT_STARTED",
        message: "You can't end the meeting before starting it"
      });
      return;
    }

    if (sessionType == SessionType.GROUP) {
      notes.forEach(async (note: Record<string, string>) => {
        if (note.userId) {
          const userSession = await getUserSession(Number(note.userId), sessionId);
          if (userSession) {
            await saveGruopStudentNotes(userSession.id, note.notes);
          }
        }
      });
    } else if (sessionType == SessionType.INDIVIDUAL) {
      await saveIndividualStudentNotes(session.id, notes);
    }

    await endSessionService(sessionId, SessionType[sessionType as keyof typeof SessionType], sessionContent);

    res.json({
      message: "Session Ended Successfully",
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

export const uploadRecords = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionType = SessionType[req.params.sessionType as keyof typeof SessionType];
    const sessionId = Number(req.params.sessionId);

    // Updated validation to handle both array and single file
    const files = req.files?.['files'];
    if (!files || (Array.isArray(files) && files.length === 0) || (!Array.isArray(files) && !files)) {
      res.status(400).json({
        name: "NO_FILES",
        message: "There is no recordings being uploaded",
      });
      return;
    }

    // Convert single file to array if needed
    const fileArray = Array.isArray(files) ? files : [files];

    if (!sessionId || !validateSessionType(sessionType)) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data",
      });
      return;
    }

    const session = await getSession(sessionId, sessionType);
    if (!session) {
      res.status(409).json({
        name: "SESSION_DOESNT_EXIST",
        message: "No session with that id",
      });
      return;
    }

    // Process file uploads
    await Promise.all(
      fileArray.map(async (file) => {
        const videoGuid = await uploadRecording(file, session.id, sessionType);
        if (!videoGuid) {
          res.status(500).json({
            name: "ERROR_UPLOADING",
            message: "There was an error while uploading the recordings",
          });
          return;
        }
        await createRecording(session.id, sessionType, videoGuid);
      })
    );

    res.json({
      message: "Recordings uploaded successfully",
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
