import express, { NextFunction, Request, Response } from "express";
import * as sessionController from "../controllers/session.controller";
import * as studentController from "../controllers/student.controller"
import * as adminController from "../controllers/admin.controller"
import { checkAdmin } from "../middlewares/auth.middleware";
import { ROLES } from "../utils/constants.util";

export const router = express.Router({ mergeParams: true });

router.post('/', checkAdmin, sessionController.createSession); //
router.patch('/:sessionId/updateDate', checkAdmin, sessionController.updateSessionDate); //
router.delete('/:sessionId/cancel', checkAdmin, sessionController.cancelSession); //

router.get('/', (req: Request, res: Response, next: NextFunction) => { //
  if(res.locals.role === ROLES.ADMIN) {
      return adminController.getCourseSessions(req, res, next);    
  } else if (res.locals.role === ROLES.USER){
      return studentController.getCourseSessions(req, res, next);    
  }
})