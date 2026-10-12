import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";
import { getNotificationSession } from "@/lib/notification-auth";

export async function GET() {
  try {
    const session = await getNotificationSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Sesi login tidak valid.",
          data: {
            notifications: [],
            unreadCount: 0,
          },
        },
        { status: 401 }
      );
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: {
          userId: session.userId,
          sessionId: session.sessionId,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.notification.count({
        where: {
          userId: session.userId,
          sessionId: session.sessionId,
          isRead: false,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Gagal mengambil notifikasi." },
      { status: 500 }
    );
  }
}