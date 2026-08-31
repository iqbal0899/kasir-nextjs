import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import {
  generateProductReport,
  generateTransactionReport,
  generateAllReport,
} from "@/backend/utils/pdfGenerator";

import { getProducts } from "@/backend/service/product.service";
import { getTransactions } from "@/backend/service/transaction.service";


// =========================================================
// GET REPORT PDF
// =========================================================
//
// Query:
// ?type=product
// ?type=transaction
// ?type=all
//
// =========================================================

export async function GET(request) {
  try {
    // =====================================================
    // CEK TOKEN
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

    // =====================================================
    // VERIFY JWT
    // =====================================================

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
    // AMBIL TYPE REPORT
    // =====================================================

    const { searchParams } = new URL(request.url);

    const type = searchParams.get("type");

    // =====================================================
    // VALIDASI TYPE
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
    // GENERATE PRODUCT REPORT
    // =====================================================

    if (type === "product") {
      const products = await getProducts();

      const pdfBuffer =
        await generateProductReport({
          products: products || [],
          userName,
        });

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition":
            'inline; filename="laporan-produk.pdf"',
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      });
    }

    // =====================================================
    // GENERATE TRANSACTION REPORT
    // =====================================================

    if (type === "transaction") {
      const transactions =
        await getTransactions();

      const pdfBuffer =
        await generateTransactionReport({
          transactions:
            transactions || [],
          userName,
        });

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition":
            'inline; filename="laporan-transaksi.pdf"',
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      });
    }

    // =====================================================
    // GENERATE ALL REPORT
    // =====================================================

    if (type === "all") {
      const [
        products,
        transactions,
      ] = await Promise.all([
        getProducts(),
        getTransactions(),
      ]);

      const pdfBuffer =
        await generateAllReport({
          products: products || [],
          transactions:
            transactions || [],
          userName,
        });

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
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

