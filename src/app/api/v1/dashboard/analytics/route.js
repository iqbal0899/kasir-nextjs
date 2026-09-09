import { NextResponse } from "next/server";

import {
  getDashboardAnalytics,
} from "@/backend/service/dashboard.service";

export async function GET() {
  try {
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