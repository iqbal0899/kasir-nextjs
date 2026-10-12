import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  let requestId;

  try {
    const secret = process.env.INVENTORY_TRANSFER_SECRET;
    const receivedSecret = request.headers.get(
      "x-inventory-transfer-secret"
    );

    if (!secret || receivedSecret !== secret) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses tidak diizinkan",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    requestId =
      typeof body.requestId === "string"
        ? body.requestId.trim()
        : "";

    if (!requestId) {
      return NextResponse.json(
        {
          success: false,
          message: "requestId wajib diisi",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Items wajib diisi",
        },
        { status: 400 }
      );
    }

    const normalizedItems = new Map();

    for (const item of body.items) {
      const productCode =
        typeof item.productCode === "string"
          ? item.productCode.trim()
          : "";

      const name =
        typeof item.name === "string"
          ? item.name.trim()
          : "";

      const price = Number(item.price);
      const quantity = item.quantity;

      if (!productCode || !name) {
        return NextResponse.json(
          {
            success: false,
            message: "Kode dan nama produk wajib diisi",
          },
          { status: 400 }
        );
      }

      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json(
          {
            success: false,
            message: `Harga produk ${productCode} tidak valid`,
          },
          { status: 400 }
        );
      }

      if (!Number.isSafeInteger(quantity) || quantity <= 0) {
        return NextResponse.json(
          {
            success: false,
            message: `Jumlah produk ${productCode} tidak valid`,
          },
          { status: 400 }
        );
      }

      if (normalizedItems.has(productCode)) {
        return NextResponse.json(
          {
            success: false,
            message: `Produk ${productCode} tercatat lebih dari satu kali`,
          },
          { status: 400 }
        );
      }

      normalizedItems.set(productCode, {
        productCode,
        name,
        price,
        category:
          typeof item.category === "string"
            ? item.category.trim() || null
            : null,
        image:
          typeof item.image === "string"
            ? item.image.trim() || null
            : null,
        quantity,
      });
    }

    const transferItems = Array.from(normalizedItems.values());

    const existingTransfer = await prisma.inventoryTransfer.findUnique({
      where: { requestId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (existingTransfer) {
      if (existingTransfer.status === "COMPLETED") {
        return NextResponse.json({
          success: true,
          message: "Transfer sudah pernah diproses",
          data: existingTransfer,
        });
      }

      return NextResponse.json(
        {
          success: false,
          message: "Transfer sudah tercatat tetapi belum selesai",
        },
        { status: 409 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const transfer = await tx.inventoryTransfer.create({
        data: {
          requestId,
          status: "PROCESSING",
        },
      });

      const processedItems = [];

      for (const item of transferItems) {
        let mapping = await tx.inventoryProductMapping.findUnique({
          where: {
            inventoryCode: item.productCode,
          },
          include: {
            product: true,
          },
        });

        let product;

        if (!mapping) {
          product = await tx.product.create({
            data: {
              name: item.name,
              price: item.price,
              stock: 0,
              category: item.category,
              image: item.image,
              isActive: true,
            },
          });

          mapping = await tx.inventoryProductMapping.create({
            data: {
              inventoryCode: item.productCode,
              productId: product.id,
            },
            include: {
              product: true,
            },
          });

          product = mapping.product;
        } else {
          product = mapping.product;

          if (!product) {
            throw new Error(
              `Mapping produk ${item.productCode} tidak valid`
            );
          }

          if (!product.isActive) {
            throw new Error(
              `Produk POS ${product.name} tidak aktif`
            );
          }
        }

        const stockBefore = product.stock;
        const stockAfter = stockBefore + item.quantity;

        if (!Number.isSafeInteger(stockAfter)) {
          throw new Error(
            `Jumlah stok produk ${product.name} tidak valid`
          );
        }

        const updatedProduct = await tx.product.update({
          where: {
            id: product.id,
          },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });

        await tx.stockHistory.create({
          data: {
            productId: product.id,
            type: "RESTOCK",
            quantity: item.quantity,
            stockBefore,
            stockAfter: updatedProduct.stock,
          },
        });

        processedItems.push({
          transferId: transfer.id,
          productId: product.id,
          quantity: item.quantity,
        });
      }

      await tx.inventoryTransferItem.createMany({
        data: processedItems,
      });

      return tx.inventoryTransfer.update({
        where: {
          id: transfer.id,
        },
        data: {
          status: "COMPLETED",
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

    return NextResponse.json(
      {
        success: true,
        message: "Transfer berhasil diproses dan stok POS diperbarui",
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === "P2002" && requestId) {
      const existingTransfer = await prisma.inventoryTransfer.findUnique({
        where: { requestId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (existingTransfer?.status === "COMPLETED") {
        return NextResponse.json({
          success: true,
          message: "Transfer sudah pernah diproses",
          data: existingTransfer,
        });
      }
    }

    console.error("Inventory stock receive error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error.message || "Gagal menerima stok dari Inventory",
      },
      { status: 500 }
    );
  }
}