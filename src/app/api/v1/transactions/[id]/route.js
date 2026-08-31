import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import {
  deleteTransaction,
  getTransactionById,
} from "@/backend/service/transaction.service";

// ========================================
// GET TRANSACTION DETAIL
// ========================================

export async function GET(
  request,
  { params }
) {
  try {
    // ========================================
    // CEK TOKEN
    // ========================================

    const token =
      request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Anda belum login",
        },
        {
          status: 401,
        }
      );
    }

    // ========================================
    // VERIFY JWT
    // ========================================

    try {
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Token tidak valid",
        },
        {
          status: 401,
        }
      );
    }

    // ========================================
    // AMBIL ID
    // ========================================

    const { id } = await params;

    const transactionId = Number(id);

    // ========================================
    // VALIDASI ID
    // ========================================

    if (
      !Number.isInteger(transactionId) ||
      transactionId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "ID transaksi tidak valid",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================
    // GET TRANSACTION
    // ========================================

    const transaction =
      await getTransactionById(
        transactionId
      );

    // ========================================
    // TRANSAKSI TIDAK DITEMUKAN
    // ========================================

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          message: "Transaksi tidak ditemukan",
        },
        {
          status: 404,
        }
      );
    }

    // ========================================
    // RESPONSE
    // ========================================

    return NextResponse.json(
      {
        success: true,
        message:
          "Detail transaksi berhasil diambil",
        data: transaction,
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    console.error(
      "GET TRANSACTION DETAIL ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Gagal mengambil detail transaksi",
      },
      {
        status: 500,
      }
    );
  }
}

// ========================================
// DELETE TRANSACTION
// ========================================

export async function DELETE(
  request,
  { params }
) {
  try {
    // ========================================
    // CEK TOKEN
    // ========================================

    const token =
      request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Anda belum login",
        },
        {
          status: 401,
        }
      );
    }

    // ========================================
    // VERIFY JWT
    // ========================================

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
          message: "Token tidak valid",
        },
        {
          status: 401,
        }
      );
    }

    // ========================================
    // CEK ROLE ADMIN
    // ========================================

    if (user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Anda tidak memiliki izin untuk menghapus transaksi",
        },
        {
          status: 403,
        }
      );
    }

    // ========================================
    // AMBIL ID
    // ========================================

    const { id } = await params;

    const transactionId = Number(id);

    // ========================================
    // VALIDASI ID
    // ========================================

    if (
      !Number.isInteger(transactionId) ||
      transactionId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "ID transaksi tidak valid",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================
    // DELETE TRANSACTION
    // ========================================

    const transaction =
      await deleteTransaction(
        transactionId
      );

    // ========================================
    // RESPONSE
    // ========================================

    return NextResponse.json(
      {
        success: true,
        message:
          "Transaksi berhasil dihapus",
        data: transaction,
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    console.error(
      "DELETE TRANSACTION ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Gagal menghapus transaksi",
      },
      {
        status: 500,
      }
    );
  }
}