import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
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

    const requestNumber =
      typeof body.requestNumber === "string"
        ? body.requestNumber.trim()
        : "";

    const status =
      typeof body.status === "string"
        ? body.status.toUpperCase()
        : "";

    const reason =
      typeof body.reason === "string"
        ? body.reason.trim()
        : "";

    if (
      !requestNumber ||
      !["APPROVED", "REJECTED"].includes(status)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Data status request tidak valid",
        },
        { status: 400 }
      );
    }

    if (status === "REJECTED" && !reason) {
      return NextResponse.json(
        {
          success: false,
          message: "Alasan penolakan wajib diisi",
        },
        { status: 400 }
      );
    }

    const inventoryRequest =
      await prisma.inventoryRequest.findUnique({
        where: {
          requestId: requestNumber,
        },
      });

    if (!inventoryRequest) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Pemetaan request ke akun POS tidak ditemukan",
        },
        { status: 404 }
      );
    }

    const title =
      status === "APPROVED"
        ? "Permintaan stok disetujui"
        : "Permintaan stok ditolak";

    const message =
      status === "APPROVED"
        ? `Permintaan stok ${requestNumber} telah disetujui.`
        : `Permintaan stok ${requestNumber} ditolak. Alasan: ${reason}`;

    const result = await prisma.$transaction(
      async (tx) => {
        const notification = await tx.notification.create({
          data: {
            title,
            message,
            href: "/inventory/requests",
            userId: inventoryRequest.userId,
            sessionId: null,
          },
        });

        await tx.inventoryRequest.update({
          where: {
            id: inventoryRequest.id,
          },
          data: {
            status,
          },
        });

        return notification;
      }
    );

    return NextResponse.json({
      success: true,
      message: "Notifikasi berhasil disimpan",
      data: {
        id: result.id,
        requestNumber,
        userId: inventoryRequest.userId,
        status,
      },
    });
  } catch (error) {
    console.error(
      "INVENTORY STATUS NOTIFICATION ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menyimpan notifikasi",
      },
      { status: 500 }
    );
  }
}
