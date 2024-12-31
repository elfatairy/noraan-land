import { prisma } from "../configs/db.config";
import { Prisma, SessionType } from "@prisma/client";


export const getQuiz = async (conditions: Prisma.QuizWhereInput) => await prisma.quiz.findFirst({
    where: conditions
});

export const createQuiz = async (courseId: number, link: string) => {
    const quiz = await prisma.quiz.create({
        data: {
            courseId,
            link
        }
    })

    return quiz;
}

export const getCourseQuizes = async (courseId: number) => {
    const quizes = await prisma.quiz.findMany({
        where: {
            courseId
        }
    })

    return quizes;
}

export const deleteQuizService = async (quizId: number) => {
    const quiz = await prisma.quiz.delete({
        where: {
            id: quizId
        }
    })

    return quiz;
}