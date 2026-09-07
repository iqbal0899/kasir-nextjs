import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import {
  createTransaction,
  getTransactions,
} from "@/backend/service/transaction.service";


export async function GET(request) {
  try {
    const {searchParams} = new URL(request.url);

    const page = Math.max(
      Number(searchParams.get("page")) || 1,
      1
    );

    const limit = Math.min(
      Math.max(Number(searchParams.get("limit")) || 10, 1),
      100
    );

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          cashier: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      }),
      prisma.transaction.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
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