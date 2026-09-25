import { NextResponse } from "next/server";
import { generatePaymentQR } from "@/lib/qrcode";

export async function POST(request) {
  try {
    const body = await request.json();

    const { transactionId, amount } = body;

    if (!transactionId || !amount) {
      return NextResponse.json(
        {
          success: false,
          message: "transactionId dan amount wajib diisi",
        },
        { status: 400 }
      );
    }

    const qrCode = await generatePaymentQR({
      transactionId,
      amount,
    });

    return NextResponse.json({
      success: true,
      data: {
        qrCode,
        transactionId,
        amount,
        status: "PENDING",
      },
    });
  } catch (error) {
    console.error("GENERATE QR ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal membuat QR pembayaran",
      },
      { status: 500 }
    );
  }
}