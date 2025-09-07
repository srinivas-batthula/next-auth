// src/app/api/auth/register/route.ts
import { connectDB } from '@/lib/dbConnect';
import UserModel from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationEmail } from '@/helpers/sendVerificationEmail';

/*
    If 'username' & 'email' not found, Creates new User...
    Or Else If 'email' found, But not verified,, then it sends OTP to email for verification...
*/
export async function POST(request: NextRequest) {
    await connectDB();

    try {
        const { email, username, password } = await request.json();
        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            is_verified: true,
        });
        // If 'user' already exists & also 'Verified', then Stop immediately...
        if (existingUserVerifiedByUsername) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Username already taken',
                },
                {
                    status: 400,
                },
            );
        }

        // If 'user' is new  OR  If any Old 'user' but Not-Verified...
        const existingUserByEmail = await UserModel.findOne({
            email
        })

        //generate verify-code
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        if (existingUserByEmail) {
            //if verified return
            if (existingUserByEmail.is_verified) {
                return NextResponse.json({
                    success: false,
                    message: 'Email already verified'
                }, {
                    status: 400
                })
            } else {
                // Account / User is existed but Not-Verified...
                existingUserByEmail.password = password;
                existingUserByEmail.otp = verifyCode;
                existingUserByEmail.otp_expiry = new Date(Date.now() + 3600000);    // OTP-expiry -> 1hr...
                await existingUserByEmail.save();
            }
        } else {
            // New User creation...
            const newUser = new UserModel({     //store user in db
                username,
                email,
                password,
                otp: verifyCode,
                otp_expiry: new Date(Date.now() + 3600000),    // OTP-expiry -> 1hr...
            });
            await newUser.save();
        }

        //send verification code 
        const emailResponse = await sendVerificationEmail(email, username, verifyCode);

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
            message: 'User Registered Successfully, Please Verify Your Email!'
        }, {
            status: 201
        });


    } catch (error) {
        // console.error('Error Registering user', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Error Registering user',
            },
            {
                status: 500,
            },
        );
    }
};
