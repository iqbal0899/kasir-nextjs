import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import {
  getDashboardAnalytics,
} from "@/backend/service/dashboard.service";

export async function GET() {
  try {

    // validasi sudah login

    const cookieStore = await cookies();

    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const user = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const data = await getDashboardAnalytics();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "GET DASHBOARD ANALYTICS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data dashboard",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}