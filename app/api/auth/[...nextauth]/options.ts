import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getApiPath } from "@/app/utils/apiconfig";

const api_path = getApiPath();

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
        const res = await fetch(`${api_path}login`, {
          method: "POST",
          body: JSON.stringify(credentials),
          headers: { "Content-Type": "application/json" },
        });
        const user = await res.json();
        // const user = { id: "1", nama: "david", password: "1234", peran: "admin", };
        // if (credentials?.username === user.username && credentials?.password === user.password) {
        //     return user
        // }
        if (user.id)
          return {
            id: user.id,
            username: user.username,
            nama: user.nama,
            peran: user.peran,
            rank: user.rank,
            id_karyawan: user.id_karyawan,
            keteranganperan: user.keteranganperan,
          };
        return null;
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
