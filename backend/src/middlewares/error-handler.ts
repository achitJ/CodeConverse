import { ErrorRequestHandler } from "express";
import { MongooseError } from "mongoose";

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.log(err);

    if(err instanceof MongooseError) {
        if(err.name === 'ValidationError') {
            return res.status(400).json({message: 'Invalid data'});
        }
    }

    res.status(500).send({message: "Internal Server Error"});
}

export default errorHandler;