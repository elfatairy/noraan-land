import { NextFunction, Request, Response } from "express";
import { validateEmail, validateName, validatePassword, validateString } from "../utils/validation.util";
import { authenticateUser, createUser, emailExists, getUserByEmail, nameExists, verifyGoogleToken } from "../services/user.service";
import bcrypt, { compare } from "bcrypt";
import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import { generateToken } from "../utils/token.util";
import { getCourse, createCourse, getAllCourses, getUserCourses, viewUserCourse, updateCourse, createCoursePaymentDetails, getPaymentDetails } from "../services/course.service";
import { SessionType } from "@prisma/client";
import { getZoomAccessToken } from "../services/zoom.service";
import { createPaypalPlan, createPaypalProduct, getPaypalAccessToken } from "../services/paypal.service";
import { createPaymobPlan, getPaymobAcceessToken } from "../services/paymob.service";

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, individualPrice, groupPrice } = req.body;
    if (!name || (description && (description && (description && !validateString(description, 255, 0))))) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data"
      });
      return;
    }

    if (!individualPrice && !groupPrice) {
      res.status(400).json({
        name: "REQUIRED_PRICE",
        message: "At least one of group price / individual price should have a value"
      });
      return;
    }

    const courseExistsRes = await getCourse({ name });
    if (courseExistsRes) {
      res.status(409).json({
        name: "COURSE_ALREADY_EXISTS",
        message: "This course name is already used, use a different one"
      });
      return;
    }

    const createdCourse = await createCourse(name, groupPrice, individualPrice, description);
    
    // PAYPAL
    const paypalAccessToken = await getPaypalAccessToken();
    if(!paypalAccessToken) throw Error("Error getting access token");

    const paypalProductId = await createPaypalProduct(name, description, paypalAccessToken);
    if(!paypalProductId) throw Error("Error creating paypal product");
    
    const paypalGroupPlanId = await createPaypalPlan(name, paypalProductId, paypalAccessToken, groupPrice, SessionType.GROUP);
    const paypalIndividualPlanId = await createPaypalPlan(name, paypalProductId, paypalAccessToken, individualPrice, SessionType.INDIVIDUAL);
    if(!paypalGroupPlanId || !paypalIndividualPlanId) throw Error("Error creating paypal plans");

    // PAYMOB
    const paymobAccessToken = await getPaymobAcceessToken();
    if(!paymobAccessToken) throw Error("Error getting access token");

    const paymobGroupPlanId = await createPaymobPlan(name, paymobAccessToken, groupPrice, SessionType.GROUP);
    const paymobIndividualPlanId = await createPaymobPlan(name, paymobAccessToken, individualPrice, SessionType.INDIVIDUAL);
    if(!paymobGroupPlanId || !paymobIndividualPlanId) throw Error("Error creating paymob plans");
    console.log(paymobGroupPlanId, paymobIndividualPlanId);

    await createCoursePaymentDetails(createdCourse.id, paypalGroupPlanId, paypalIndividualPlanId, paymobGroupPlanId, paymobIndividualPlanId);

    res.json({
      message: "Coursee created successfully",
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

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, individualPrice, groupPrice } = req.body;
    const courseId = Number(req.params.id);

    if (!courseId ||
      (!name && (description && !validateString(description, 255, 0)) && !individualPrice && !groupPrice)) {
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

    const options: any = {};

    if(name)
      options.name = name;
    
    if(description)
      options.description = description;
    
    if(individualPrice)
      options.individualPrice = individualPrice;
    
    if(groupPrice)
      options.groupPrice = groupPrice;

    const updatedCourse = await updateCourse(courseId, options);

    res.json({
      message: "Coursee updated successfully",
      data: {
        course: updatedCourse
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
export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courseId = Number(req.params.id);
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

    const paymentDetails = await getPaymentDetails(courseId);
    res.json({
      message: "Course retrieved successfully",
      data: {
        course,
        paymentDetails
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

export const newUsers = async (req: Request, res: Response, next: NextFunction) => {
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

    const lastWeekDate = new Date(new Date().getTime() - 604800000);
    const newUsers = await getUserCourses(courseId, {
      OR: [
        { viewedByAdmin: false },
        { createdAt: { gt: lastWeekDate } }
      ]
    }) ?? [];

    await Promise.all(newUsers?.map(async newUser => {
      await viewUserCourse(courseId, newUser.userId);
    }))

    res.json({
      message: "New Course users retrieved successfully",
      data: {
        newUsers
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

export const groupUsers = async (req: Request, res: Response, next: NextFunction) => {
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

    const userCourses = await getUserCourses(courseId, {
      sessionType: SessionType.GROUP
    }) ?? [];

    res.json({
      message: "Course users retrieved successfully",
      data: {
        userCourses
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


export const individualUsers = async (req: Request, res: Response, next: NextFunction) => {
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

    const userCourses = await getUserCourses(courseId, {
      sessionType: SessionType.INDIVIDUAL
    }) ?? [];

    res.json({
      message: "Course users retrieved successfully",
      data: {
        userCourses
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