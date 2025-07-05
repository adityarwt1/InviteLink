import { connectdb } from "@/lib/mongodb";
import User from "@/models/user";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const username = req.nextUrl.searchParams.get("username") || null;
    if (!username) {
      return NextResponse.json({ message: "bad request" }, { status: 400 });
    }
    await connectdb();
    try {
      const user = await User.findOne({ username: username });
      if (!user) {
        return NextResponse.json(
          { message: "user not found", user: {} },
          { status: 404 }
        );
      }
      return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
      console.log((error as Error).message);
    }
  } catch (error) {
    console.log((error as Error).message);
    return NextResponse.json(
      { message: "Internal server issue" },
      { status: 500 }
    );
  }
}
