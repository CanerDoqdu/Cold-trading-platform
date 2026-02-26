import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/dbConnect";
import User from "@/models/userModel";
import jwt from "jsonwebtoken";
import { loginSchema } from "@/lib/schemas";
import { isAccountLocked, recordFailedLogin, resetLoginAttempts } from "@/lib/auth/lockout";
import { audit, extractRequestMeta } from "@/lib/auditLog";

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
};

export async function POST(request) {
  try {
    const raw = await request.json();

    // Zod validation
    const parsed = loginSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const { ip, userAgent } = extractRequestMeta(request);

    // Account lockout check
    const lockStatus = await isAccountLocked(email);
    if (lockStatus.locked) {
      return NextResponse.json(
        { error: `Account temporarily locked. Try again in ${lockStatus.retryAfter}s.` },
        { status: 429 }
      );
    }

    await connectToDatabase();

    let user;
    try {
      user = await User.login(email, password);
    } catch (err) {
      // Record failed attempt
      await recordFailedLogin(email);
      await audit({ userId: email, action: "LOGIN_FAILURE", ip, userAgent, metadata: { reason: err.message } });
      return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
    }

    if (!user) {
      await recordFailedLogin(email);
      await audit({ userId: email, action: "LOGIN_FAILURE", ip, userAgent });
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 400 }
      );
    }

    // If 2FA is enabled, return temp token instead of full session
    if (user.totpEnabled) {
      const tempToken = jwt.sign({ _id: user._id }, process.env.SECRET, { expiresIn: "5m" });
      return NextResponse.json(
        { requires2FA: true, tempToken },
        { status: 200 }
      );
    }

    // Reset lockout on success
    await resetLoginAttempts(email);

    const token = createToken(user._id);
    if (!token) throw new Error("Token creation failed.");

    // Session fixation prevention: always new token on login
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

    await audit({ userId: user._id.toString(), action: "LOGIN_SUCCESS", ip, userAgent });

    return response;
  } catch (error) {
    return NextResponse.json({ error: error.message || "Login failed" }, { status: 400 });
  }
}
