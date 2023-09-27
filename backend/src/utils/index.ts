import jwt from "jsonwebtoken";
import config from "../config";
import { Response } from "express";
const {
    authCookieName,
    authCookieExpiry,
    jwtSecret,
} = config;

export function setCookie(user: IUserDocument, res: Response) {
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1d' });

    res.cookie(authCookieName, token, {
        maxAge: authCookieExpiry,
        httpOnly: true,
        secure: true,
    });
}