import { MongooseError } from "mongoose";

export function errorHandler(error: unknown) {
    if (error instanceof MongooseError) {
        throw new Error(error.message);
    }
    
    console.log(error);

    return null;
}