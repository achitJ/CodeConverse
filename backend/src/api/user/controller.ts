import { NextFunction, Request, RequestHandler, Response } from "express";
import UserRepo from "../../db/repository/Users";
import { compare } from "../../utils/hash";
import config from "../../config";
import { setCookie } from "../../utils";

const { jwtSecret, authCookieName, authCookieExpiry } = config;

export const loginUser: RequestHandler = async (
    req: Request, 
    res: Response,
    next: NextFunction
): Promise<void> => {
    const { email, password } = req.body;

    if(!email || !password || typeof email !== 'string' || typeof password !== 'string') {
        res.status(400).json({message: 'Invalid credentials'});
        return;
    }

    try {
        const user = await UserRepo.findByUserEmail(email);

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

        setCookie(user, res);
        
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

    if(!name || !email || !password || typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
        res.status(400).json({message: 'Invalid data'});
        return;
    }

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

        setCookie(user, res);

        res.status(201).json({message: 'User created', user});
    } catch (error) {
        next(error);
    }
}