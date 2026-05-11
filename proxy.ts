import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api") || pathname === "/login") {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;
  if (!token) {
    console.log("No token found, redirecting to login");
    return NextResponse.redirect(new URL("/login?error=unauthorized", req.url));
  }

  try {
    const user = verify(token, process.env.JWT_SECRET!);
    if (!user) {
      console.log("Invalid token, redirecting to login");
      return NextResponse.redirect(
        new URL("/login?error=invalid_token", req.url),
      );
    }
  } catch (err) {
    console.log("Error occurred while verifying token, redirecting to login");
    return NextResponse.redirect(
      new URL("/login?error=verification_failed", req.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
