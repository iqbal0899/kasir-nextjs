import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import {
  deleteTransaction,
  getTransactionById,
} from "@/backend/service/transaction.service";

export async function GET(
  request,
  { params }
) {
  try {

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

    const { id } = await params;

    const transactionId = Number(id);

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

    const transaction =
      await getTransactionById(
        transactionId
      );

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


export async function DELETE(
  request,
  { params }
) {
  try {

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


    const { id } = await params;

    const transactionId = Number(id);


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


    const transaction =
      await deleteTransaction(
        transactionId
      );

      console.log(
        "DELETE TRANSACTION:",
        transaction,
      );

      console.log(
        "USER YANG MENGHAPUS:",
        {
          id: user.id,
          username: user.username,
          role: user.role,
        }
      );


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