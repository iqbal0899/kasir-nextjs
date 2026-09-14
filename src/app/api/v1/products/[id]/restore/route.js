import { restoreProduct } from "@/backend/actions/product.action";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import { createAuditLog } from "@/backend/service/audit.service";
import { getClientIp } from "@/backend/utils/getClientIp";

import { NextResponse } from "next/server";

export async function PATCH(request, { params }) {
  try {
    // ==========================================
    // AUTHENTICATION
    // ==========================================

    const cookieStore = await cookies();

    const token =
      cookieStore.get("token")?.value;

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

    // ==========================================
    // VERIFY JWT
    // ==========================================

    let user;

    try {
      user = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Token tidak valid atau sudah expired",
        },
        {
          status: 401,
        }
      );
    }

    // ==========================================
    // ADMIN ONLY
    // ==========================================

    if (user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Hanya admin yang dapat mengaktifkan produk",
        },
        {
          status: 403,
        }
      );
    }

    // ==========================================
    // GET PRODUCT ID
    // ==========================================

    const { id } = await params;

    const productId = Number(id);

    if (
      Number.isNaN(productId) ||
      productId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "ID product tidak valid",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // RESTORE PRODUCT
    // ==========================================

    const product =
      await restoreProduct(productId);

    // ==========================================
    // AUDIT LOG
    // ==========================================

    await createAuditLog({
      userId: user.id,

      username: user.username,

      role: user.role,

      action: "RESTORE_PRODUCT",

      entity: "Product",

      entityId: product.id,

      details: {
        name: product.name,

        price:
          Number(product.price),

        stock:
          product.stock,

        category:
          product.category,

        isActive:
          product.isActive,

        message:
          "Product berhasil diaktifkan kembali",
      },

      ipAddress:
        getClientIp(request),

      userAgent:
        request.headers.get(
          "user-agent"
        ) || null,
    });

    // ==========================================
    // RESPONSE
    // ==========================================

    return NextResponse.json({
      success: true,

      message:
        "Product berhasil diaktifkan kembali",

      data: product,
    });

  } catch (error) {
    console.error(
      "RESTORE PRODUCT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Gagal mengaktifkan product",

        error:
          error.message,
      },
      {
        status: 500,
      }
    );
  }
}