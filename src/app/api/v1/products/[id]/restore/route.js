import { restoreProduct } from "@/backend/actions/product.action";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;

    const product = await restoreProduct(id);

    return Response.json({
      success: true,
      message: "Product berhasil diaktifkan kembali",
      data: product,
    });
  } catch (error) {
    console.error("RESTORE PRODUCT ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Gagal mengaktifkan product",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}