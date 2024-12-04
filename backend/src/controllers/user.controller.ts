import { NextFunction, Request, Response } from "express";
import { PrismaClient } from '@prisma/client';

// const programmingLanguages = require('../services/programmingLanguages.service');

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
      res.json({"test": "test"});
  } catch (err: any) {
      console.error(`Error while getting programming languages`, err.message);
      next(err);
  }
}

// export const login = async (req, res, next) {
//   try {
//       res.json(await programmingLanguages.getMultiple(req.query.page));
//   } catch (err) {
//       console.error(`Error while getting programming languages`, err.message);
//       next(err);
//   }
// }

