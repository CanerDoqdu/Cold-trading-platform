import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/dbConnect";
import User from "@/models/userModel";
import { withErrorHandler, AppError } from "@/lib/errors";
import { validate, schemas, sanitizeUser, createTokenPair, setTokenCookies, attachCsrfToken } from "@/lib/security";
import { logger } from "@/lib/logger";

export const POST = withErrorHandler(async (request) => {
  const body = await request.json();

  // Server-side validation (blocks NoSQL injection, enforces format)
  const { email, password } = validate(body, schemas.login);

  await connectToDatabase();
  const user = await User.login(email, password);

  if (!user) {
    throw new AppError("INVALID_CREDENTIALS");
  }

  // Generate access + refresh token pair
  const tokens = await createTokenPair(user._id.toString(), user.role);

  const response = NextResponse.json(
    sanitizeUser(user), // strips password, __v, etc.
    { status: 200 }
  );

  // Set httpOnly cookies (access + refresh)
  setTokenCookies(response, tokens);

  // Attach CSRF token for subsequent requests
  attachCsrfToken(response);

  logger.info("User logged in", { userId: user._id.toString() });
  return response;
});
