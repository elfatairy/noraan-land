import * as jwt from 'jsonwebtoken';

export const generateToken = (data: Record<string, any>, expiresIn: string) => {
    return jwt.sign(
        data,
        process.env.JWT_SECRET_KEY ?? "",
        { expiresIn }
    );
}