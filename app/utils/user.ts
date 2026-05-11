import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";

export interface User {
  id: string;
  username: string;
  nama: string;
  peran: string;
  rank: number;
  id_karyawan: number;
  keteranganperan: string;
}

export const getUser = async (): Promise<User | null> => {
  const cookie = await cookies();
  const token = cookie.get("token")?.value;
  if (!token) return null;

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("JWT_SECRET is not defined");
    return null;
  }

  try {
    return verify(token, secret) as unknown as User;
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
};
