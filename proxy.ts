import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

export function createLoginRedirectUrl(req: NextRequest, error: string) {
  const requestedPath = `${req.nextUrl.pathname}${req.nextUrl.search}`;
  const redirectParam = encodeURIComponent(requestedPath);
  return new URL(`/login?error=${error}&redirect=${redirectParam}`, req.url);
}

export function redirectToLogin(req: NextRequest, error: string) {
  return NextResponse.redirect(createLoginRedirectUrl(req, error));
}

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api") || pathname === "/login") {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;

  if (!token) {
    console.log("No token found, redirecting to login");
    return redirectToLogin(req, "unauthorized");
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not defined in environment variables");
      throw new Error("Server configuration error");
    }
    const user = verify(token, secret);
    if (!user) {
      console.error("Invalid token, redirecting to login");
      return redirectToLogin(req, "invalid_token");
    }
  } catch (err) {
    console.error(
      `Error occurred while verifying token, redirecting to login`,
      err,
    );
    return redirectToLogin(req, "verification_failed");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
