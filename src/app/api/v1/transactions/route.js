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

    const result =
      await getTransactions({
        page:
          searchParams.get("page"),

        limit:
          searchParams.get("limit"),

        startDateTransaction:
          searchParams.get(
            "startDateTransaction"
          ),

        endDateTransaction:
          searchParams.get(
            "endDateTransaction"
          ),
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
          error instanceof Error
            ? error.message
            : "Gagal mengambil transaksi",
      },
      {
        status: 500,
      }
    );
  }
}


// =====================================================
// POST TRANSACTION
// =====================================================

export async function POST(request) {
  try {
    // =================================================
    // AUTHENTICATION
    // =================================================

    const token =
      request.cookies.get(
        "token"
      )?.value;

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

    // =================================================
    // VERIFY JWT
    // =================================================

    let user;

    try {
      user =
        jwt.verify(
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
    // VALIDATE USER
    // =================================================

    if (
      !user ||
      !user.id
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Data user tidak valid",
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

    let body;

    try {
      body =
        await request.json();

    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            "Request body tidak valid",
        },
        {
          status: 400,
        }
      );
    }

    const {
      items,
      paymentMethod,
      cashReceived,
    } = body;

    // =================================================
    // CREATE TRANSACTION
    // =================================================

    const transaction =
      await createTransaction({
        items,

        paymentMethod,

        cashReceived,

        cashierId:
          user.id,

        idempotencyKey,
      });

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
            transaction.cashReceived ||
              0
          ),

        change:
          Number(
            transaction.change ||
              0
          ),

        idempotencyKey,

        itemCount:
          Array.isArray(items)
            ? items.length
            : 0,

        items:
          Array.isArray(items)
            ? items.map(
                (item) => ({
                  productId:
                    Number(
                      item.productId
                    ),

                  quantity:
                    Number(
                      item.quantity
                    ),
                })
              )
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

    const message =
      error instanceof Error
        ? error.message
        : "Gagal menyimpan transaksi";

    /*
     * Stok habis / validasi request
     * menggunakan 400.
     */
    return NextResponse.json(
      {
        success: false,
        message,
      },
      {
        status: 400,
      }
    );
  }
}