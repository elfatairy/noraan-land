import { NextFunction, Request, Response } from "express";
import { prisma } from "../configs/db.config";
import bcrypt from 'bcrypt';
import { generateToken } from "../utils/token.util";
import { OAuth2Client } from "google-auth-library";

export const emailExists = async (email: string) => {
    const user = await prisma.user.findFirst({
        where: {
            email
        }
    });

    return user !== null;
}

export const nameExists = async (name: string) => {
    const user = await prisma.user.findFirst({
        where: {
            name
        }
    });

    return user !== null;
}

export const createUser = async (name: string, email: string, password?: string) => {
    const salt = await bcrypt.genSalt();
    const hashedPassword = password ? await bcrypt.hash(password, salt) : null;

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword
        },
        select: {
            id: true,
            name: true,
            email: true
        }
    });

    return user;
}

export const getUserByEmail = async (email: string) => await prisma.user.findFirst({
    where: {
        email
    },
    select: {
        id: true,
        name: true,
        email: true,
        password: true
    }
});

export const authenticateUser = async (id: number, email: string) => {
    const token = generateToken(id, email, "7d");

    const user = await prisma.user.update({
        where: {
            id
        },
        data: {
            token
        },
        select: {
            id: true,
            name: true,
            email: true
        }
    });

    return { user, token };
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const verifyGoogleToken = async (idToken: string) => {
    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        return { payload: ticket.getPayload() };
    } catch (error) {
        return { error: "Invalid user detected. Please try again" };
    }
}