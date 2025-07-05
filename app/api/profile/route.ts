import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/models/user";
import { connectdb } from "@/lib/mongodb";
export async function POST(req: NextRequest) {
  try {
    await connectdb();
    const token = (await cookies()).get("token")?.value || null;
    if (!token) {
      const url = new URL("/", req.url);
      return NextResponse.redirect(url);
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    if (!decoded || typeof decoded !== "object" || !("username" in decoded)) {
      return NextResponse.json(
        { message: "failed to decode the token" },
        { status: 200 }
      );
    }
    const user = await User.findOne({ username: (decoded as any).username });
    if (!user) {
      return NextResponse.json(
        { message: "user not found ", data: {} },
        { status: 404 }
      );
    }
    return NextResponse.json({ data: user }, { status: 200 });
  } catch (error) {
    console.log((error as Error).message);
    return NextResponse.json(
      { message: "Internal sever issue" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { formData } = await req.json();
    if (!formData) {
      return NextResponse.json({ message: "bad request" }, { status: 400 });
    }
    console.log(formData);
    return NextResponse.json(
      { message: "Profile update successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.log(error as Error);
    return NextResponse.json(
      { message: "Internal server issue" },
      { status: 500 }
    );
  }
}
