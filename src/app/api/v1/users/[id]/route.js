import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

// GET /api/v1/users/:id
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const userId = Number(id);

    if (Number.isNaN(userId)) {
      return Response.json(
        {
          success: false,
          message: "ID user tidak valid",
        },
        {
          status: 400,
        }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User tidak ditemukan",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("GET USER ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Gagal mengambil user",
      },
      {
        status: 500,
      }
    );
  }
}

// PUT /api/v1/users/:id
export async function PUT(request, { params }) {
  try {
    const { id } = await params;

    const userId = Number(id);

    const body = await request.json();

    const { username, password, role } = body;

    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!existingUser) {
      return Response.json(
        {
          success: false,
          message: "User tidak ditemukan",
        },
        {
          status: 404,
        }
      );
    }

    const data = {};

    if (username) {
      data.username = username;
    }

    if (role) {
  const normalizedRole =
    role.toLowerCase();

  if (
    !["admin", "cashier"].includes(
      normalizedRole
    )
  ) {
    return Response.json(
      {
        success: false,
        message: "Role tidak valid",
      },
      {
        status: 400,
      }
    );
  }

  data.role = normalizedRole;
}

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data,
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    console.log(updatedUser);

    return Response.json({
      success: true,
      message: "User berhasil diperbarui",
      data: updatedUser,
    });
  } catch (error) {
    console.error("UPDATE USER ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Gagal memperbarui user",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

// DELETE /api/v1/users/:id
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const userId = Number(id);

    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!existingUser) {
      return Response.json(
        {
          success: false,
          message: "User tidak ditemukan",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    console.log(existingUser);

    return Response.json({
      success: true,
      message: "User berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Gagal menghapus user",
      },
      {
        status: 500,
      }
    );
  }
}