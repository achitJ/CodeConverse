import { Request, Response } from "express";

declare global {
    interface RequestWithUser extends Request {
        user?: {
            id: string,
        }
    }

    interface ResponseWithUser extends Response {
        user?: {
            id: string,
        }
    }
}