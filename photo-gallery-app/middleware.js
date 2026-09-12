import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "session";

function getSecretKey() {
  const secret = process.env.JWT_SECRET || "dev-only-insecure-secret-change-me";
  return new TextEncoder().encode(secret);
}

export async function middleware(request) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const { pathname } = request.nextUrl;

  let isLoggedIn = false;
  if (token) {
    try {
      await jwtVerify(token, getSecretKey());
      isLoggedIn = true;
    } catch (err) {
      isLoggedIn = false;
    }
  }

  if (pathname.startsWith("/gallery") && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if ((pathname === "/login" || pathname === "/signup") && isLoggedIn) {
    const galleryUrl = new URL("/gallery", request.url);
    return NextResponse.redirect(galleryUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/gallery", "/login", "/signup"],
};
