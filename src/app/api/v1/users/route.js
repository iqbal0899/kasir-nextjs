import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

// GET /api/v1/users
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
      },
      {
        status: 500,
      }
    );
  }
}

// POST /api/v1/users
export async function POST(request) {
  try {
    const body = await request.json();

    const { username, password, role } = body;

    if (!username || !password) {
      return Response.json(
        {
          success: false,
          message: "Username dan password wajib diisi",
        },
        {
          status: 400,
        }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (existingUser) {
      return Response.json(
        {
          success: false,
          message: "Username sudah digunakan",
        },
        {
          status: 409,
        }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: role || "cashier",
      },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    return Response.json(
      {
        success: true,
        message: "User berhasil dibuat",
        data: user,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("CREATE USER ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Gagal membuat user",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}