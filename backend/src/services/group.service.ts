import { prisma } from "../configs/db.config";
import { Prisma } from "@prisma/client";


export const getGroup = async (conditions: Prisma.GroupWhereInput) => await prisma.group.findFirst({
    where: conditions
});

export const createGroupService = async (courseId: number, name: string) => {
    const group = await prisma.group.create({
        data: {
            courseId,
            name
        }
    })

    return group;
}

export const getCourseGroups = async (courseId: number) => {
    const groups = await prisma.group.findMany({
        where: {
            courseId
        }
    })

    return groups;
}

export const deleteGroupService = async (groupId: number) => {
    const group = await prisma.group.delete({
        where: {
            id: groupId
        }
    })

    return group;
}