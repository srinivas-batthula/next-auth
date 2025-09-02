// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import type { NextAuthOptions, Session, User as NextAuthUser } from "next-auth";
import type { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/mongodb";
import UserModel, { IUser } from "@/models/User";
import bcrypt from "bcrypt";

// custom token that extends next-auth JWT
interface CustomToken extends JWT {
    id?: string;
}

// Custom session shape (add id to user)
interface CustomSession extends Session {
    user: Session["user"] & { id?: string };
}

// Helper to map mongoose user doc -> NextAuth user object
function toNextAuthUser(userDoc: IUser): NextAuthUser {
    return {
        id: (userDoc._id as unknown as { toString(): string }).toString() ?? undefined,
        name: userDoc.name ?? undefined,
        email: userDoc.email ?? undefined,
        image: userDoc.image ?? undefined,
    };
}

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            // authorize MUST return a plain NextAuth user or null
            async authorize(credentials, req): Promise<NextAuthUser | null> {
                if (!credentials?.email || !credentials?.password) return null;

                await connectDB();

                // use `.lean()` to get plain object OR get doc and map fields
                const userDoc = await UserModel.findOne({ email: credentials.email }).exec();
                if (!userDoc) return null;

                // ensure password exists (credentials users should have hashed password)
                if (!userDoc.password) return null;

                const isValid = await bcrypt.compare(credentials.password, userDoc.password);
                if (!isValid) return null;

                // return plain NextAuth user object (NOT a mongoose document)
                return toNextAuthUser(userDoc);
            },
        }),
    ],
    callbacks: {
        // token callback: add id from user to token
        async jwt({ token, user }): Promise<CustomToken> {
            const t = token as CustomToken;
            // when user signs in (initial sign in), 'user' is present
            if (user) {
                // user.id should exist because authorize/adapter provided it
                t.id = (user as NextAuthUser).id;
            }
            return t;
        },

        // session callback: add id from token to session.user.id
        async session({ session, token }): Promise<CustomSession> {
            const s = session as CustomSession;
            const t = token as CustomToken;
            if (t.id) s.user.id = t.id;
            return s;
        },

        // signIn callback: ensure OAuth users are saved to DB
        async signIn({ user }) {
            // user here is the NextAuth User object returned by provider
            await connectDB();

            if (!user?.email) return false;

            // if the user already exists, do nothing
            const existing = await UserModel.findOne({ email: user.email }).exec();
            if (!existing) {
                // create new DB record for OAuth user (no password)
                await UserModel.create({
                    email: user.email,
                    name: user.name,
                    image: user.image,
                });
            }
            return true;
        },
    },
    session: { strategy: "jwt" },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
