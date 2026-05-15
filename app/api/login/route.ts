import { NextRequest, NextResponse } from "next/server";
import { API_PATH } from "@/app/utils/apiconfig";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { username, password } = body;

  const url = `${API_PATH}login`;

  try {
    const backendRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await backendRes.json();
    if (!backendRes.ok) {
      console.error("Login failed:", data.message || "Unknown error");
      return NextResponse.json(
        { message: data.message || "Login failed" },
        { status: backendRes.status },
      );
    }
    const response = NextResponse.json({ message: "Login success" });
    response.cookies.set("token", data.token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (fetchErr) {
    console.error("Backend fetch failed:", fetchErr);
    return NextResponse.json(
      { message: "Unable to reach authentication service." },
      { status: 502 },
    );
  }
}
