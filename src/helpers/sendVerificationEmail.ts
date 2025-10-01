// src/helpers/sendVerificationEmail.ts
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Load EMAIL_USER and EMAIL_PASS


export const sendVerificationEmail = async (
    email: string,
    username: string,
    url: string,
    subject?: string
): Promise<{ success: boolean; message?: string }> => {
    try {
        // Create the transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // HTML Email Template
        const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4; border-radius: 8px; max-width: 480px; margin: auto;">
        <h2 style="color: #4CAF50;">Hello, ${username} 👋</h2>
        <p>Welcome to <strong>NextAuth-Test</strong>! To verify your account, Follow the link below :</p>
        <a href="${url}">${url}</a>
        <p>This link is valid for <strong>15 minutes</strong> only. Please do not share this link with anyone.</p>
        <br/>
        <p style="font-size: 14px; color: #777;">Thanks & regards,</p>
        <p style="font-size: 14px; color: #777;"><strong>NextAuth-Test Team 🚀</strong></p>
      </div>
    `;

        // Send email
        await transporter.sendMail({
            from: `"NextAuth-Test" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: subject ?? "Verify your NextAuth-Test account!",
            html: htmlContent,
        });

        return { success: true };
    } catch (err) {
        console.error("Failed to send verification email:", err);
        return {
            success: false,
            message: "Failed to send verification email. Please try again later.",
        };
    }
};
