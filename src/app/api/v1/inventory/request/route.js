import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getNotificationSession } from "@/lib/notification-auth";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Inventory request API aktif",
  });
}

export async function POST(request) {
  try {
    const session = await getNotificationSession();

    if (!session?.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Sesi login kasir tidak valid",
        },
        { status: 401 }
      );
    }

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

    if (!inventoryApiUrl || !serviceSecret) {
      return NextResponse.json(
        {
          success: false,
          message: "Konfigurasi API Inventory belum lengkap",
        },
        { status: 500 }
      );
    }

    const baseUrl = inventoryApiUrl.replace(/\/+$/, "");
    const normalizedNote = typeof note === "string" ? note.trim() : "";

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
          note: normalizedNote,
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

    const requestNumber =
      typeof result.data?.requestNumber === "string"
        ? result.data.requestNumber.trim()
        : "";

    if (!requestNumber) {
      console.error(
        "INVENTORY REQUEST NUMBER MISSING:",
        JSON.stringify(result)
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Request sudah diterima Inventory, tetapi nomor request tidak ditemukan pada respons. Periksa data Inventory sebelum mencoba mengirim ulang.",
        },
        { status: 502 }
      );
    }

    try {
      await prisma.inventoryRequest.create({
        data: {
          requestId: requestNumber,
          userId: session.userId,
          status: "PENDING",
          note: normalizedNote || null,
        },
      });
    } catch (mappingError) {
      console.error("SAVE INVENTORY REQUEST MAPPING ERROR:", mappingError);

      return NextResponse.json(
        {
          success: false,
          message:
            "Request sudah dibuat di Inventory, tetapi pemetaan akun kasir gagal disimpan di POS. Jangan kirim ulang sebelum memeriksa data request.",
          data: {
            requestNumber,
            mappingSaved: false,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Permintaan stok berhasil dikirim ke Inventory",
        data: {
          ...result.data,
          requestNumber,
        },
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
            ? "Inventory tidak merespons dalam waktu yang ditentukan. Periksa status request sebelum mencoba ulang."
            : "Gagal memproses permintaan stok",
      },
      { status: 502 }
    );
  }
}

