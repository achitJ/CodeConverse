type IUser = {
    name: string;
    email: string;
    password?: string;
    isAdmin: boolean;
    isGoogleUser: boolean;
}

type IUserDocument = IUser & import("mongoose").Document;