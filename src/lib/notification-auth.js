import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function getNotificationSession() {
  const cookieStore = await cookies();

  const token = cookieStore.get("pos_token")?.value;
  const sessionId = cookieStore.get("notificationSession")?.value;

  console.log("NOTIFICATION AUTH:", {
    hasToken: Boolean(token),
    hasNotificationSession: Boolean(sessionId),
    hasJwtSecret: Boolean(process.env.JWT_SECRET),
  });

  if (!token || !sessionId || !process.env.JWT_SECRET) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || typeof decoded === "string" || !decoded.id) {
      console.log("NOTIFICATION AUTH: Invalid JWT payload");
      return null;
    }

    return {
      userId: Number(decoded.id),
      sessionId,
    };
  } catch (error) {
    console.error("NOTIFICATION JWT ERROR:", error.name);
    return null;
  }
}