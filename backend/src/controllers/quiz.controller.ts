import { NextFunction, Request, Response } from "express";
import { validateString } from "../utils/validation.util";
import { getCourse, createCourse } from "../services/course.service";
import { createQuiz, deleteQuizService, getCourseQuizes, getQuiz } from "../services/quiz.service";

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { link } = req.body;
    const courseId = Number(req.params.courseId);
    if (!courseId || !link || !validateString(link, 255, 1)) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data"
      });
      return;
    }

    const quizExistsRes = await getQuiz({courseId, link});
    if(quizExistsRes) {
      res.status(409).json({
        name: "QUIZ_ALREADY_EXISTS",
        message: "This quiz is already used for this course"
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

    await createQuiz(courseId, link);

    res.json({
      message: "Quiz created successfully",
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

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courseId = Number(req.params.courseId);

    if (!courseId) {
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

    const quizes = await getCourseQuizes(courseId);

    res.json({
      message: "Quizes retrieved successfully",
      data: {
        quizes
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

export const deleteQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quizId = Number(req.params.quizId);
    const courseId = Number(req.params.courseId);

    if (!quizId || !courseId) {
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
    const quizExistsRes = await getQuiz({id: quizId});
    if (!quizExistsRes) {
      res.status(409).json({
        name: "QUIZ_DOESNT_EXIST",
        message: "No quiz with this id"
      });
      return;
    }

    const quiz = await deleteQuizService(quizId);

    res.json({
      message: "Quiz deleted successfully",
      data: {
        quiz
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