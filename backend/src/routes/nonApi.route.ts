import express from 'express';
import * as studentController from '../controllers/student.controller';
const router = express.Router();

router.get("/callback/paymobResponse", studentController.paymobResponse);

export default router;