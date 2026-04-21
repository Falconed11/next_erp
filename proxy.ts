// export { default } from "next-auth/middleware";

import { withAuth as proxy } from "next-auth/middleware";

export default proxy;

export const config = {
  // Let NextAuth handle its own API endpoints directly.
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};

// import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
//
// export default withAuth(
//     function middleware(request: NextRequestWithAuth) {
//     },
//     // {
//     //     callbacks: {
//     //         authorized: ({ token }) => token?.peran === "admin"
//     //     },
//     // }
// )
