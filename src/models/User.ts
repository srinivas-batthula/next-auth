// src/models/User.ts
import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from 'bcryptjs';


export interface IUser extends Document {
    username: string;
    email: string;
    password?: string;
    is_verified: boolean;
    is_from_oauth: boolean;

    comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
    {
        username: { type: String, required: [true, 'Username is required!'], unique: true, trim: true },
        email: { type: String, required: [true, 'Email is required!'], unique: true, match: [/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g, 'please use a Valid Email Address!'] },
        password: { type: String, default: null },
        
        is_from_oauth: { type: Boolean, default: false }, // Set to `TRUE` If the 'user' is logged-In via 'OAuth' like Google...
        is_verified: { type: Boolean, default: false }, // Email Verified via OTP...
    },
    { timestamps: true }
);

// Password hash middleware
userSchema.pre("save", async function (next) {
    if (this.isModified("password") && this.password) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// Compare password method
userSchema.methods.comparePassword = function (candidate: string) {
    return bcrypt.compare(candidate, this.password!);
};


const User: Model<IUser> =
    mongoose.models.users || mongoose.model<IUser>("users", userSchema);
export default User;
