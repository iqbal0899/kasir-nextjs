// =====================================================
// DECREASE STOCK
// =====================================================

export async function decreaseStock(
  tx,
  productId,
  quantity,
  productName
) {
  if (
    !Number.isInteger(quantity) ||
    quantity <= 0
  ) {
    throw new Error(
      "Jumlah stok tidak valid"
    );
  }

  /*
   * Atomic conditional update.
   *
   * Stok hanya akan dikurangi jika:
   * - produk aktif
   * - stock >= quantity
   *
   * PostgreSQL akan menangani concurrent update
   * pada row yang sama secara aman.
   */
  const result =
    await tx.product.updateMany({
      where: {
        id: productId,

        isActive: true,

        stock: {
          gte: quantity,
        },
      },

      data: {
        stock: {
          decrement: quantity,
        },
      },
    });

  /*
   * count = 0 berarti:
   * - produk tidak ada
   * - produk tidak aktif
   * - atau stok tidak mencukupi
   */
  if (result.count !== 1) {
    throw new Error(
      `Stok produk "${productName}" tidak mencukupi`
    );
  }

  return result;
}