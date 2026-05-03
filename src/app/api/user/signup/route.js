import { NextResponse } from "next/server";
import { createHash } from "crypto";
import connectToDatabase from "@/lib/dbConnect";
import User from "@/models/userModel";
import jwt from "jsonwebtoken";
import { signupSchema } from "@/lib/schemas";
import { generateSecureToken } from "@/lib/auth/timingSafe";
import { audit, extractRequestMeta } from "@/lib/auditLog";

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
};

export async function POST(request) {
  try {
    const raw = await request.json();

    // Zod validation
    const parsed = signupSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    const { ip, userAgent } = extractRequestMeta(request);

    await connectToDatabase();
    const user = await User.signup(name, email, password);

    if (!user) {
      return NextResponse.json(
        { error: "Signup failed, user not created." },
        { status: 400 }
      );
    }

    // Generate email verification token
    const rawVerifyToken = generateSecureToken(32);
    const hashedVerifyToken = createHash("sha256").update(rawVerifyToken).digest("hex");
    user.emailVerifyToken = hashedVerifyToken;
    user.emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    await user.save();

    // TODO: PR12 — send verification email with token
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV] Email verify token for ${email}: ${rawVerifyToken}`);
    }

    const token = createToken(user._id);

    const response = NextResponse.json(
      { _id: user._id, name: user.name, email: user.email },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3 * 24 * 60 * 60,
      sameSite: "lax",
      path: "/",
    });

    await audit({ userId: user._id.toString(), action: "SIGNUP", ip, userAgent });

    return response;
  } catch (error) {
    return NextResponse.json({ error: error.message || "Signup failed" }, { status: 400 });
  }
}
