import jwt from "jsonwebtoken";
import config from "../config";
import { Response } from "express";
const {
    authCookieName,
    authCookieExpiry,
    jwtSecret,
} = config;

export function setCookie(user: IUserDocument, res: Response) {
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: authCookieExpiry });

    res.cookie(authCookieName, token, {
        maxAge: authCookieExpiry,
        httpOnly: true,
        secure: true,
    });
}

export function validateEmail(email: string) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email);
};