import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getApiPath } from "@/app/utils/apiconfig";

const api_path = getApiPath()

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
                    method: 'POST',
                    body: JSON.stringify(credentials),
                    headers: { "Content-Type": "application/json" }
                })
                const user = await res.json()
                // const user = { id: "1", nama: "david", password: "1234", peran: "admin", };
                // if (credentials?.username === user.username && credentials?.password === user.password) {
                //     return user
                // }
                if (user.id) return { id: user.id, nama: user.username, peran: user.peran }
                return null
            }
        }),
    ],
    callbacks: {
        jwt({ token, user }) {
            if (user) token = { ...token, id: user.id, nama: user.nama, peran: user.peran }
            return token
        },
        session({ session, token }) {
            session.user = { ...session.user, id: token.id, nama: token.nama, peran: token.peran }
            return session
        }
    }
}