import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();
        await connectDB();

        const existing = await User.findOne({ email });
        if (existing) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        const hashed = await bcrypt.hash(password, 10);
        await User.create({ name, email, password: hashed });

        return NextResponse.json({ message: "User created" });
    } catch {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
