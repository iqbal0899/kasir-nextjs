import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import {
  createTransaction,
  getTransactions,
} from "@/backend/service/transaction.service";

import {
  createAuditLog,
} from "@/backend/service/audit.service";

import {
  getClientIp,
} from "@/backend/utils/getClientIp";


// =====================================================
// GET TRANSACTIONS
// =====================================================

export async function GET(request) {
  try {
    const { searchParams } =
      new URL(request.url);

    const page =
      searchParams.get("page");

    const limit =
      searchParams.get("limit");

    const startDate =
      searchParams.get("startDate");

    const endDate =
      searchParams.get("endDate");

    const result =
      await getTransactions({
        page,
        limit,
        startDate,
        endDate,
      });

    return NextResponse.json({
      success: true,
      data: result.transactions,
      pagination: result.pagination,
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


// =====================================================
// CREATE TRANSACTION
// =====================================================

export async function POST(request) {
  try {

    // =================================================
    // AUTHENTICATION
    // =================================================

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


    // =================================================
    // VERIFY JWT
    // =================================================

    let user;

    try {
      user = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    } catch (error) {

      console.error(
        "JWT VERIFY ERROR:",
        error
      );

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


    // =================================================
    // IDEMPOTENCY KEY
    // =================================================

    const idempotencyKey =
      request.headers.get(
        "Idempotency-Key"
      );

    console.log(
      "IDEMPOTENCY KEY:",
      idempotencyKey
    );

    if (!idempotencyKey) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Idempotency-Key wajib dikirim",
        },
        {
          status: 400,
        }
      );
    }


    // =================================================
    // REQUEST BODY
    // =================================================

    const body =
      await request.json();

    const {
      items,
      paymentMethod,
      cashReceived,
    } = body;


    console.log(
      "DATA TRANSAKSI:",
      {
        paymentMethod,
        cashReceived,
        cashierId: user.id,
        items,
        idempotencyKey,
      }
    );


    // =================================================
    // CREATE TRANSACTION
    // =================================================

    const transaction =
      await createTransaction({
        items,
        paymentMethod,
        cashReceived,
        cashierId: user.id,
        idempotencyKey,
      });


    // =================================================
    // USER INFO
    // =================================================

    console.log(
      "USER YANG MEMBUAT TRANSAKSI:",
      {
        id: user.id,
        username: user.username,
        role: user.role,
      }
    );


    // =================================================
    // AUDIT LOG
    // =================================================

    await createAuditLog({
      userId:
        user.id,

      username:
        user.username,

      role:
        user.role,

      action:
        "CREATE_TRANSACTION",

      entity:
        "Transaction",

      entityId:
        transaction.id,

      details: {
        totalAmount:
          Number(
            transaction.totalAmount
          ),

        paymentMethod:
          transaction.paymentMethod,

        cashReceived:
          Number(
            transaction.cashReceived || 0
          ),

        change:
          Number(
            transaction.change || 0
          ),

        idempotencyKey:
          idempotencyKey,

        itemCount:
          Array.isArray(items)
            ? items.length
            : 0,

        items:
          Array.isArray(items)
            ? items.map((item) => ({
                productId:
                  item.productId,

                quantity:
                  item.quantity,

                price:
                  Number(item.price),
              }))
            : [],
      },

      ipAddress:
        getClientIp(request),

      userAgent:
        request.headers.get(
          "user-agent"
        ) || null,
    });


    // =================================================
    // RESPONSE
    // =================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Transaksi berhasil disimpan",

        data:
          transaction,
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