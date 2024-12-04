import express, { Request, Response } from "express";
import * as userController from "../../controllers/user.controller";
export const router = express.Router();

// @swagger
/**
 * /api/users/auth/:
 *   post:
 *     tags:
 *      - Phone Authentication
 *     summary: Verify phone number
 *     description: Verify phone number after a specified time interval
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *             required:
 *               - phoneNumber
 *     responses:
 *       '400':
 *         description: Phone number is required
 *       '401':
 *         description: Phone number is not valid
 *       '404':
 *         description: User not found
 *       '429':
 *         description: Too many auth requests, please try again later.
 *       '409':
 *         description: Phone number is already verified
 *       '403':
 *         description: You have to wait 5 minutes
 *       '200':
 *         description: OTP sent successfully
 *       '500':
 *         description: Internal server error. Something went wrong on the server.
 */
router.post('/login', userController.login);