import {
  getProductById,
  updateProduct,
} from "@/backend/actions/product.action";

export async function reduceStock(
  productId,
  quantity
) {
  const product =
    await getProductById(productId);

  if (!product) {
    throw new Error(
      "Produk tidak ditemukan"
    );
  }

  if (quantity <= 0) {
    throw new Error(
      "Jumlah stok tidak valid"
    );
  }

  if (product.stock < quantity) {
    throw new Error(
      `Stok ${product.name} tidak mencukupi`
    );
  }

  return await updateProduct(
    productId,
    {
      stock:
        product.stock - quantity,
    }
  );
}