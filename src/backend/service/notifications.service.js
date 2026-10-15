import { prisma } from "@/lib/prisma";
import { getNotificationSession } from "@/lib/notification-auth";

export async function createNotification({
  title,
  message,
  href = null,
}) {
  const session = await getNotificationSession();

  if (!session) {
    throw new Error("Sesi login tidak valid.");
  }

  return prisma.notification.create({
    data: {
      title,
      message,
      href,
      userId: session.userId,
      sessionId: session.sessionId,
    },
  });
}
