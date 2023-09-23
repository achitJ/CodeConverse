declare module "database-models" {
    export interface IUser {
        name: string;
        email: string;
        password?: string;
        isAdmin: boolean;
        isGoogleUser: boolean;
    }
}