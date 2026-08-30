import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function proxy(request) {
  const token = request.cookies.get("token")?.value;

  const { pathname } = request.nextUrl;

  // Halaman login
  if (pathname.startsWith("/auth/login")) {
    // Kalau sudah login, jangan kembali ke login
    if (token) {
      try {
        jwt.verify(token, process.env.JWT_SECRET);

        return NextResponse.redirect(
          new URL("/", request.url)
        );
      } catch {
        // Token tidak valid → tetap di login
        return NextResponse.next();
      }
    }

    return NextResponse.next();
  }

  // Route yang membutuhkan login
  const protectedRoutes = [
    "/",
    "/dashboard",
    "/reports",
  ];

  const isProtected = protectedRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );

  if (isProtected) {
    if (!token) {
      return NextResponse.redirect(
        new URL("/auth/login", request.url)
      );
    }

    try {
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      return NextResponse.next();
    } catch {
      return NextResponse.redirect(
        new URL("/auth/login", request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/reports/:path*",
    "/auth/login",
  ],
};