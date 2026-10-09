import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();

    cookieStore.delete("pos_token");

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
      {
        status: 500,
      }
    );
  }
}