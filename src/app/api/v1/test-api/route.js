import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Test koneksi database
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      success: true,
      message: "Database berhasil terhubung",
    });

  } catch (error) {
    console.error(
      "TEST DATABASE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Database gagal terhubung",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}