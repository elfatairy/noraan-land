import { NextFunction, Request, Response } from "express";
import { validateString, validateZoomLink } from "../utils/validation.util";
import {
  getCourse,
  createCourse,
  getAllCourses,
  getStudentCourses,
  updateCourse,
  getUnasignedStudentCourse,
  revokeCoursePrivateSubscriptions,
  revokeCourseGroupSubscriptions,
  cancelStudentCourseSubscription,
} from "../services/course.service";
import { ROLES } from "../utils/constants.util";
import {
  createGroupService,
  deleteGroupService,
  getCourseGroups,
  getGroup,
} from "../services/group.service";
import { Group, SubscriptionMethod } from "@prisma/client";
import {
  cancelPaypalSubscription,
  createPaypalProduct,
} from "../services/paypal.service";
import { cancelPaymobSubscription } from "../services/paymob.service";
import { createFolder } from "../services/material.service";
import { join } from "path";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description, privatePrice, groupPrice, zoomLink } = req.body;
    if (
      !name ||
      !privatePrice ||
      !groupPrice ||
      !zoomLink ||
      (description && !validateString(description, 255, 0))
    ) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data",
      });
      return;
    }

    const courseExistsRes = await getCourse({ name });
    if (courseExistsRes) {
      res.status(409).json({
        name: "COURSE_ALREADY_EXISTS",
        message: "This course name is already used, use a different one",
      });
      return;
    }

    if (!validateZoomLink(zoomLink)) {
      res.status(400).json({
        name: "ZOOM_LINK_INVALID",
        message: "The zoom link is invalid",
      });
      return;
    }

    const paypalProductId = await createPaypalProduct(name, description);
    if (!paypalProductId) throw Error("Error creating paypal product");

    const createdCourse = await createCourse(
      name,
      privatePrice,
      groupPrice,
      description,
      zoomLink,
      paypalProductId
    );

    await createFolder(createdCourse.id.toString(), join(__dirname, '../../uploads'));
    /*
    // PAYPAL
    
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
    */

    res.json({
      message: "Coursee created successfully",
      data: {
        course: createdCourse,
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

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description, privatePrice, groupPrice, zoomLink } = req.body;
    const courseId = Number(req.params.courseId);

    if (
      !courseId ||
      (!name && !description && !privatePrice && !groupPrice && !zoomLink) ||
      (description && !validateString(description, 255, 0))
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

    if (zoomLink && !validateZoomLink(zoomLink)) {
      res.status(400).json({
        name: "GROUP_ZOOM_INVALID",
        message: "The zoom link is invalid",
      });
      return;
    }

    const options: any = {};

    if (name) options.name = name;

    if (description) options.description = description;

    if (privatePrice) {
      const studentCourses =
        (await getStudentCourses(courseId, {
          groupId: null,
        })) ?? [];

      await Promise.allSettled(
        studentCourses.map(async (studentCourse) => {
          await cancelStudentCourseSubscription(studentCourse.id);
        })
      );

      await revokeCoursePrivateSubscriptions(courseId);
      options.privatePrice = privatePrice;
    }

    if (groupPrice) {
      const studentCourses =
        (await getStudentCourses(courseId, {
          groupId: {
            not: null,
          },
        })) ?? [];

      await Promise.allSettled(
        studentCourses.map(async (studentCourse) => {
          await cancelStudentCourseSubscription(studentCourse.id);
        })
      );

      await revokeCourseGroupSubscriptions(courseId);
      options.groupPrice = groupPrice;
    }

    if (zoomLink) options.zoomLink = zoomLink;

    const updatedCourse = await updateCourse(courseId, options);

    res.json({
      message: "Coursee updated successfully",
      data: {
        course: updatedCourse,
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

export const getAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const courses = await getAllCourses();

    if ((res.locals.role !== ROLES.ADMIN)) {
      courses.forEach((course) => {
        course.zoomLink = "";
      });
    }

    res.json({
      message: "Courses retrieved successfully",
      data: {
        courses,
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

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courseId = Number(req.params.courseId);
    if (!courseId) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data",
      });
      return;
    }

    const course = await getCourse({ id: courseId });
    if (!course) {
      res.status(409).json({
        name: "COURSE_DOESNT_EXIST",
        message: "No course with this id",
      });
      return;
    }

    if (res.locals.role == ROLES.USER) {
      course.zoomLink = "";
    }

    res.json({
      message: "Course retrieved successfully",
      data: {
        course,
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

export const newCourseStudents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const courseId = Number(req.params.courseId);
    if (!courseId) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data",
      });
      return;
    }

    const course = await getCourse({ id: courseId });
    if (!course) {
      res.status(409).json({
        name: "COURSE_DOESNT_EXIST",
        message: "No course with this id",
      });
      return;
    }

    const newStudents =
      (await getStudentCourses(courseId, {
        hours: null,
      })) ?? [];

    res.json({
      message: "New Course students retrieved successfully",
      data: {
        newStudents,
        privatePrice: course.privatePrice,
        groupPrice: course.groupPrice
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

export const newStudents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const newStudents = await getUnasignedStudentCourse();

    res.json({
      message: "New students retrieved successfully",
      data: {
        newStudents,
        courseDetails: await Promise.all(
          newStudents.map(async (student) => {
            const course = await getCourse({ id: student.courseId });
            return {
              courseId: student.courseId,
              privatePrice: course?.privatePrice,
              groupPrice: course?.groupPrice
            };
          })
        )
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

export const groupStudents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const courseId = Number(req.params.courseId);
    const groupId = Number(req.params.groupId);

    if (!courseId || !groupId) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data",
      });
      return;
    }

    const course = await getCourse({ id: courseId });
    if (!course) {
      res.status(409).json({
        name: "COURSE_DOESNT_EXIST",
        message: "No course with this id",
      });
      return;
    }

    const group = await getGroup({ id: groupId, courseId });
    if (!group) {
      res.status(409).json({
        name: "GROUP_DOESNT_EXIST",
        message: "Group doesn't exist or doesn't belong to this course",
      });
      return;
    }

    const courseStudents =
      (await getStudentCourses(courseId, {
        groupId,
      })) ?? [];

    res.json({
      message: "Course students retrieved successfully",
      data: {
        students: courseStudents,
        privatePrice: course.privatePrice,
        groupPrice: course.groupPrice
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

export const privateStudents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const courseId = Number(req.params.courseId);
    if (!courseId) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data",
      });
      return;
    }

    const course = await getCourse({ id: courseId });
    if (!course) {
      res.status(409).json({
        name: "COURSE_DOESNT_EXIST",
        message: "No course with this id",
      });
      return;
    }

    const studentCourses =
      (await getStudentCourses(courseId, {
        groupId: null,
      })) ?? [];

    res.json({
      message: "Course students retrieved successfully",
      data: {
        students: studentCourses,
        privatePrice: course.privatePrice,
        groupPrice: course.groupPrice
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

export const courseGroups = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const courseId = Number(req.params.courseId);
    if (!courseId) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data",
      });
      return;
    }

    const course = await getCourse({ id: courseId });
    if (!course) {
      res.status(409).json({
        name: "COURSE_DOESNT_EXIST",
        message: "No course with this id",
      });
      return;
    }

    const groups: (Group & { studentsCount?: number })[] =
      await getCourseGroups(courseId);
    await Promise.allSettled(
      groups.map(async (group) => {
        const students =
          (await getStudentCourses(courseId, {
            groupId: group.id,
          })) ?? [];
        group.studentsCount = students.length;
      })
    );

    res.json({
      message: "Course groups retrieved successfully",
      data: {
        groups,
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

export const createGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const courseId = Number(req.params.courseId);
    if (!courseId) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data",
      });
      return;
    }

    const course = await getCourse({ id: courseId });
    if (!course) {
      res.status(409).json({
        name: "COURSE_DOESNT_EXIST",
        message: "No course with this id",
      });
      return;
    }

    const groups = await getCourseGroups(courseId);
    groups.sort(
      (groupA, groupB) =>
        groupA.name.charCodeAt("Group ".length) -
        groupB.name.charCodeAt("Group ".length)
    );
    let letterCode = 65;
    for (const group of groups) {
      if (group.name.charCodeAt("Group ".length) != letterCode) break;
      letterCode++;
    }

    const groupName = `Group ${String.fromCharCode(letterCode)}`;

    const group = await createGroupService(courseId, groupName);

    res.json({
      message: "Course group created successfully",
      data: {
        group,
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

export const deleteGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const courseId = Number(req.params.courseId);
    const groupId = Number(req.params.groupId);

    if (!courseId || !groupId) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data",
      });
      return;
    }

    const course = await getCourse({ id: courseId });
    if (!course) {
      res.status(409).json({
        name: "COURSE_DOESNT_EXIST",
        message: "No course with this id",
      });
      return;
    }

    const group = await getGroup({ courseId, id: groupId });
    if (!group) {
      res.status(409).json({
        name: "GROUP_DOESNT_EXIST",
        message: "Group doesn't exist or doesn't belong to this course",
      });
      return;
    }

    const students =
      (await getStudentCourses(courseId, {
        groupId,
      })) ?? [];

    if (students.length > 0) {
      res.status(409).json({
        name: "GROUP_ISNT_EMPTY",
        message: "Group should be empty to delete it",
      });
      return;
    }

    await deleteGroupService(groupId);

    res.json({
      message: "Course group deleted successfully",
      data: {
        group,
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
