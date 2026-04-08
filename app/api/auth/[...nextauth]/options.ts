import { API_PATH, getApiPath } from "@/app/utils/apiconfig";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

console.log(API_PATH);

export const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {
          label: "Username",
          type: "text",
          placeholder: "Masukkan username",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Masukkan password",
        },
      },
      async authorize(credentials) {
        try {
          const url = `${getApiPath()}login`;
          console.log(url);

          const res = await fetch(url, {
            method: "POST",
            body: JSON.stringify(credentials),
            headers: { "Content-Type": "application/json" },
          });

          if (!res.ok) {
            console.error("Status:", res.status);
            console.error(await res.text());
            return null;
          }

          const user = await res.json();
          if (user?.id) return user;

          return null;
        } catch (err) {
          console.error("Authorize error:", err);
          return null;
        }
      },
    }),
  ],
  session: { maxAge: 1 * 18 * 60 * 60 }, // day, hour, minute, second
  theme: { colorScheme: "light" },
  callbacks: {
    jwt({ token, user }) {
      if (user)
        token = {
          ...token,
          id: user.id,
          username: user.username,
          nama: user.nama,
          peran: user.peran,
          rank: user.rank,
          id_karyawan: user.id_karyawan,
          keteranganperan: user.keteranganperan,
        };
      return token;
    },
    session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id,
        username: token.username,
        nama: token.nama,
        peran: token.peran,
        rank: token.rank,
        id_karyawan: token.id_karyawan,
        keteranganperan: token.keteranganperan,
      };
      return session;
    },
  },
};
