import { NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { SessionPayload, User } from "@/lib/definitions";
import { cookies } from "next/headers";

const secretKey = process.env.SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

// Encrypt payload and generate JWT
export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

// Decrypt JWT and return payload
export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as SessionPayload;
  } catch (error) {
    console.error("Failed to verify session:", error);
    return null; // Return null if decryption fails
  }
}

// Create a new session and set the token as a cookie
export async function createSession(user: User) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const sessionPayload: SessionPayload = {
    userId: user._id,
    role: user.role,
    createdAt: new Date(),
    expiresAt: expiresAt,
  };
  const session = await encrypt(sessionPayload);

  const response = NextResponse.next();
  response.cookies.set("token", session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });

  return response;
}

// Update an existing session and reset the expiration time
export async function updateSession() {
  // Await the result of cookies() since it's now asynchronous
  const sessionCookies = await cookies();
  const session = sessionCookies.get("token")?.value;

  if (!session) {
    return null;
  }

  const payload = await decrypt(session);

  if (!payload) {
    return null;
  }

  const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const newSessionPayload: SessionPayload = {
    userId: payload.userId,
    role: payload.role,
    createdAt: payload.createdAt,
    expiresAt: newExpiresAt,
  };
  const newSession = await encrypt(newSessionPayload);

  const response = NextResponse.next();
  response.cookies.set("token", newSession, {
    httpOnly: true,
    secure: true,
    expires: newExpiresAt,
    sameSite: "lax",
    path: "/",
  });

  return response;
}

// Delete the session by expiring the token cookie
export function deleteSession() {
  const response = NextResponse.redirect("/");
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: true,
    expires: new Date(0),
    sameSite: "lax",
    path: "/",
  });
  return response;
}
