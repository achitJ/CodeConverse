import { NextFunction, Response } from "express";
import jwt from 'jsonwebtoken';
import config from '../config';

const { jwtSecret, authCookieName } = config;

export const auth = (req:RequestWithUser, res:Response, next:NextFunction):void => {
    const token = req.cookies[authCookieName];

    if(!token) {
        res.status(401).json({ msg: 'No token, authorization denied' });
        return;
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        if(!decoded || typeof decoded === 'string') {
            res.status(401).json({ message: 'Token is not valid' });
            return;
        }

        req.user = {id: decoded.id};
        next();
    } catch(err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
}