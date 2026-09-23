import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function GET(request) {
  try {
    // ========================================
    // AUTHORIZATION
    // ADMIN + SUPER ADMIN
    // ========================================

    const auth = requireRole(request, [
      "admin",
      "super_admin",
    ]);

    if (!auth.authorized) {
      return Response.json(
        {
          success: false,
          message: auth.message,
        },
        {
          status: auth.status,
        }
      );
    }

    // ========================================
    // GET USERS
    // ========================================

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    return Response.json({
      success: true,
      data: users,
    });

  } catch (error) {
    console.error("GET USERS ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Gagal mengambil data user",
      },
      { status: 500 }
    );
  }
}