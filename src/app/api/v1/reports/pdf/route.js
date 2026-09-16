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

    const startDateProduct =
      searchParams.get("startDateProduct");

    const endDateProduct =
      searchParams.get("endDateProduct");

    const startDateTransaction =
      searchParams.get("startDateTransaction");

    const endDateTransaction =
      searchParams.get("endDateTransaction");

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
      
      const productsResult =
        await getProducts({
          page,
          limit,
          startDateProduct,
          endDateProduct
        });

         const products =
      Array.isArray(productsResult)
      ? productsResult
      : productsResult ?.data || [];

      const pdfBuffer =
        await generateProductReport({
          products: products || [],
          userName,
          startDateProduct,
          endDateProduct,
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
          startDateTransaction,
          endDateTransaction,
        });

      const transactions =
        result?.transactions || [];

      const pdfBuffer =
        await generateTransactionReport({
          transactions,
          userName,
          startDateTransaction,
          endDateTransaction,
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
        productsResult,
        transactionResult,
      ] = await Promise.all([
        getProducts({
          page,
          limit,
          startDateProduct,
          endDateProduct,
        }),

        getTransactions({
          page,
          limit,
          startDateTransaction,
          endDateTransaction,
        }),
      ]);

      const products =
      Array.isArray(productsResult)
      ? productsResult
      : productsResult ?.data || [];

      const transactions =
        transactionResult?.transactions ||
        transactionResult?.data ;

      const pdfBuffer =
        await generateAllReport({
 products,
  transactions,
  userName,
  startDateProduct,
  endDateProduct,
  startDateTransaction,
  endDateTransaction,
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