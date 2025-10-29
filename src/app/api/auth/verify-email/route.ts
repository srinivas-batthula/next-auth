// app/api/auth/verify-email/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import Token from "@/models/Tokens";
import User from "@/models/User";
import crypto from "crypto";

// URL-format ==> `/api/auth/verify-email?token=<token>`...
export async function GET(req: Request) {
    try {
        await connectDB();
        const url = new URL(req.url);
        const token = url.searchParams.get("token") || "";
        if (!token) {
            return new NextResponse(helper('error', 'Token Not Found!'), {
                status: 400,
                headers: {
                    'Content-Type': 'text/html',
                },
            });
        }

        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

        const found = await Token.findOne({ tokenHash, expiresAt: { $gt: new Date() } });
        if (!found) {
            return new NextResponse(helper('error', 'Invalid or Expired Token!'), {
                status: 403,
                headers: {
                    'Content-Type': 'text/html',
                },
            });
        }

        const user = await User.findById(found.userId);
        if (!user) {
            return new NextResponse(helper('error', 'User Not Found!'), {
                status: 404,
                headers: {
                    'Content-Type': 'text/html',
                },
            });
        }

        if (user.is_verified) {
            return new NextResponse(helper('success', 'Email is already verified.'), {
                status: 200,
                headers: { 'Content-Type': 'text/html' },
            });
        }

        user.is_verified = true;
        await user.save();
        await Token.findByIdAndDelete(found._id);

        // Return success HTML with JS-based client redirect
        return new NextResponse(helper('success', "Email Verified! Redirecting to Sign-In..."), {
            status: 200,
            headers: { 'Content-Type': 'text/html' },
        });
    }
    catch (err: any) {
        // console.error(err);
        return new NextResponse(helper('error', "Internal Server Error"), {
            status: 500,
            headers: { 'Content-Type': 'text/html' },
        });
    }
}

// Helper HTML generator
const helper = (type: string, value?: string): string => {
    let message = "";
    let redirectScript = "";

    if (type === 'loading') {
        message = `<h2>Please Wait, Verification under Progress...</h2>`;
    } else if (type === 'error') {
        message = `<h2>Error: </h2><p>${value || "An error occurred during verification."}</p>`;
    } else {
        message = `<h2>Success</h2><p>${value || "Email verified successfully!"}</p><p>You can now log in.</p>`;
        // Add redirect script
        redirectScript = `
            <script>
                setTimeout(() => {
                    window.location.href = "${process.env.NEXT_PUBLIC_HOME}/login";
                }, 2000);
            </script>
        `;
    }

    return `<!DOCTYPE html>
    <html>
        <head>
            <title>Verify Email</title>
        </head>
        <body>
            ${message}
            <p>~Team - NextAuth</p>
            ${redirectScript}
        </body>
    </html>`;
}