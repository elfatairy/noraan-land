import express from "express";
import * as sessionController from "../../controllers/session.controller";
export const router = express.Router();

router.post('/startMeeting/:sessionId', sessionController.startSession) //
router.post('/endSession/:sessionId', sessionController.endSession) //

router.post('/uploadRecords/:sessionId', sessionController.uploadRecords) //