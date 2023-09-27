import UserModel from "../models/User";

const a: keyof IUserDocument = 'password';

class UserRepo {
    static async createNewUser({
        name,
        email,
        password,
        isAdmin,
        isGoogleUser
    }: {
        name: string;
        email: string;
        password?: string;
        isAdmin?: boolean;
        isGoogleUser?: boolean;
    }): Promise<IUserDocument> {
        return await UserModel.create({
            name,
            email,
            password,
            isAdmin,
            isGoogleUser
        });
    }

    static async setField<K extends keyof IUserDocument>(
        user: IUserDocument, key: K, value: IUserDocument[K]
    ) {
        user[key] = value;
        await user.save();
        return user;
    }

    static async findByUserEmail(email: string): Promise<IUserDocument | null> {
        const user: IUserDocument | null = await UserModel.findOne({ email });
        return user;
    }

    static async findUserById(id: string): Promise<IUser | null> {
        const user: IUserDocument | null = await UserModel.findById(id);
        return user;
    }
}

export default UserRepo;