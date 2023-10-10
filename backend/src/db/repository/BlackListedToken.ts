import BlackListedTokenModel from "../models/BlackListedToken";

class BlackListedTokenRepo {
    static async createNewToken(token: string): Promise<IBlackListedToken> {
        return await BlackListedTokenModel.create({ token });
    }

    static async findToken(token: string): Promise<IBlackListedToken | null> {
        const blackListedToken: IBlackListedToken | null = await BlackListedTokenModel.findOne({ token });
        return blackListedToken;
    }
}

export default BlackListedTokenRepo;