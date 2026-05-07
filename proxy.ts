// import { withAuth as proxy } from "next-auth/middleware";

// export default proxy;

// export const config = {
//   matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)"],
// };

import { NextRequest, NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api") || pathname === "/login") {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const user = verify(token, process.env.JWT_SECRET!);
    if (!user) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  } catch (err) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
