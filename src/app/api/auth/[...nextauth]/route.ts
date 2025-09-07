// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import type { NextAuthOptions, Session, User as NextAuthUser } from "next-auth";
import type { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/dbConnect";
import UserModel from "@/models/User";
import bcrypt from 'bcryptjs';


// Extend JWT token structure
interface CustomToken extends JWT {
    _id?: string;
    username?: string;
    is_verified?: boolean;
}

// Extend session user structure
interface CustomSession extends Session {
    user: Session["user"] & {
        _id?: string;
        username?: string;
        is_verified?: boolean;
    };
}

export const authOptions: NextAuthOptions = {
    providers: [
        // Google OAuth
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),

        // GitHub OAuth
        GitHubProvider({
            clientId: process.env.LOCALHOST_GITHUB_CLIENT_ID!,
            clientSecret: process.env.LOCALHOST_GITHUB_CLIENT_SECRET!,
        }),

        // Credentials Provider (username/email login)
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email or Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            // This `authorize()` function is called when u call 'signIn()'...
            async authorize(credentials): Promise<NextAuthUser | null> {
                await connectDB();

                const identifier = credentials?.email;
                const plainPassword = credentials?.password;

                if (!identifier || !plainPassword) return null;

                // Find by email or username
                const user = await UserModel.findOne({
                    $or: [{ email: identifier }, { username: identifier }],
                });

                if (!user) throw new Error("User not found");
                if (!user.is_verified) throw new Error("Account not verified, Please Re-SignUp to Verify your Email!");

                // Dynamic `password` checks to avoid mismatches/issues b/w OAuth users && Manual LogIn users...
                if (user.is_from_oauth) {     // If 'user' was logged-in via 'OAuth' previously, And now he came up with manual Login...
                    const hashedPassword = await bcrypt.hash(plainPassword, 10);
                    await UserModel.findByIdAndUpdate(
                        user._id,
                        {
                            password: hashedPassword,
                            is_from_oauth: false,
                        },
                        {
                            new: true,               // return updated document
                            runValidators: true,     // ensure schema validation is enforced
                            context: 'query',        // required for some Mongoose validators to work correctly
                        }
                    );
                }
                else if (!user.password) {    // If user is not from 'OAuth', And 'password' is not found...
                    throw new Error("No password set");
                }
                else {
                    const isPasswordValid = await user.comparePassword(plainPassword);
                    if (!isPasswordValid) throw new Error("Invalid password");
                }

                return {
                    id: (user as { _id: { toString(): string } })._id.toString(),
                    name: user.username,
                    email: user.email,
                };
            },
        }),
    ],

    // Session & JWT callbacks
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                const dbUser = await UserModel.findOne({ email: user.email });
                token._id = (dbUser as { _id: { toString(): string } })._id.toString();
                token.username = dbUser?.username;
                token.is_verified = dbUser?.is_verified;
                // console.log("JWT Token: ", token);
            }
            return token as CustomToken;
        },

        async session({ session, token }) {
            const customSession = session as CustomSession;
            customSession.user._id = typeof token._id === "string" ? token._id : undefined;
            customSession.user.username = typeof token.username === "string" ? token.username : undefined;
            customSession.user.is_verified = typeof token.is_verified === "boolean" ? token.is_verified : undefined;
            // console.log("Session: ", session);
            return customSession;
        },
        // Save OAuth users to DB if not present
        async signIn({ user }) {
            await connectDB();
            if (!user?.email) return false;

            const exists = await UserModel.findOne({ email: user.email });
            if (!exists) {
                await UserModel.create({
                    email: user.email,
                    username: user.name?.split(" ").join("_").toLowerCase() || "user",
                    is_from_oauth: true,
                    is_verified: true, // You can choose to mark OAuth-users as verified
                });
            }
            return true;
        },
    },

    pages: {
        signIn: "/login", // Redirects to Custom `/login` page, If any Error occurs in the manual sign-in flow...
    },

    session: {
        strategy: "jwt",
    },

    secret: process.env.JWT_SECRET,
};


const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
