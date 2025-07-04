import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectdb } from "@/lib/mongodb";
import User from "@/models/user";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    await connectdb();
    const invitelink = request.nextUrl.searchParams.get("invitelink");
    const { username, planepassword, profilePhoto } = await request.json();
    console.log(username, planepassword);
    if (!username || !planepassword) {
      return NextResponse.json(
        { success: false, message: "bad request" },
        { status: 400 }
      );
    }

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      const hashedPassword = await bcrypt.hash(planepassword, 10);
      const user = await User.create({
        username,
        password: hashedPassword,
        profilePicture: profilePhoto,
        referal: invitelink,
      });

      await user.save();
      const tokenPayload = {
        username,
      };
      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET as string, {
        issuer: "Aditya Rawat",
      });
      (await cookies()).set("token", token, {
        maxAge: 7 * 60 * 60 * 24,
        httpOnly: true,
        path: "/",
        sameSite: true,
      });
      return NextResponse.json(
        { success: true, message: "login successfully" },
        { status: 200 }
      );
    }
    const tokenPayload = {
      username,
    };

    const isPasswordtrue = await bcrypt.compare(planepassword, user?.password);
    if (!isPasswordtrue) {
      return NextResponse.json(
        { success: false, message: "password wrong" },
        { status: 401 }
      );
    }
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET as string, {
      issuer: "Aditya Rawat",
    });
    (await cookies()).set("token", token, {
      maxAge: 7 * 60 * 60 * 24,
      httpOnly: true,
      path: "/",
      sameSite: true,
    });
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
