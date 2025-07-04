import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectdb } from "@/lib/mongodb";
import User from "@/models/user";

export async function POST(request: NextRequest) {
  try {
    await connectdb();
    const invitelink = request.nextUrl.searchParams.get("invitelink");
    const { username, password, profilePhoto } = await request.json();
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "bad request" },
        { status: 400 }
      );
    }

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      const hashedPassword = bcrypt.hash(password, 10);
      const user = await User.create({
        username,
        hashedPassword,
        profilePicture: profilePhoto,
        referal: invitelink,
      });
      await user.save();
      return NextResponse.json(
        { success: true, message: "login successfully" },
        { status: 200 }
      );
    }
    const isPasswordtrue = bcrypt.compare(password, user?.password);
    if (!isPasswordtrue) {
      return NextResponse.json(
        { success: false, message: "password wrong" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: true, message: "login successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
