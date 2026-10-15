import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";
import { getNotificationSession } from "@/lib/notification-auth";

export async function PATCH() {
  try {
    const session = await getNotificationSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Sesi login tidak valid." },
        { status: 401 }
      );
    }

    const result = await prisma.notification.updateMany({
      where: {
        userId: session.userId,
        sessionId: session.sessionId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Semua notifikasi ditandai sudah dibaca.",
      data: {
        updatedCount: result.count,
      },
    });
  } catch (error) {
    console.error("MARK ALL NOTIFICATIONS ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Gagal memperbarui notifikasi." },
      { status: 500 }
    );
  }
}