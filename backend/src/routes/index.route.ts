import express from 'express';
const router = express.Router();
import { router as userRouter } from './user.route';
import { router as adminRouter } from './admin.route';
import { router as courseRouter } from './course.route'
import { router as sessionRouter } from './session.route'
import { router as calednarRouter } from './calendar.route'

router.use("/users", userRouter);
router.use("/admin", adminRouter);
router.use("/courses", courseRouter);
router.use("/sessions", sessionRouter);
router.use("/calendar", calednarRouter);

export default router;