import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      username,
      password,
      role,
    } = body;

    // =========================
    // VALIDASI
    // =========================

    if (!username || !password || !role) {
      return Response.json(
        {
          success: false,
          message: "Username, password, dan role wajib diisi",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        {
          success: false,
          message: "Password minimal 6 karakter",
        },
        { status: 400 }
      );
    }

    // =========================
    // NORMALISASI ROLE
    // =========================

    const normalizedRole = role.toLowerCase();

    if (!["admin", "cashier"].includes(normalizedRole)) {
      return Response.json(
        {
          success: false,
          message: "Role tidak valid",
        },
        { status: 400 }
      );
    }

    // =========================
    // CEK USERNAME
    // =========================

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
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: normalizedRole,
      },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    console.log(user);

    return Response.json(
      {
        success: true,
        message: "User berhasil ditambahkan",
        data: user,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return Response.json(
      {
        success: false,
        message: error.message || "Gagal menambahkan user",
      },
      { status: 500 }
    );
  }
}