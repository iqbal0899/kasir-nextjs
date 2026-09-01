import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
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
        error: error.message,
      },
      { status: 500 }
    );
  }
}