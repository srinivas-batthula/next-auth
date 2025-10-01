// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from "crypto";
import { connectDB } from '@/lib/dbConnect';
import Token from "@/models/Tokens";
import UserModel from '@/models/User';

// URL-format ==> `/api/auth/reset-password?token=<token>`...
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        // Token Validation...
        const url = new URL(request.url);
        const token = url.searchParams.get("token") || "";
        if (!token) {
            return NextResponse.json({ success: false, message: 'Token Not Found!' }, { status: 400 });
        }

        const result = await helper(token);
        if (!result.success || !result.user || !result.found) {
            return NextResponse.json({ success: result.success || false, message: result.message || "Invalid Token!" }, { status: result.status || 400 });
        }
        const user = result.user;

        // Password Modification...
        const { password } = await request.json() as { password: string };
        if (!password || password.trim().length === 0) {
            return NextResponse.json({ success: false, message: '`Password` Not Found!' }, { status: 400 });
        }

        user.password = password;   // Update PAssword...
        await user.save();
        await Token.findByIdAndDelete(result.found._id);    // Delete Token...

        return NextResponse.json({
            success: true,
            message: 'Password Updated successfully!'
        }, {
            status: 200
        });
    }
    catch (err: any) {
        return NextResponse.json(
            {
                success: false,
                message: 'Error while Updating password!',
            },
            {
                status: 500,
            },
        );
    }
};


export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const url = new URL(req.url);
        const token = url.searchParams.get("token") || "";
        if (!token) {
            return NextResponse.json({ success: false, message: 'Token Not Found!' }, { status: 400 });
        }

        const result = await helper(token);
        return NextResponse.json({ success: result.success, message: result.message }, { status: result.status });
    }
    catch (err: any) {
        // console.error(err);
        return NextResponse.json({ success: false, message: 'Internal Server Error!' }, { status: 500 });
    }
}


const helper = async (token: string) => {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const found = await Token.findOne({ tokenHash, expiresAt: { $gt: new Date() } });
    if (!found) {
        return { success: false, message: 'Invalid or Expired Token!', status: 403 };
    }

    const user = await UserModel.findById(found.userId);
    if (!user) {
        return { success: false, message: 'User Not Found!', status: 404 };
    }

    return { success: true, user, found, message: 'Token is Valid, You can Change your Password!', status: 200 };
}
