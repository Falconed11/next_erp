import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      nama: string;
      peran: string;
      rank: number;
      keteranganperan: string;
    } & DefaultSession;
  }

  interface User extends DefaultUser {
    id: string;
    nama: string;
    peran: string;
    rank: number;
    keteranganperan: string;
  }
}
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    nama: string;
    peran: string;
    rank: number;
    keteranganperan: string;
  }
}
