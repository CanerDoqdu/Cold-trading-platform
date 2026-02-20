import { NextResponse } from "next/server";
import { withErrorHandler } from "@/lib/errors";
import { clearTokenCookies } from "@/lib/security";
import { logger } from "@/lib/logger";

export const POST = withErrorHandler(async () => {
  const response = NextResponse.json(
    { success: true, message: "Logout successful" },
    { status: 200 }
  );

  // Clear both access + refresh token cookies
  clearTokenCookies(response);

  logger.info("User logged out");
  return response;
});
