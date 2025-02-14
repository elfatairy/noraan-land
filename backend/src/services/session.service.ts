import { prisma } from "../configs/db.config";
import { CalendarDateStatus, CalendarDateType, GroupSession, IndividualSession, Prisma, SessionStatus, SessionType } from "@prisma/client";
import { createCalendarDate } from "./calendar.service";
import fileUpload from "express-fileupload";
import axios from "axios";
import * as fs from "fs";
import path from "path";

export const createGroupSessionService = async (courseId: number, title: string, date: string, duration: number, isFree: boolean, description?: string) => {
    const calendarDateId = await createCalendarDate(date, duration, CalendarDateType.GROUP_SESSION);
    const session = await prisma.groupSession.create({
        data: {
            title,
            description,
            courseId,
            calendarDateId,
            isFree
        }
    });

    return session;
}

export const createIndividualSessionService = async (courseId: number, userId: number, title: string, date: string, duration: number, isFree: boolean, description?: string) => {
    const calendarDateId = await createCalendarDate(date, duration, CalendarDateType.INDIVIDUAL_SESSION);
    const session = await prisma.individualSession.create({
        data: {
            courseId,
            userId,
            title,
            calendarDateId,
            description,
            isFree
        }
    });

    return session;
}

export const getGroupSession = async (id: number) => await prisma.groupSession.findFirst({
    where: {
        id,
    }
})

export const getIndividualSession = async (id: number) => await prisma.individualSession.findFirst({
    where: {
        id,
    }
})

export const getSession = async (id: number, type: SessionType) => {
    if (type == SessionType.GROUP)
        return await getGroupSession(id);
    else if (type == SessionType.INDIVIDUAL)
        return await getIndividualSession(id);
    else
        throw Error("UNREACHABLE")
}

export const getSessions = async (conditions: Prisma.GroupSessionWhereInput | Prisma.IndividualSessionWhereInput, type: SessionType) => {
    if (type == SessionType.GROUP)
        return await prisma.groupSession.findMany({
            where: conditions as Prisma.GroupSessionWhereInput,
            select: {
                id: true, 
                description: true, 
                isFree: true, 
                status: true, 
                title: true, 
                calendarDateId: true,
                startedAt: true
            }
        })
    else if (type == SessionType.INDIVIDUAL)
        return await prisma.individualSession.findMany({
            where: conditions as Prisma.IndividualSessionWhereInput,
            select: {
                id: true, 
                description: true, 
                notes: true,
                isFree: true, 
                status: true, 
                title: true, 
                calendarDateId: true,
                startedAt: true
            }
        })
    else
        throw Error("UNREACHABLE")
}

export const startSessionService = async (sessionId: number, sessionType: SessionType) => {
    if (sessionType == SessionType.GROUP)
        await prisma.groupSession.update({
            where: {
                id: sessionId
            },
            data: {
                status: SessionStatus.RUNNING,
                startedAt: new Date()
            }
        });
    else if (sessionType == SessionType.INDIVIDUAL)
        await prisma.individualSession.update({
            where: {
                id: sessionId
            },
            data: {
                status: SessionStatus.RUNNING,
                startedAt: new Date()
            }
        });
    else
        throw Error("UNREACHABLE")
}

export const endSessionService = async (sessionId: number, sessionType: SessionType, description: string) => {
    let calendarDateId: number | null = null;
    if (sessionType == SessionType.GROUP) {
        calendarDateId = (await prisma.groupSession.update({
            where: {
                id: sessionId
            },
            data: {
                status: SessionStatus.ENDED,
                description
            }
        })).calendarDateId;
    } else if (sessionType == SessionType.INDIVIDUAL) {
        calendarDateId = (await prisma.individualSession.update({
            where: {
                id: sessionId
            },
            data: {
                status: SessionStatus.ENDED,
                description
            }
        })).calendarDateId;
    }
    else
        throw Error("UNREACHABLE")

    if (!calendarDateId)
        throw Error("UNREACHABLE")

    await prisma.calendarDate.update({
        where: {
            id: calendarDateId
        },
        data: {
            status: CalendarDateStatus.PASSED
        }
    })
}

export const saveIndividualStudentNotes = async (sessionId: number, notes: string) => await prisma.individualSession.update({
    where: {
        id: sessionId
    },
    data: {
        notes
    }
})

export const saveGruopStudentNotes = async (userSessionId: number, notes: string) => await prisma.userSession.update({
    where: {
        id: userSessionId
    },
    data: {
        notes
    }
})

const createBunnyVideo = async (title: string) => {
    const res = await axios.post(`${process.env.BUNNY_BASE_URL}/library/${process.env.BUNNY_LIBRARY_ID}/videos`, {
        title
    }, {
        headers: {
            "AccessKey": process.env.BUNNY_ACCESS_KEY
        }
    });

    if (res.status != 200) {
        throw Error("error creating bunny video");
    }

    return res.data.guid;
}

const uploadVideoToBunny = async (videoGuid: string, filePath: string) => {
    const videoStream = fs.createReadStream(filePath);

    const res = await axios.put(`${process.env.BUNNY_BASE_URL}/library/${process.env.BUNNY_LIBRARY_ID}/videos/${videoGuid}`,
        videoStream,
        {
            headers: {
                "AccessKey": process.env.BUNNY_ACCESS_KEY
            }
        });

    if (res.status != 200 || res.data.statusCode != 200) {
        throw Error("couldn't upload the video");
    }

    return true;
}

export const uploadRecording = async (file: fileUpload.UploadedFile, sessionId: number, sessionType: SessionType) => {
    try {
        let title = "";
        if (sessionType == SessionType.GROUP) {
            title = (await prisma.groupSession.findFirstOrThrow({
                where: {
                    id: sessionId
                }
            })).title;
        } else if (sessionType == SessionType.INDIVIDUAL) {
            title = (await prisma.individualSession.findFirstOrThrow({
                where: {
                    id: sessionId
                }
            })).title;
        }

        const videoGuid = await createBunnyVideo(title);

        const uploadPath = path.join(__dirname, 'uploads', file.name);
        file.mv(uploadPath, async (err) => {
            if (err) {
                throw Error(err);
            }

            try {
                await uploadVideoToBunny(videoGuid, uploadPath);

                fs.unlinkSync(uploadPath);

            } catch (error) {
                throw Error('Error uploading to Bunny CDN: ' + error);
            }
        });

        return videoGuid;
    } catch (error) {
        console.log(error);
        return false;
    }
}

export const createRecording = async (sessionId: number, sessionType: SessionType, videoGuid: string) => {
    if(sessionType == SessionType.GROUP) {
        await prisma.recording.create({
            data: {
                groupSessionId: sessionId,
                sessionType,
                bunnyGuid: videoGuid
            }
        });
    } else if (sessionType == SessionType.INDIVIDUAL) {
        await prisma.recording.create({
            data: {
                IndividualSessionid: sessionId,
                sessionType,
                bunnyGuid: videoGuid
            }
        });
    }
}

export const getRecordings = async (sessionId: number, sessionType: SessionType) => {
    if(sessionType == SessionType.GROUP) {
        return await prisma.recording.findMany({
            where: {
                groupSessionId: sessionId,
                sessionType
            }
        });
    } else if (sessionType == SessionType.INDIVIDUAL) {
        return await prisma.recording.findMany({
            where: {
                IndividualSessionid: sessionId,
                sessionType
            }
        });
    }
}