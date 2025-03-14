import * as jwt from 'jsonwebtoken';
import { StringValue } from '../../types';

export const generateToken = (data: Record<string, any>, expiresIn: StringValue) => {
    return jwt.sign(
        data,
        process.env.JWT_SECRET_KEY ?? "",
        { expiresIn }
    );
}