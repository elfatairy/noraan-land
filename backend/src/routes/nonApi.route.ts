import express from 'express';
import * as userController from '../controllers/user.controller';
const router = express.Router();

router.get("/callback/paymobResponse", userController.paymobResponse);

export default router;