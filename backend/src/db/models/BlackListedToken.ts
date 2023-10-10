import Mongoose, { Schema, Model } from "mongoose";
import config from "../../config";

const BlackListedTokenSchema: Schema<IBlackListedToken> = new Schema<IBlackListedToken>({
    token: {
        type: String,
        required: true,
        index: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: config.authCookieExpiry,
    },
});

const BlackListedTokenModel: Model<IBlackListedToken> = Mongoose.model<IBlackListedToken>('BlackListedToken', BlackListedTokenSchema);

export default BlackListedTokenModel;