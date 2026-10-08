import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();

    const { requestId, items } = body;

    if (!requestId) {
      return NextResponse.json(
        {
          success: false,
          message: "requestId wajib diisi",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Items wajib diisi",
        },
        { status: 400 }
      );
    }

    for (const item of items) {
      if (!item.productCode) {
        return NextResponse.json(
          {
            success: false,
            message: "productCode wajib diisi",
          },
          { status: 400 }
        );
      }

      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        return NextResponse.json(
          {
            success: false,
            message: "quantity harus berupa angka lebih dari 0",
          },
          { status: 400 }
        );
      }
    }

    const existingTransfer =
      await prisma.inventoryTransfer.findUnique({
        where: {
          requestId,
        },
        include: {
          items: true,
        },
      });

    if (existingTransfer) {
      return NextResponse.json({
        success: true,
        message: "Transfer sudah diproses",
        data: existingTransfer,
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const processedItems = [];

      for (const item of items) {
        const mapping =
          await tx.inventoryProductMapping.findUnique({
            where: {
              inventoryCode: item.productCode,
            },
            include: {
              product: true,
            },
          });

        if (!mapping) {
          throw new Error(
            `Produk inventory ${item.productCode} belum memiliki mapping ke produk POS`
          );
        }

        const product = mapping.product;

        if (!product) {
          throw new Error(
            `Produk POS untuk ${item.productCode} tidak ditemukan`
          );
        }

        if (!product.isActive) {
          throw new Error(
            `Produk POS ${product.name} sedang tidak aktif`
          );
        }

        const stockBefore = product.stock;
        const stockAfter =
          stockBefore + item.quantity;

        const updatedProduct =
          await tx.product.update({
            where: {
              id: mapping.productId,
            },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });

        await tx.stockHistory.create({
          data: {
            productId: mapping.productId,
            type: "RESTOCK",
            quantity: item.quantity,
            stockBefore,
            stockAfter,
          },
        });

        processedItems.push({
          productId: mapping.productId,
          productCode: item.productCode,
          productName: product.name,
          quantity: item.quantity,
          stockBefore,
          stockAfter: updatedProduct.stock,
        });
      }

      return tx.inventoryTransfer.create({
        data: {
          requestId,
          status: "COMPLETED",
          items: {
            create: processedItems.map((item) => ({
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
    });

    return NextResponse.json({
      success: true,
      message: "Stok berhasil diterima dari inventory",
      data: result,
    });
  } catch (error) {
    console.error(
      "Inventory stock receive error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Gagal menerima stok dari inventory",
      },
      { status: 500 }
    );
  }
}