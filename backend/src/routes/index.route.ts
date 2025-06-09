import express from 'express';
import { router as studentRouter } from './student.route';
import { router as adminRouter } from './admin.route';
import { router as courseRouter } from './course.route'
import { router as calednarRouter } from './calendar.route'
import { router as materialRouter } from './material.route'
import { verifyToken } from '../middlewares/auth.middleware';
import { convertUSDtoEGP } from '../utils/helper.util';
const router = express.Router();

router.use("/students", studentRouter); //
router.use("/admin", adminRouter); //
router.use("/calendar", calednarRouter); //
router.use("/courses", courseRouter); //

router.use("/materials", verifyToken, materialRouter); //
router.get("/converstionRate", verifyToken, async (req, res) => {
  const rate = await convertUSDtoEGP(1);
  res.json({ rate });
});

export default router;