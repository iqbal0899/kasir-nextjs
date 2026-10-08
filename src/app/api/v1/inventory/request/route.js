import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Inventory request API aktif",
  });
}

export async function POST(request) {
  try {
    const body = await request.json();

    const { items, note } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Minimal satu produk harus dipilih",
        },
        { status: 400 }
      );
    }

    for (const item of items) {
      if (!Number.isInteger(item.productId)) {
        return NextResponse.json(
          {
            success: false,
            message: "productId tidak valid",
          },
          { status: 400 }
        );
      }

      if (
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Quantity harus lebih dari 0",
          },
          { status: 400 }
        );
      }
    }

    const productIds = [
      ...new Set(items.map((item) => item.productId)),
    ];

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        isActive: true,
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Beberapa produk tidak ditemukan atau tidak aktif",
        },
        { status: 400 }
      );
    }

    const requestId = `REQ-${Date.now()}`;

    const result = await prisma.inventoryRequest.create({
      data: {
        requestId,
        status: "PENDING",
        note: note?.trim() || null,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Permintaan stok berhasil dibuat",
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "CREATE INVENTORY REQUEST ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Gagal membuat permintaan stok",
      },
      { status: 500 }
    );
  }
}