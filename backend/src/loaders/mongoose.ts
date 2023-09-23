import mongoose from "mongoose";
import config from "../config";

const { mongoURI } = config;

export default async function connect() {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error(error);
    }
}