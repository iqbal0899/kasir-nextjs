import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import {
  createTransaction,
  getTransactions,
} from "@/backend/service/transaction.service";


export async function GET() {
  try {
    const transactions =
      await getTransactions();

    return NextResponse.json({
      success: true,
      data: transactions,
    });

  } catch (error) {
    console.error(
      "GET TRANSACTIONS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Gagal mengambil transaksi",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request) {
  try {

    const token =
      request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Anda belum login",
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
          message:
            "Token tidak valid",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      await request.json();

    const {
      items,
      paymentMethod,
      cashReceived,
    } = body;

    const transaction =
      await createTransaction({
        items,
        paymentMethod,
        cashReceived,
        cashierId: user.id,
      });

      console.log(
        "TRANSAKSI BERHASIL DIBUAT:",
        {paymentMethod, cashReceived, cashierId: user.id, items}
      );

      console.log("USER YANG MEMBUAT TRANSAKSI:",{ 
        id: user.id, 
        username: user.username, 
        role: user.role 
      });
    return NextResponse.json(
      {
        success: true,
        message:
          "Transaksi berhasil disimpan",
        data: transaction,
      },
      {
        status: 201,
      }
    );

  } catch (error) {
    console.error(
      "CREATE TRANSACTION ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Gagal menyimpan transaksi",
      },
      {
        status: 400,
      }
    );
  }
}