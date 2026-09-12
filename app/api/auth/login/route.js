import { NextResponse } from "next/server";
const db = require("../../../../lib/db");
const { verifyPassword, createSessionToken, COOKIE_NAME, SESSION_DURATION_SECONDS } = require("../../../../lib/auth");

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const username = body?.username?.trim();
  const password = body?.password;

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
  }

  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  const token = createSessionToken(user);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
  return response;
}
