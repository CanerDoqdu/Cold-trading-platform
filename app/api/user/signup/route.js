import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/dbConnect";
import User from "@/models/userModel";
import { withErrorHandler, AppError } from "@/lib/errors";
import { validate, schemas, sanitizeUser, createTokenPair, setTokenCookies, attachCsrfToken } from "@/lib/security";
import { logger } from "@/lib/logger";

export const POST = withErrorHandler(async (request) => {
  const body = await request.json();

  // Server-side validation (name 2-50 chars, valid email, password 6-128 chars)
  const { name, email, password } = validate(body, schemas.signup);

  await connectToDatabase();

  // Check for existing user before attempting signup
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("EMAIL_IN_USE");
  }

  const user = await User.signup(name, email, password);

  if (!user) {
    throw AppError.internal("Signup failed, user not created");
  }

  // Generate access + refresh token pair
  const tokens = await createTokenPair(user._id.toString(), user.role);

  const response = NextResponse.json(
    sanitizeUser(user),
    { status: 201 }
  );

  // Set httpOnly cookies
  setTokenCookies(response, tokens);

  // Attach CSRF token
  attachCsrfToken(response);

  logger.info("User signed up", { userId: user._id.toString() });
  return response;
});
