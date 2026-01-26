import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/dbConnect";
import User from "../../../../models/userModel";
import jwt from "jsonwebtoken";

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
};

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      console.error("Email or password missing.");
      return NextResponse.json(
        { error: "All fields must be filled." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const user = await User.login(email, password);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 400 }
      );
    }

    const token = createToken(user._id);
    if (!token) throw new Error("Token creation failed.");

    const response = NextResponse.json(
      { _id: user._id, name: user.name, email: user.email },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3 * 24 * 60 * 60,
      path: "/",
    });

    console.log("Login successful, cookie set.");
    return response;
  } catch (error) {
    console.error("Login error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
