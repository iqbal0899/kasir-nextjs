import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(request) {
  const token = request.cookies.get("token")?.value;

  // Belum login
  if (!token) {
    return NextResponse.redirect(
      new URL("/auth/login", request.url)
    );
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);

    return NextResponse.next();
  } catch (error) {
    const response = NextResponse.redirect(
      new URL("/auth/login", request.url)
    );

    response.cookies.delete("token");

    return response;
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/pos/:path*",
  ],
};