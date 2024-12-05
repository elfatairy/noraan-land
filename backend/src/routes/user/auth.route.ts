import express, { Request, Response } from "express";
import * as userController from "../../controllers/user.controller";
export const router = express.Router();

/**
 * @swagger
 * paths:
 *   /api/users/auth/login:
 *     post:
 *       tags:
 *         - Authentication
 *       summary: Login User
 *       description: Login a user with email and password
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                 password:
 *                   type: string
 *               required:
 *                 - email
 *                 - password
 *       responses:
 *         '400':
 *           description: Invalid Payload
 *           content:
 *             application/json:
 *               examples:
 *                 INVALID_PAYLOAD:
 *                   value:
 *                     name: "INVALID_PAYLOAD"
 *                     message: "Invalid payload data"
 *         '404':
 *           description: Not Found
 *           content:
 *             application/json:
 *               examples:
 *                 EMAIL_PASSWORD_INCORRECT:
 *                   value:
 *                     name: "EMAIL_PASSWORD_INCORRECT"
 *                     message: "Either the email or password is incorrect"
 *         '200':
 *           description: Success
 *           content:
 *             application/json:
 *               example:
 *                 value:
 *                   message: "User Logged In Successfully"
 *                   data:
 *                     token: "JWT_TOKEN"
 *                     user:
 *                       id: 1
 *                       email: email@gmail.com
 *                       name: name
 */
router.post('/login', userController.login);

/**
 * @swagger
 * paths:
 *   /api/users/auth/google-login:
 *     post:
 *       tags:
 *         - Authentication
 *       summary: Google Sign in User
 *       description: Authenticate a user with Google signin
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                 password:
 *                   type: string
 *               required:
 *                 - email
 *                 - password
 *       responses:
 *         '400':
 *           description: Invalid Payload
 *           content:
 *             application/json:
 *               examples:
 *                 ERROR_VERIFING_GOOGLE:
 *                   value:
 *                     name: "ERROR_VERIFING_GOOGLE"
 *                     message: "Some error message"
 *                 GOOGLE_ACCOUNT_EMPTY:
 *                   value:
 *                     name: "GOOGLE_ACCOUNT_EMPTY"
 *                     message: "This google account profile's name or email is empty"
 *         '200':
 *           description: Success
 *           content:
 *             application/json:
 *               example:
 *                 value:
 *                   message: "User Logged In Successfully"
 *                   data:
 *                     token: "JWT_TOKEN"
 *                     user:
 *                       id: 1
 *                       email: email@gmail.com
 *                       name: name
 */
router.post('/google-login', userController.googleLogin);

/**
 * @swagger
 * paths:
 *   /api/users/auth/register:
 *     post:
 *       tags:
 *         - Authentication
 *       summary: Register User
 *       description: Register a user with email and password
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                 password:
 *                   type: string
 *               required:
 *                 - email
 *                 - password
 *       responses:
 *         '400':
 *           description: Invalid Payload
 *           content:
 *             application/json:
 *               examples:
 *                 INVALID_PAYLOAD:
 *                   value:
 *                     name: "INVALID_PAYLOAD"
 *                     message: "Invalid payload data"
 *         '409':
 *           description: Conflict
 *           content:
 *             application/json:
 *               examples:
 *                 NAME_ALREADY_EXISTS:
 *                   value:
 *                     name: "NAME_ALREADY_EXISTS"
 *                     message: "Name already exists"
 *                 EMAIL_ALREADY_EXISTS:
 *                   value:
 *                     name: "EMAIL_ALREADY_EXISTS"
 *                     message: "Email already exists"
 *         '200':
 *           description: Success
 *           content:
 *             application/json:
 *               example:
 *                 value:
 *                   message: "User Registered Successfully"
 *                   data:
 *                     token: "JWT_TOKEN"
 *                     user:
 *                       id: 1
 *                       email: email@gmail.com
 *                       name: name
 */
router.post('/register', userController.register);