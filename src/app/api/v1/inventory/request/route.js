import { NextResponse } from "next/server";

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

    const normalizedItems = [];
    const productIds = new Set();

    for (const item of items) {
      const productId = Number(item.productId);
      const quantity = Number(item.quantity);

      if (!Number.isSafeInteger(productId) || productId <= 0) {
        return NextResponse.json(
          {
            success: false,
            message: "productId Inventory tidak valid",
          },
          { status: 400 }
        );
      }

      if (!Number.isSafeInteger(quantity) || quantity <= 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Quantity harus berupa bilangan bulat lebih dari 0",
          },
          { status: 400 }
        );
      }

      if (productIds.has(productId)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Produk yang sama tidak boleh ditambahkan lebih dari satu kali",
          },
          { status: 400 }
        );
      }

      productIds.add(productId);
      normalizedItems.push({ productId, quantity });
    }

    const inventoryApiUrl = process.env.INVENTORY_API_URL;
    const serviceSecret = process.env.POS_INVENTORY_API_SECRET;

    if (!inventoryApiUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "INVENTORY_API_URL belum dikonfigurasi",
        },
        { status: 500 }
      );
    }

    if (!serviceSecret) {
      return NextResponse.json(
        {
          success: false,
          message: "POS_INVENTORY_API_SECRET belum dikonfigurasi",
        },
        { status: 500 }
      );
    }

    const baseUrl = inventoryApiUrl.replace(/\/+$/, "");

    const inventoryResponse = await fetch(
      `${baseUrl}/api/v1/requests`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-pos-inventory-secret": serviceSecret,
        },
        body: JSON.stringify({
          items: normalizedItems,
          note: typeof note === "string" ? note.trim() : "",
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    const result = await inventoryResponse.json().catch(() => null);

    if (!inventoryResponse.ok || !result?.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            result?.message ||
            `Inventory API gagal memproses request (HTTP ${inventoryResponse.status})`,
        },
        {
          status:
            inventoryResponse.status >= 400 &&
            inventoryResponse.status <= 599
              ? inventoryResponse.status
              : 502,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Permintaan stok berhasil dikirim ke Inventory",
        data: result.data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE INVENTORY REQUEST ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error.name === "TimeoutError"
            ? "Inventory tidak merespons dalam waktu yang ditentukan"
            : "Gagal menghubungi server Inventory",
      },
      { status: 502 }
    );
  }
}

