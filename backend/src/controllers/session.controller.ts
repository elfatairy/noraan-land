import { NextFunction, Request, Response } from "express";
import {
  validateDate,
  validateObjectWithKeys,
  validateReports,
  validateSessionType,
  validateString,
} from "../utils/validation.util";
import {
  createStudentSession,
  getStudentSession,
} from "../services/student.service";
import { getCourse, getStudentCourse } from "../services/course.service";
import {
  cancelSessionService,
  createRecording,
  createSessionService,
  endSessionService,
  getRecurringSessions,
  getSession,
  saveStudentReport,
  startSessionService,
  updateSessionDateService,
  uploadRecording,
} from "../services/session.service";
import { isDateAvailable } from "../services/calendar.service";
import { SessionStatus, SessionType } from "@prisma/client";
import { getGroup } from "../services/group.service";
import { Report } from "../../types";

export const createSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const courseId = Number(req.params.courseId);
    const {
      title,
      description,
      date,
      duration,
      sessionType,
      groupId,
      isRecurring,
      privateStudentId,
      isFree = false,
    } = req.body;

    if (
      !courseId ||
      !title ||
      !date ||
      !validateDate(date) ||
      !duration ||
      (description && !validateString(description, 255, 0)) ||
      (isRecurring !== undefined && typeof isRecurring !== 'boolean') ||
      !sessionType ||
      !validateSessionType(sessionType) ||
      (sessionType == SessionType.GROUP && !groupId) ||
      (sessionType == SessionType.PRIVATE && !privateStudentId)
    ) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data",
      });
      return;
    }

    const courseExistsRes = await getCourse({ id: courseId });
    if (!courseExistsRes) {
      res.status(409).json({
        name: "COURSE_DOESNT_EXIST",
        message: "No course with this id",
      });
      return;
    }

    for (let i = 0; i < (isRecurring ? 52 : 1); i++) {
      console.log("repeat"); 
      const _date = new Date(
        new Date(date).getTime() + i * 604800000
      ).toISOString();

      const dateAvailable = await isDateAvailable(_date, duration);
      if (!dateAvailable) {
        res.status(409).json({
          name: "DATE_NOT_AVAILABLE",
          message:
            "This date is not available, please choose another date/duration",
        });
        return;
      }
    }

    if (groupId) {
      const group = await getGroup({ id: groupId, courseId });
      if (!group) {
        res.status(409).json({
          name: "GROUP_DOESNT_EXIST",
          message:
            "This group id is not valid, or this group doesn't belong to this course",
        });
        return;
      }
    } else if (privateStudentId) {
      const studentCourse = await getStudentCourse({
        studentId: privateStudentId,
        courseId,
      });
      if (!studentCourse || studentCourse.courseId != courseId) {
        res.status(409).json({
          name: "USER_COURSE_INVALID",
          message:
            "This student doesn't exist or doesn't belong to this course",
        });
        return;
      }
    }

    const firstSession = await createSessionService(
      courseId,
      title,
      sessionType,
      privateStudentId,
      groupId,
      date,
      duration,
      isFree,
      description
    );

    if (isRecurring) {
      for (let i = 1; i < 52; i++) {
        const newDate = new Date(
          new Date(date).getTime() + i * 604800000
        ).toISOString();

        await createSessionService(
          courseId,
          title,
          sessionType,
          privateStudentId,
          groupId,
          newDate,
          duration,
          isFree,
          description
        );
      }
    }

    res.json({
      message: "Session[s] created successfully",
      data: {
        nextSession: firstSession,
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

export const updateSessionDate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionId = Number(req.params.sessionId);

    const { newDate, newDuration, isRecurring } = req.body;
    if (!sessionId || !newDate || !newDuration || !validateDate(newDate)) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data",
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

    let recurringSessions = [];
    if(isRecurring) recurringSessions.push(...(await getRecurringSessions(sessionId)));

    for (let i = 0; i < (isRecurring ? 52 : 1); i++) {
      const _date = new Date(
        new Date(newDate).getTime() + i * 604800000
      ).toISOString();
      const ignoreIds = [session.id, ...recurringSessions.map(recurringSession => recurringSession.session.id)]
      const dateAvailable = await isDateAvailable(_date, newDuration, ignoreIds);
      if (!dateAvailable) {
        res.status(409).json({
          name: "DATE_NOT_AVAILABLE",
          message:
            "This date is not available, please choose another date/duration",
        });
        return;
      }
    }

    const updatedNextSession = await updateSessionDateService(
      sessionId,
      session.calendarDateId,
      newDate,
      newDuration
    );

    if (isRecurring) {
      await Promise.allSettled(
        recurringSessions.map(async (_session) => {
          const _date = new Date(
            new Date(newDate).getTime() + _session.week * 604800000
          ).toISOString();

          await updateSessionDateService(
            sessionId,
            _session.session.calendarDateId,
            _date,
            newDuration
          );
        })
      );
    }

    res.json({
      message: "Session[s] date updated successfully",
      data: {
        nextSession: updatedNextSession,
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

export const cancelSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionId = Number(req.params.sessionId);

    const { isRecurring } = req.body;
    if (!sessionId) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data",
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

    await cancelSessionService(sessionId, session.calendarDateId);

    if (isRecurring) {
      const sessions = await getRecurringSessions(sessionId);
      await Promise.allSettled(
        sessions.map(async (_session) => {
          await cancelSessionService(
            sessionId,
            _session.session.calendarDateId
          );
        })
      );
    }

    res.json({
      message: "Session canceled successfully",
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

export const startSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionId = Number(req.params.sessionId);

    if (!sessionId) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data",
      });
      return;
    }

    const session = await getSession(sessionId);
    if (!session) {
      res.status(409).json({
        name: "SESSION_DOESNT_EXIST",
        message: "No sesesion with that id",
      });
      return;
    }

    if (session.status != SessionStatus.UPCOMING) {
      res.status(409).json({
        name: "MEETING_STARTED_ENDED",
        message: "Can't start a meeting that had already started / ended",
      });
      return;
    }

    await startSessionService(sessionId);

    res.json({
      message: "Meeting Started Successfully",
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

export const endSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionId = Number(req.params.sessionId);
    const { sessionContent, reports } = req.body;

    if (
      !sessionId ||
      (sessionContent && !validateString(sessionContent, 255, 1)) ||
      !validateObjectWithKeys(reports) ||
      !validateReports(reports)
    ) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data",
      });
      return;
    }

    const session = await getSession(sessionId);
    if (!session) {
      res.status(409).json({
        name: "SESSION_DOESNT_EXIST",
        message: "No sesesion with that id",
      });
      return;
    }

    if (session.status != SessionStatus.RUNNING) {
      res.status(409).json({
        name: "MEETING_HASNT_STARTED",
        message: "You can't end the meeting before starting it",
      });
      return;
    }

    for (const studentId in reports) {
      const report: Report = reports[studentId];

      let studentSession = await getStudentSession(
        Number(studentId),
        sessionId
      );
      if (!studentSession) {
        studentSession = await createStudentSession(
          Number(studentId),
          sessionId
        );
      }

      await saveStudentReport(studentSession.id, report);
    }

    await endSessionService(sessionId, sessionContent);

    res.json({
      message: "Session Ended Successfully",
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

export const uploadRecords = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionId = Number(req.params.sessionId);

    // Updated validation to handle both array and single file
    const files = req.files?.["files"];
    if (
      !files ||
      (Array.isArray(files) && files.length === 0) ||
      (!Array.isArray(files) && !files)
    ) {
      res.status(400).json({
        name: "NO_FILES",
        message: "There is no recordings being uploaded",
      });
      return;
    }

    // Convert single file to array if needed
    const fileArray = Array.isArray(files) ? files : [files];

    if (!sessionId) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data",
      });
      return;
    }

    const session = await getSession(sessionId);
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
        const videoUuid = await uploadRecording(file, session.id);
        if (!videoUuid) {
          res.status(500).json({
            name: "ERROR_UPLOADING",
            message: "There was an error while uploading the recordings",
          });
          return;
        }
        await createRecording(session.id, videoUuid);
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
