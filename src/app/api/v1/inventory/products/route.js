import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const inventoryApiUrl =
      process.env.INVENTORY_API_URL;

    if (!inventoryApiUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "INVENTORY_API_URL belum dikonfigurasi",
        },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${inventoryApiUrl.replace(/\/$/, "")}/api/v1/products`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    const result = await response.json().catch(() => null);

    if (!response.ok || !result?.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            result?.message ||
            "Gagal mengambil produk dari Inventory",
        },
        { status: response.ok ? 502 : response.status }
      );
    }

    const products = Array.isArray(result.data)
      ? result.data
      : [];

    return NextResponse.json({
      success: true,
      data: products.filter(
        (product) => product.status === "ACTIVE"
      ),
    });
  } catch (error) {
    console.error("INVENTORY PRODUCTS PROXY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Server POS tidak dapat terhubung ke backend Inventory",
      },
      { status: 502 }
    );
  }
}
