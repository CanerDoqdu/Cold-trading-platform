import { NextResponse } from "next/server";
import { verifySession } from "@/lib/dal";
import connectToDatabase from "@/lib/dbConnect";
import User from "@/models/userModel";

export async function GET(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const session = await verifySession(token);

    if (!session?._id) {
      // Invalid token - clear it
      const response = NextResponse.json({ user: null }, { status: 200 });
      response.cookies.delete("token");
      return response;
    }

    // Get user data from database
    await connectToDatabase();
    const user = await User.findById(session._id).select("_id name email");

    if (!user) {
      // User not found - clear token
      const response = NextResponse.json({ user: null }, { status: 200 });
      response.cookies.delete("token");
      return response;
    }

    return NextResponse.json({
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Session check error:", error.message);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
