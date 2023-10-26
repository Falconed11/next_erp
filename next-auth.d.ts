import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
    interface Session {
        user: {
            id: String,
            nama: String,
            peran: String,
        } & DefaultSession
    }

    interface User extends DefaultUser {
        id: String,
        nama: String,
        peran: String,
    }
}
declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        id: String,
        nama: String,
        peran: String,
    }
}