import { prisma } from "../configs/db.config";
import { CalendarDateStatus, CalendarDateType, Prisma } from "@prisma/client";

export const isDateAvailable = async (dateIso: string, duration: number) => {
    const newStartDate = new Date(dateIso);
    const newEndDate = new Date(newStartDate.getTime() + duration * 60000);
    
    if (newStartDate < new Date()) {
        return false;
    }
    
    const busy = await prisma.calendarDate.findFirst({
        where: {
            AND: [
                {
                    startDate: {
                        lt: newEndDate
                    }
                },
                {
                    endDate: {
                        gt: newStartDate
                    }
                }
            ]
        }
    });
    
    console.log("busy");
    console.log(busy);
    return !busy;
}

export const createCalendarDate = async (dateIso: string, duration: number, type: CalendarDateType) => {
    const startDate = new Date(dateIso);
    const endDate = new Date(startDate.getTime() + duration * 60000);

    const { id: dateId } = await prisma.calendarDate.create({
        data: {
            startDate,
            endDate,
            duration,
            type
        },
        select: {
            id: true
        }
    });

    return dateId;
}

export const getDates = async (dateCondition: Prisma.CalendarDateWhereInput | {} = {}) => await prisma.calendarDate.findMany({
    where: dateCondition
})

export const getDateSession = async (id: number) => {
    const date = await prisma.calendarDate.findFirstOrThrow({
        where: {
            id
        }
    });
    if(date.type == CalendarDateType.GROUP_SESSION) {
        return await prisma.calendarDate.findFirstOrThrow({
            where: {
                id
            }
        }).groupSession();
    } else if (date.type == CalendarDateType.INDIVIDUAL_SESSION) {
        return await prisma.calendarDate.findFirstOrThrow({
            where: {
                id
            }
        }).individualSession();
    }
}

