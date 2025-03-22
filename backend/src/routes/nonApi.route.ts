import express from 'express';
import * as studentController from '../controllers/student.controller';
const router = express.Router();

router.get("/callback/paymobProcessed", (req, res) => {
  res.send("Approved");
});
router.post("/callback/paymobResponse", studentController.paymobResponse);
router.post("/callback/subscriptionWebhook", studentController.subscriptionWebhook);

export default router;