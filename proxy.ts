import proxy from "next-auth/middleware";

export default proxy;

// export const config = {
//   matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
// };

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
