import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST() {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get("pos_token")?.value;
    const notificationSession = cookieStore.get(
      "notificationSession"
    )?.value;

    if (token && notificationSession && process.env.JWT_SECRET) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (
          decoded &&
          typeof decoded !== "string" &&
          decoded.id
        ) {
          await prisma.notification.deleteMany({
            where: {
              userId: Number(decoded.id),
              sessionId: notificationSession,
            },
          });
        }
      } catch (error) {
        console.error("LOGOUT JWT ERROR:", error.name);
      }
    }

    cookieStore.delete("pos_token");
    cookieStore.delete("notificationSession");

    return Response.json({
      success: true,
      message: "Logout berhasil",
    });
  } catch (error) {
    console.error("LOGOUT ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Gagal logout",
      },
      { status: 500 }
    );
  }
}
