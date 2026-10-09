
import { verifyToken } from "@/lib/auth";

export async function GET(request) {
  const user = verifyToken(request);

  if (!user) {
    return Response.json(
      {
        success: false,
        message: "Sesi login tidak valid atau sudah berakhir",
      },
      { status: 401 }
    );
  }

  return Response.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
    },
  });
}