// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from "crypto";
import { connectDB } from '@/lib/dbConnect';
import UserModel from '@/models/User';
import Token from '@/models/Tokens';
import { sendVerificationEmail } from '@/helpers/sendVerificationEmail';
import { generateResetToken } from '@/helpers/generateToken';
import { registerClient } from "@/lib/sseClients";

/*
    If 'username' & 'email' not found, Creates new User...
    Or Else If 'email' found, But not verified,, then it sends Link to email for verification...
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
        let finalUser;

        // If 'user' is new  OR  If any Old 'user' but Not-Verified...
        const existingUserByEmail = await UserModel.findOne({
            email
        })

        if (existingUserByEmail) {
            //if verified return
            if (existingUserByEmail.is_verified) {
                return NextResponse.json({
                    success: false,
                    message: 'Email already verified'
                }, {
                    status: 400
                })
            }
            finalUser = existingUserByEmail;
        } else {
            // New User creation...
            const newUser = new UserModel({     //store user in db
                username,
                email,
                password
            });
            await newUser.save();
            finalUser = newUser;
        }

        // Remove all previous-tokens for this user...
        await Token.deleteMany({ userId: finalUser._id });

        // Generate crypto-token...
        const { rawToken, tokenHash } = generateResetToken();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);    // 'Token' is valid for only 15-mins...
        await Token.create({ userId: finalUser._id, tokenHash, expiresAt });

        // Generating 'magic-link' with `token` to send in Email to user...
        const verifyUrl = `${process.env.NEXT_PUBLIC_HOME}/api/auth/verify-email?token=${rawToken}`;

        //send verification link 
        const emailResponse = await sendVerificationEmail(email, username, verifyUrl);

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
            message: 'User Registered Successfully, Please Verify Your `Email` to Login!'
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

// To register a new client with a unique `id` for SSE events...
export async function GET(req: Request) {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");
    if (!email) {
        return new Response("Email is required in query-param!", { status: 400 });
    }

    const id = crypto.randomUUID(); // Each SSE client gets a unique id

    const stream = new ReadableStream({
        start(controller) {
            const send = (chunk: string) => controller.enqueue(chunk);  // helper

            registerClient(id, email, send, req.signal);   // Register client with email in 'global store'...

            send(`data: ${JSON.stringify({ type: "SSE-connected", email })}\n\n`); // Initial welcome event
        },
    });

    return new Response(stream, {   // Return SSE response headers to upgrade from 'HTTP to EventStream'...
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
}
