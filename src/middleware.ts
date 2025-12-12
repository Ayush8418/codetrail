import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.json({
        success: false,
        message: "Unauthorized User",
      },
      { status: 401 });
  }

  // Create headers to forward token data
  const requestHeaders = new Headers(req.headers);

  requestHeaders.set("x-user-id", token.id);          // DB user ID
  requestHeaders.set("x-user-sub", token.sub || "");        // Google ID
  requestHeaders.set("x-user-name", token.name || "");
  requestHeaders.set("x-user-email", token.email || "");
  requestHeaders.set("x-user-role", token.role || "user");
  requestHeaders.set("x-user-theme", token.theme || "light");
  requestHeaders.set("x-user-provider", token.provider || "");
  requestHeaders.set("x-user-picture", token.picture || "");

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/api/study/:path*", "/api/session"],
};
