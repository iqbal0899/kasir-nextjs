import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        id: "desc",
      },
    });

    return Response.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("PRODUCT API ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Gagal mengambil products",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}