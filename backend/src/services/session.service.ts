import { prisma } from "../configs/db.config";
import {
  CalendarDateChangingStatus,
  CalendarDateStatus,
  Prisma,
  SessionStatus,
  SessionType,
} from "@prisma/client";
import { createCalendarDate } from "./calendar.service";
import fileUpload from "express-fileupload";
import axios from "axios";
import * as fs from "fs";
import path from "path";
import { Report } from "../../types";

export const createSessionService = async (
  courseId: number,
  title: string,
  sessionType: SessionType,
  privateStudentId: number,
  groupId: number,
  date: string,
  duration: number,
  isFree: boolean,
  description?: string
) => {
  const calendarDateId = await createCalendarDate(date, duration);
  const session = await prisma.session.create({
    data: {
      title,
      description,
      courseId,
      calendarDateId,
      isFree,
      sessionType,
      groupId: sessionType == SessionType.GROUP ? groupId : null,
      privateStudentId: sessionType == SessionType.PRIVATE ? privateStudentId : null,
    },
  });

  return session;
};

export const updateSessionDateService = async (
  sessionId: number,
  oldCalendarDateId: number,
  newDate: string,
  newDuration: number
) => {
  const newCalendarDateId = await createCalendarDate(
    newDate,
    newDuration,
    true
  );
  const session = await prisma.session.update({
    where: {
      id: sessionId,
    },
    data: {
      calendarDateId: newCalendarDateId,
    },
  });

  await prisma.calendarDate.delete({
    where: {
      id: oldCalendarDateId,
    },
  });

  return session;
};

export const cancelSessionService = async (
  sessionId: number,
  oldCalendarDateId: number
) => {
  await prisma.calendarDate.update({
    where: {
      id: oldCalendarDateId,
    },
    data: {
      changingStatus: CalendarDateChangingStatus.CANCELED,
      status: CalendarDateStatus.DONE
    },
  });

  const session = await prisma.session.update({
    where: {
      id: sessionId,
    },
    data: {
      status: SessionStatus.ENDED,
    },
  });

  return session;
};

export const getSession = async (id: number) =>
  await prisma.session.findFirst({
    where: {
      id,
    },
    include: {
      calendarDate: {
        select: {
          startDate: true,
        },
      },
    },
  });

export const getRecurringSessions = async (sessionId: number) => {
  const firstSession = (await getSession(sessionId))!;

  const sessions = [];

  for (let i = 1; i < 52; i++) {
    const _date = new Date(
      new Date(firstSession.calendarDate.startDate).getTime() + i * 604800000
    );

    const session = await prisma.session.findFirst({
      where: {
        title: firstSession.title,
        calendarDate: {
          startDate: _date,
        },
      },
    });

    if (session) sessions.push({ session, week: i });
  }

  return sessions;
};

export const getSessions = async (conditions: Prisma.SessionWhereInput) => {
  return await prisma.session.findMany({
    where: conditions,
    select: {
      id: true,
      description: true,
      isFree: true,
      status: true,
      sessionType: true,
      groupId: true,
      privateStudentId: true,
      title: true,
      calendarDateId: true,
      startedAt: true,
      calendarDate: {
        select: {
          startDate: true,
          endDate: true,
        },
      },
    },
  });
};

export const startSessionService = async (sessionId: number) => {
  await prisma.session.update({
    where: {
      id: sessionId,
    },
    data: {
      status: SessionStatus.RUNNING,
      startedAt: new Date(),
    },
  });
};

export const endSessionService = async (
  sessionId: number,
  description: string
) => {
  let { calendarDateId } = await prisma.session.update({
    where: {
      id: sessionId,
    },
    data: {
      status: SessionStatus.ENDED,
      description,
    },
  });

  await prisma.calendarDate.update({
    where: {
      id: calendarDateId,
    },
    data: {
      status: CalendarDateStatus.DONE,
    },
  });
};

export const saveStudentReport = async (
  studentSessionId: number,
  report: Report
) =>
  await prisma.studentSession.update({
    where: {
      id: studentSessionId,
    },
    data: {
      notes: report.notes,
      attendence: report.attendence,
      tardy: report.tardy,
      homeWork: report.homeWork,
    },
  });

const createBunnyVideo = async (title: string) => {
  const res = await axios.post(
    `${process.env.BUNNY_BASE_URL}/library/${process.env.BUNNY_LIBRARY_ID}/videos`,
    {
      title,
    },
    {
      headers: {
        AccessKey: process.env.BUNNY_ACCESS_KEY,
      },
    }
  );

  if (res.status != 200) {
    throw Error("error creating bunny video");
  }

  return res.data.guid;
};

const uploadVideoToBunny = async (videoGuid: string, filePath: string) => {
  const videoStream = fs.createReadStream(filePath);

  const res = await axios.put(
    `${process.env.BUNNY_BASE_URL}/library/${process.env.BUNNY_LIBRARY_ID}/videos/${videoGuid}`,
    videoStream,
    {
      headers: {
        AccessKey: process.env.BUNNY_ACCESS_KEY,
      },
    }
  );

  if (res.status != 200 || res.data.statusCode != 200) {
    throw Error("couldn't upload the video");
  }

  return true;
};

export const uploadRecording = async (
  file: fileUpload.UploadedFile,
  sessionId: number
) => {
  try {
    const { title } = await prisma.session.findFirstOrThrow({
      where: {
        id: sessionId,
      },
    });

    const videoGuid = await createBunnyVideo(title);

    const uploadPath = path.join(__dirname, "uploads", file.name);
    file.mv(uploadPath, async (err) => {
      if (err) {
        throw Error(err);
      }

      try {
        await uploadVideoToBunny(videoGuid, uploadPath);

        fs.unlinkSync(uploadPath);
      } catch (error) {
        throw Error("Error uploading to Bunny CDN: " + error);
      }
    });

    return videoGuid;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const createRecording = async (sessionId: number, videoGuid: string) => {
  await prisma.recording.create({
    data: {
      sessionId: sessionId,
      bunnyGuid: videoGuid,
    },
  });
};

export const getRecordings = async (sessionId: number) => {
  return await prisma.recording.findMany({
    where: {
      sessionId: sessionId,
    },
  });
};
