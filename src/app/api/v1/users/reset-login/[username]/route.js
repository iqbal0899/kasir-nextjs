import { NextResponse } from "next/server";

import { resetRateLimit } from "@/backend/utils/rateLimiter";

export async function GET(request, { params }) {
  try {
    const { username } = await params;

    if (!username) {
      return NextResponse.json(
        {
          success: false,
          message: "Username wajib diisi",
        },
        {
          status: 400,
        }
      );
    }

    const key = `login:${username}`;

    const deleted = resetRateLimit(key);

    console.log("RESET LIMITER:", {
      username,
      key,
      deleted,
    });

    return NextResponse.json({
      success: "Berhasil",
      message: "User berhasil direset",
    });
  } catch (error) {
    console.error("RESET LIMITER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal reset limiter",
      },
      {
        status: 500,
      }
    );
  }
}