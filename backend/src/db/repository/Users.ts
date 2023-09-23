import { MongooseError, Document } from "mongoose";
import { IUser } from "database-models";
import UserModel from "../models/User";

type IUserDocument = IUser & Document;

class UserRepo {
    static async createNewUser({
        name,
        email,
        password,
        isAdmin,
        isGoogleUser
    }: IUser) : Promise<IUserDocument | MongooseError | undefined> {
        try {
            const newUser:IUserDocument = new UserModel({
                name,
                email,
                password,
                isAdmin,
                isGoogleUser
            });
            await newUser.save();
            return newUser;
        } catch (error) {
            if(error instanceof MongooseError) {
                return error;
            }
            console.log(error);
        }
    }

    static async findByUserEmail(email: string):
    Promise<IUserDocument | MongooseError | undefined | null> {

        try {
            const user: IUserDocument | null = await UserModel.findOne({email});
            return user;
        } catch (error) {
            if(error instanceof MongooseError) {
                return error;
            }
            console.log(error);
        }
    }

    static async findUserById(id: string): 
    Promise<IUser | MongooseError | undefined | null> {
        try {
            const user: IUserDocument | null = await UserModel.findById(id);
            return user;
        } catch (error) {
            if(error instanceof MongooseError) {
                return error;
            }
            console.log(error);
        }
    }
}

export default UserRepo;