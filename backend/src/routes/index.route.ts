import express from 'express';
const router = express.Router();
import { router as studentRouter } from './student.route';
import { router as adminRouter } from './admin.route';
import { router as courseRouter } from './course.route'
import { router as calednarRouter } from './calendar.route'
import { router as materialRouter } from './material.route'
import { verifyToken } from '../middlewares/auth.middleware';

router.use("/students", studentRouter); //
router.use("/admin", adminRouter); //
router.use("/calendar", calednarRouter); //
router.use("/courses", courseRouter); //

router.use("/materials", verifyToken, materialRouter); //

export default router;