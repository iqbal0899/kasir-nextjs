import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    // ==========================================
    // AUTHENTICATION
    // ==========================================

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

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Token tidak valid atau sudah expired",
        },
        {
          status: 401,
        }
      );
    }

    // ==========================================
    // ADMIN ONLY
    // ==========================================

    if (decoded.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Hanya admin yang dapat melihat audit log",
        },
        {
          status: 403,
        }
      );
    }

    // ==========================================
    // QUERY
    // ==========================================

    const { searchParams } = new URL(request.url);

    const page = Math.max(
      Number(searchParams.get("page")) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number(searchParams.get("limit")) || 10,
        1
      ),
      100
    );

    const action = searchParams.get("action");

    const skip = (page - 1) * limit;

    // ==========================================
    // FILTER
    // ==========================================

    const where = {};

    if (action) {
      where.action = action;
    }

    // ==========================================
    // DATABASE
    // ==========================================

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              role: true,
            },
          },
        },
      }),

      prisma.auditLog.count({
        where,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET AUDIT LOG ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Gagal mengambil audit log",
      },
      {
        status: 500,
      }
    );
  }
}