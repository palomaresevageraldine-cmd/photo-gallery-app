import { NextResponse } from "next/server";
const db = require("../../../../lib/db");
const { hashPassword, createSessionToken, COOKIE_NAME, SESSION_DURATION_SECONDS } = require("../../../../lib/auth");

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const username = body?.username?.trim();
  const password = body?.password;

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
  }
  if (username.length < 3) {
    return NextResponse.json({ error: "Username must be at least 3 characters." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const existing = db.getUserByUsername(username);
  if (existing) {
    return NextResponse.json({ error: "That username is already taken." }, { status: 409 });
  }

  const passwordHash = hashPassword(password);
  const user = db.addUser({ username, passwordHash });

  const token = createSessionToken({ id: user.id, username });

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
