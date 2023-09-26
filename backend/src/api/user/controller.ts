import { NextFunction, Request, RequestHandler, Response } from "express";
import { MongooseError } from "mongoose";
import jwt from "jsonwebtoken";
import UserRepo from "../../db/repository/Users";
import { compare } from "../../utils/hash";
import config from "../../config";

const { jwtSecret, authCookieName, authCookieExpiry } = config;

export const loginUser: RequestHandler = async (
    req: Request, 
    res: Response,
    next: NextFunction
): Promise<void> => {
    const { email, password } = req.body;
    try {
        const user = await UserRepo.findByUserEmail(email);
        
        if(!email || !password) {
            res.status(400).json({message: 'Invalid credentials'});
            return;
        }

        if(!user) {
            res.status(404).json({message: 'User not found'});
            return;
        }

        if(!user.password) {
            res.status(400).json({message: 'Use google login instead'});
            return;
        }

        if(!compare(password, user.password)) {
            res.status(400).json({message: 'Invalid credentials'});
            return;
        }

        const token = jwt.sign({id: user._id}, jwtSecret, {expiresIn: '1d'});

        res.cookie(authCookieName, token, {
            maxAge: authCookieExpiry,
            httpOnly: true,
            secure: true,
        });
        
        res.status(200).json({message: 'Login successful', user});
    } catch (error) {
        next(error);
    }
} 

export const registerUser: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const { name, email, password } = req.body;
    try {

        const tempUser = await UserRepo.findByUserEmail(email);

        if(tempUser) {
            res.status(400).json({message: 'User already exists'});
            return;
        }

        const user = await UserRepo.createNewUser({
            name,
            email,
            password
        });

        if(!user) {
            res.status(400).json({message: 'User not created'});
            return;
        }

        const token = jwt.sign({id: user._id}, jwtSecret, {expiresIn: '1d'});

        res.cookie(authCookieName, token, {
            maxAge: authCookieExpiry,
            httpOnly: true,
            secure: true,
        });

        res.status(201).json({message: 'User created', user});
    } catch (error) {
        next(error);
    }
}