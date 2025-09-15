// src/app/api/auth/sendEmail/route.ts
import { connectDB } from '@/lib/dbConnect';
import UserModel from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(request: NextRequest) {
    await connectDB();

    try {
        const { username, password } = await request.json();

        const user = await UserModel.findOne({ username });

        if (user) {
            // update new 'password'...
            user.password = password;
            await user.save();

            return NextResponse.json({
                success: true,
                message: 'Password Updated successfully!'
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
                message: 'Error while Updating password!',
            },
            {
                status: 500,
            },
        );
    }
};
