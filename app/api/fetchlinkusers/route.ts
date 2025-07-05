import { connectdb } from "@/lib/mongodb";
import User from "@/models/user";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const username = req.nextUrl.searchParams.get("username");
    if (!username) {
      return NextResponse.json({ message: "Bad request" }, { status: 400 });
    }
    await connectdb();
    const users = await User.find({ referal: username });

    // Always return users array, even if empty
    return NextResponse.json({ users: users || [] }, { status: 200 });
  } catch (error) {
    console.log((error as Error).message);
    return NextResponse.json(
      { message: "Internal server issue", users: [] },
      { status: 500 }
    );
  }
}
