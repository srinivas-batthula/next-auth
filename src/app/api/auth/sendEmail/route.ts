// src/app/api/auth/sendEmail/route.ts
import { connectDB } from '@/lib/dbConnect';
import UserModel from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationEmail } from '@/helpers/sendVerificationEmail';


export async function POST(request: NextRequest) {
    await connectDB();

    try {
        const { email } = await request.json(); // email ==> email / username...

        const user = await UserModel.findOne({  // Find the 'user' with given `username / email` in DB...
            $or: [
                { username: email },
                { email: email }
            ]
        });

        if (user) {
            //generate verify-code
            const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
            user.otp = verifyCode;
            user.otp_expiry = new Date(Date.now() + 3600000);    // OTP-expiry -> 1hr...
            await user.save();

            //send verification code 
            const emailResponse = await sendVerificationEmail(user.email, user.username, verifyCode);
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
                message: 'Verification Code Sent Your Email!'
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
    }
};
