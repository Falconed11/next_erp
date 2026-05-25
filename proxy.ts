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

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Identify the IP using Next.js built-in helper or standard headers
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  // 2. Log it (or send it to your logging service)
  console.log(`[Incoming Request] IP: ${ip} | Path: ${req.nextUrl.pathname}`);

  // Public routes
  if (pathname.startsWith("/api") || pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;

  if (!token) {
    return redirectToLogin(req, "unauthorized");
  }

  try {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET missing");
    }

    verify(token, secret);

    return NextResponse.next();
  } catch (err) {
    console.error("JWT verification failed:", err);

    return redirectToLogin(req, "verification_failed");
  }
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico|.*\\..*).*)"],
};
