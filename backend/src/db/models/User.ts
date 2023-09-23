import Mongoose, { Schema, Model } from "mongoose";
import { hash } from "../../utils/hash";
import { IUser } from "database-models";

const UserSchema: Schema<IUser> = new Schema<IUser>({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 255,
        unique: true,
        index: true,
    },
    password: {
        type: String,
        minlength: 8,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isGoogleUser: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true,
});

UserSchema.methods.toJSON = function() {

    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.createdAt;
    delete userObject.updatedAt;
    delete userObject.__v;

    return userObject;
}

UserSchema.pre('save', function(next) {
    if(!this.password || !this.isModified('password')) {
        return next();
    }

    this.password = hash(this.password);
    next();
})


const UserModel: Model<IUser> = Mongoose.model<IUser>('User', UserSchema);

export default UserModel;