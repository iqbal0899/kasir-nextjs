import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";
import { getNotificationSession } from "@/lib/notification-auth";

export async function PATCH(request, { params }) {
  try {
    const session = await getNotificationSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Sesi login tidak valid." },
        { status: 401 }
      );
    }

    const { id } = await params;

    const result = await prisma.notification.updateMany({
      where: {
        id,
        userId: session.userId,
        sessionId: session.sessionId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    if (result.count === 0) {
      const notification = await prisma.notification.findFirst({
        where: {
          id,
          userId: session.userId,
          sessionId: session.sessionId,
        },
        select: {
          id: true,
        },
      });

      if (!notification) {
        return NextResponse.json(
          { success: false, message: "Notifikasi tidak ditemukan." },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Notifikasi ditandai sudah dibaca.",
    });
  } catch (error) {
    console.error("MARK NOTIFICATION READ ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Gagal memperbarui notifikasi." },
      { status: 500 }
    );
  }
}