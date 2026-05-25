import { NextRequest, NextResponse } from "next/server";
import { API_PATH } from "@/app/utils/apiconfig";
import { sign } from "jsonwebtoken";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { username, password } = body;

  const url = `${process.env.EXPRESS_PATH}/api/login`;
  console.log("Attempting to log in with URL:", url);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    // console.log(data);
    if (!res.ok) {
      console.error("Login failed:", data.message || "Unknown error");
      return NextResponse.json(
        { message: data.message || "Login failed" },
        { status: res.status },
      );
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not defined in environment variables");
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 },
      );
    }
    const token = sign(data.user, secret, {
      expiresIn: 8 * 60 * 60 - 60,
    });
    console.log("Logged in successfully");
    const response = NextResponse.json({ message: "Login success" });
    const cookiesOptions = {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    } as const;
    response.cookies.set("expressToken", data.token, cookiesOptions);
    response.cookies.set("token", token, cookiesOptions);

    return response;
  } catch (fetchErr) {
    console.error("Backend fetch failed:", fetchErr);
    return NextResponse.json(
      { message: "Unable to reach authentication service." },
      { status: 502 },
    );
  }
}
