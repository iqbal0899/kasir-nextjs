import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import {
  generateProductReport,
  generateTransactionReport,
  generateAllReport,
} from "@/backend/utils/pdfGenerator";

import { getProducts } from "@/backend/service/product.service";
import { getTransactions } from "@/backend/service/transaction.service";


export async function GET(request) {
  try {
    // =====================================================
    // AUTHENTICATION
    // =====================================================

    const token = request.cookies.get("token")?.value;

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
          message: "Token tidak valid atau sudah expired",
        },
        {
          status: 401,
        }
      );
    }

    // =====================================================
    // QUERY PARAMETER
    // =====================================================

    const { searchParams } = new URL(request.url);

    const type = searchParams.get("type");

    const page =
      Number(searchParams.get("page")) || 1;

    const limit =
      Number(searchParams.get("limit")) || 1000;

    const startDate =
      searchParams.get("startDate");

    const endDate =
      searchParams.get("endDate");

    // =====================================================
    // VALIDATE TYPE
    // =====================================================

    const allowedTypes = [
      "product",
      "transaction",
      "all",
    ];

    if (!allowedTypes.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Tipe laporan tidak valid. Gunakan product, transaction, atau all.",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // USERNAME
    // =====================================================

    const userName =
      user?.username || "User";

    // =====================================================
    // PRODUCT REPORT
    // =====================================================

    if (type === "product") {
      const products =
        await getProducts();

      const pdfBuffer =
        await generateProductReport({
          products: products || [],
          userName,
        });

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            'inline; filename="laporan-produk.pdf"',

          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      });
    }

    // =====================================================
    // TRANSACTION REPORT
    // =====================================================

    if (type === "transaction") {
      const result =
        await getTransactions({
          page,
          limit,
          startDate,
          endDate,
        });

      const transactions =
        result?.transactions || [];

      const pdfBuffer =
        await generateTransactionReport({
          transactions,
          userName,
          startDate,
          endDate,
        });

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            'inline; filename="laporan-transaksi.pdf"',

          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      });
    }

    // =====================================================
    // ALL REPORT
    // =====================================================

    if (type === "all") {
      const [
        products,
        transactionResult,
      ] = await Promise.all([
        getProducts(),

        getTransactions({
          page,
          limit,
          startDate,
          endDate,
        }),
      ]);

      const transactions =
        transactionResult?.transactions || [];

      const pdfBuffer =
        await generateAllReport({
          products: products || [],
          transactions,
          userName,
        });

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            'inline; filename="laporan-produk-transaksi.pdf"',

          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      });
    }

  } catch (error) {
    console.error(
      "REPORT PDF ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Gagal membuat laporan PDF",
      },
      {
        status: 500,
      }
    );
  }
}