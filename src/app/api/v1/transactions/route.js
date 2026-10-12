
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

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

import {
  createNotification,
} from "@/backend/service/notifications.service";

// =====================================================
// AUTHENTICATION HELPER
// =====================================================

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("pos_token")?.value;

  if (!token || !process.env.JWT_SECRET) {
    return null;
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);

    if (
      !user ||
      typeof user === "string" ||
      !user.id ||
      !Number.isFinite(Number(user.id))
    ) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

// =====================================================
// GET TRANSACTIONS
// =====================================================

export async function GET(request) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Sesi login tidak valid.",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const result = await getTransactions({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      startDateTransaction: searchParams.get(
        "startDateTransaction"
      ),
      endDateTransaction: searchParams.get(
        "endDateTransaction"
      ),
    });

    return NextResponse.json({
      success: true,
      data: result.transactions,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("GET TRANSACTIONS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Gagal mengambil transaksi.",
      },
      { status: 500 }
    );
  }
}

// =====================================================
// POST TRANSACTION
// =====================================================

export async function POST(request) {
  try {
    // AUTHENTICATION
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Sesi login tidak valid.",
        },
        { status: 401 }
      );
    }

    // IDEMPOTENCY KEY
    const idempotencyKey = request.headers.get(
      "Idempotency-Key"
    );

    if (!idempotencyKey?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Idempotency-Key wajib dikirim.",
        },
        { status: 400 }
      );
    }

    // REQUEST BODY
    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Request body tidak valid.",
        },
        { status: 400 }
      );
    }

    const {
      items,
      paymentMethod,
      cashReceived,
    } = body;

    // CREATE TRANSACTION
    const transaction = await createTransaction({
      items,
      paymentMethod,
      cashReceived,
      cashierId: Number(user.id),
      idempotencyKey,
    });

    // AUDIT LOG
    try {
      await createAuditLog({
        userId: Number(user.id),
        username: user.username,
        role: user.role,
        action: "CREATE_TRANSACTION",
        entity: "Transaction",
        entityId: transaction.id,
        details: {
          totalAmount: Number(transaction.totalAmount),
          paymentMethod: transaction.paymentMethod,
          cashReceived: Number(transaction.cashReceived || 0),
          change: Number(transaction.change || 0),
          idempotencyKey,
          itemCount: Array.isArray(items) ? items.length : 0,
          items: Array.isArray(items)
            ? items.map((item) => ({
                productId: Number(item.productId),
                quantity: Number(item.quantity),
              }))
            : [],
        },
        ipAddress: getClientIp(request),
        userAgent: request.headers.get("user-agent") || null,
      });
    } catch (auditError) {
      console.error("CREATE AUDIT LOG ERROR:", auditError);
    }

    // CREATE DATABASE NOTIFICATION
    try {
      const cookieStore = await cookies();
      const notificationSession = cookieStore.get(
        "notificationSession"
      )?.value;

      if (notificationSession) {
        await createNotification({
          title: "Transaksi berhasil",
          message: `Transaksi #${transaction.id} berhasil disimpan.`,
          href: "/transactions",
        });
      }
    } catch (notificationError) {
      console.error(
        "CREATE NOTIFICATION ERROR:",
        notificationError
      );
    }

    // SUCCESS RESPONSE
    return NextResponse.json(
      {
        success: true,
        message: "Transaksi berhasil disimpan.",
        data: transaction,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE TRANSACTION ERROR:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Gagal menyimpan transaksi.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 400 }
    );
  }
}
