import * as jwt from 'jsonwebtoken';

export const generateToken = (userId: number, email: string, expiresIn: string) => {
    return jwt.sign(
        {
            userId,
            email        },
        process.env.JWT_SECRET_KEY ?? "",
        { expiresIn }
    );
}