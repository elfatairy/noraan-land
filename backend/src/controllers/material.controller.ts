import { NextFunction, Request, Response } from "express";
import { validateEmail, validateName, validatePassword, validateString } from "../utils/validation.util";
import { authenticateUser, createUser, emailExists, getUserByEmail, nameExists, verifyGoogleToken } from "../services/user.service";
import bcrypt, { compare } from "bcrypt";
import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import { generateToken } from "../utils/token.util";
import { getCourse, createCourse, getAllCourses, getUserCourses, viewUserCourse, updateCourse } from "../services/course.service";
import { SessionType } from "@prisma/client";
import { createFolder, deleteItem, getContent, renameItem, uploadFile } from "../services/material.service";
import { existsSync } from "fs";
import { join } from "path";
import { allowedMaterialTypes, MAX_FILE_SIZE } from "../utils/constants.util";

export const open = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const content = await getContent(res.locals.path);

    res.json({
      message: "Folder content returned successfully",
      data: {
        content
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

export const download = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.download(res.locals.path)

  } catch (err: any) {
    console.log("ERROR: ", err);
    res.status(500).json({
      name: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error"
    });
    next(err);
  }
}

export const addFolder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;

    if (!name || !validateString(name, 255, 1)) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data"
      });
      return;
    }

    if (existsSync(join(res.locals.path, name))) {
      res.status(409).json({
        name: "FOLDER_ALREADY_EXIST",
        message: "This folder already exists"
      });
      return;
    }

    await createFolder(name, res.locals.path);

    res.json({
      message: "Folder created successfully",
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

export const upload = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      res.status(400).json({
        name: "INVALID_PAYLOAD",
        message: "Invalid payload data"
      });
      return;
    }
    const file = Array.isArray(req.files['file']) ? req.files["file"][0] : req.files['file'];

    if (file.size > MAX_FILE_SIZE) {
      res.status(400).json({
        name: "MAX_SIZE_EXCEEDED",
        message: "This file is bigger than the max file size"
      });
      return;
    }

    if (!allowedMaterialTypes.includes(file.mimetype)) {
      res.status(400).json({
        name: "FILE_TYPE_INVALID",
        message: "This file type is not valid"
      });
      return;
    }

    await uploadFile(file, res.locals.path);

    res.json({
      message: "File uploaded successfully",
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

export const rename = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    if (!name || !validateString(name, 255, 1)) {
      res.status(400).json({
        neme: "INVALID_PAYLOAD",
        message: "Invalid payload data"
      });
      return;
    }

    await renameItem(res.locals.path, name);

    res.json({
      message: "File/Folder renamed successfully",
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

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    if (!name || !validateString(name, 255, 1)) {
      res.status(400).json({
        neme: "INVALID_PAYLOAD",
        message: "Invalid payload data"
      });
      return;
    }

    await deleteItem(res.locals.path);

    res.json({
      message: "File/Folder deleted successfully",
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