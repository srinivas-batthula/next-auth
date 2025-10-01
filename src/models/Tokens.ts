// src/models/User.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IToken extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    tokenHash: string;
    expiresAt: Date;
    createdAt: Date;
}

const userSchema = new Schema<IToken>(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
        tokenHash: { type: String, required: true, index: true },
        expiresAt: { type: Date, required: true, index: { expires: 0 }}, // auto-delete when expired,
        createdAt: { type: Date, default: Date.now },
    }
);

const Token: Model<IToken> =
    mongoose.models.tokens || mongoose.model<IToken>("tokens", userSchema);
export default Token;
