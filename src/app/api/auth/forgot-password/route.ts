// app/api/auth/forgot-password/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import User from "@/models/User";
import Token from "@/models/Tokens";
import { generateResetToken } from "@/helpers/generateToken";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";


export async function POST(req: Request) {
    await connectDB();

    try {
        const { email } = await req.json(); // email ==> email / username...

        const user = await User.findOne({  // Find the 'user' with given `username / email` in DB...
            $or: [
                { username: email },
                { email: email }
            ]
        });

        if (user) {
            await Token.deleteMany({ userId: user._id });   // Remove all previous-tokens for this user...

            // Generate crypto-token...
            const { rawToken, tokenHash } = generateResetToken();
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000);    // 'Token' is valid for only 15-mins...
            await Token.create({ userId: user._id, tokenHash, expiresAt });

            // Generating 'magic-link' with `token` to send in Email to user...
            const resetUrl = `${process.env.NEXT_PUBLIC_HOME}/reset-password?token=${rawToken}`;

            //send verification email with magic-link... 
            const emailResponse = await sendVerificationEmail(user.email, user.username, resetUrl, "Forgot-Password Request!");
            if (!emailResponse.success) {
                return NextResponse.json({
                    success: false,
                    message: emailResponse.message
                }, {
                    status: 500
                })
            }

            return NextResponse.json({
                success: true,
                message: 'Verification-Link Sent Your Email!'
            }, {
                status: 200
            });
        }
        else {
            return NextResponse.json({
                success: false,
                message: 'User Not Found!'
            }, {
                status: 404
            })
        }
    }
    catch (err: any) {
        return NextResponse.json(
            {
                success: false,
                message: 'Error while Sending Email!',
            },
            {
                status: 500,
            },
        );
    };
}
