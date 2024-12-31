import express from 'express';
const router = express.Router();
import { router as userRouter } from './user.route';
import { router as adminRouter } from './admin.route';
import { router as courseRouter } from './course.route'
import { router as sessionRouter } from './session.route'
import { router as calednarRouter } from './calendar.route'
import { router as materialRouter } from './material.route'
import { validateCourse } from '../middlewares/validation.middleware';
import { verifyToken } from '../middlewares/auth.middleware';

router.use("/users", userRouter);
router.use("/admin", adminRouter);
router.use("/calendar", calednarRouter);
router.use("/sessions", sessionRouter);
router.use("/courses", courseRouter);

router.use("/materials", verifyToken, materialRouter);

export default router;