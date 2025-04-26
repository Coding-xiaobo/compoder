import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser {
    username: string;
    password: string;
    name: string;
    email: string;
    image?: string;
    comparePassword: (password: string) => Promise<boolean>;
}

const UserSchema = new mongoose.Schema<IUser>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        image: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// 密码哈希处理
UserSchema.pre("save", async function (next) {
    const user = this;

    if (!user.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        next();
    } catch (error: any) {
        next(error);
    }
});

// 密码比较方法
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
};

export const UserModel = mongoose.models.User || mongoose.model<IUser>("User", UserSchema); 