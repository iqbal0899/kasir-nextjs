import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
try {
const secret = process.env.INVENTORY_TRANSFER_SECRET;
const receivedSecret = request.headers.get("x-inventory-transfer-secret");

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
const requestId = body.requestId?.trim();
const items = body.items;

if (!requestId) {
  return NextResponse.json(
    { success: false, message: "requestId wajib diisi" },
    { status: 400 }
  );
}

if (!Array.isArray(items) || items.length === 0) {
  return NextResponse.json(
    { success: false, message: "Items wajib diisi" },
    { status: 400 }
  );
}

const normalizedItems = new Map();

for (const item of items) {
  const productCode = item.productCode?.trim();
  const quantity = item.quantity;

  if (!productCode) {
    return NextResponse.json(
      { success: false, message: "productCode wajib diisi" },
      { status: 400 }
    );
  }

  if (!Number.isSafeInteger(quantity) || quantity <= 0) {
    return NextResponse.json(
      {
        success: false,
        message: "quantity harus berupa bilangan bulat lebih dari 0",
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

  normalizedItems.set(productCode, quantity);
}

const transferItems = Array.from(
  normalizedItems,
  ([productCode, quantity]) => ({ productCode, quantity })
);

const existingTransfer = await prisma.inventoryTransfer.findUnique({
  where: { requestId },
  include: { items: { include: { product: true } } },
});

if (existingTransfer) {
  return NextResponse.json({
    success: true,
    message: "Transfer sudah pernah diproses",
    data: existingTransfer,
  });
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
    const mapping = await tx.inventoryProductMapping.findUnique({
      where: { inventoryCode: item.productCode },
      include: { product: true },
    });

    if (!mapping?.product) {
      throw new Error(
        `Produk Inventory ${item.productCode} belum memiliki mapping produk POS`
      );
    }

    const product = mapping.product;

    if (!product.isActive) {
      throw new Error(`Produk POS ${product.name} tidak aktif`);
    }

    const stockBefore = product.stock;
    const stockAfter = stockBefore + item.quantity;

    if (!Number.isSafeInteger(stockAfter)) {
      throw new Error(`Jumlah stok produk ${product.name} tidak valid`);
    }

    const updatedProduct = await tx.product.update({
      where: { id: product.id },
      data: { stock: { increment: item.quantity } },
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
    where: { id: transfer.id },
    data: { status: "COMPLETED" },
    include: {
      items: {
        include: { product: true },
      },
    },
  });
});

return NextResponse.json(
  {
    success: true,
    message: "Stok berhasil diterima dari Inventory",
    data: result,
  },
  { status: 201 }
);

} catch (error) {
if (error.code === "P2002") {
const requestId = error.meta?.target?.includes?.("requestId")
? null
: undefined;

  if (requestId !== undefined) {
    return NextResponse.json(
      {
        success: false,
        message: "Transfer dengan requestId tersebut sudah diproses",
      },
      { status: 409 }
    );
  }
}

console.error("Inventory stock receive error:", error);

return NextResponse.json(
  {
    success: false,
    message: error.message || "Gagal menerima stok dari Inventory",
  },
  { status: 500 }
);

}
}
