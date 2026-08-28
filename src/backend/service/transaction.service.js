import { prisma } from "@/lib/prisma";

// ========================================
// CREATE TRANSACTION
// ========================================

export async function createTransaction({
  items,
  paymentMethod,
  cashReceived,
  cashierId,
}) {
  console.log(
    "TRANSACTION ITEMS DARI FRONTEND:",
    items
  );

  if (
    !items ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    throw new Error(
      "Item transaksi tidak boleh kosong"
    );
  }

  if (!paymentMethod) {
    throw new Error(
      "Metode pembayaran wajib dipilih"
    );
  }

  if (!cashierId) {
    throw new Error(
      "Cashier ID tidak ditemukan"
    );
  }

  // ========================================
  // DATABASE TRANSACTION
  // ========================================

  return await prisma.$transaction(
    async (tx) => {
      // ========================================
      // SIAPKAN ITEM TRANSAKSI
      // ========================================

      const transactionItems = items.map(
        (item) => {
          const productId = Number(
            item.productId ?? item.id
          );

          const quantity = Number(
            item.quantity ?? item.qty
          );

          const price = Number(
            item.price
          );

          // -------------------------------
          // VALIDASI PRODUCT ID
          // -------------------------------

          if (
            !productId ||
            Number.isNaN(productId)
          ) {
            throw new Error(
              "Product ID tidak ditemukan dalam item transaksi"
            );
          }

          // -------------------------------
          // VALIDASI QUANTITY
          // -------------------------------

          if (
            !quantity ||
            quantity <= 0 ||
            Number.isNaN(quantity)
          ) {
            throw new Error(
              `Jumlah produk tidak valid untuk product ID ${productId}`
            );
          }

          // -------------------------------
          // VALIDASI PRICE
          // -------------------------------

          if (
            !price ||
            price <= 0 ||
            Number.isNaN(price)
          ) {
            throw new Error(
              `Harga produk tidak valid untuk product ID ${productId}`
            );
          }

          // -------------------------------
          // HITUNG SUBTOTAL
          // -------------------------------

          const subtotal =
            quantity * price;

          return {
            productId,
            quantity,
            price,
            subtotal,
          };
        },

      );

      // ========================================
      // HITUNG TOTAL
      // ========================================

      const total =
        transactionItems.reduce(
          (sum, item) =>
            sum + item.subtotal,
          0
        );

      // ========================================
      // CEK PRODUK & STOCK
      // ========================================

      for (
        const item of transactionItems
      ) {
        const product =
          await tx.product.findUnique({
            where: {
              id: item.productId,
            },
          });

        if (!product) {
          throw new Error(
            `Produk dengan ID ${item.productId} tidak ditemukan`
          );
        }

        if (
          product.stock <
          item.quantity
        ) {
          throw new Error(
            `Stock ${product.name} tidak mencukupi`
          );
        }
      }

      // ========================================
      // PEMBAYARAN
      // ========================================

      const received =
        Number(cashReceived) || 0;

      if (
        paymentMethod === "cash" &&
        received < total
      ) {
        throw new Error(
          "Uang pembayaran tidak mencukupi"
        );
      }

      // ========================================
      // KEMBALIAN
      // ========================================

      const change =
        paymentMethod === "cash"
          ? received - total
          : 0;

      

      // ========================================
      // SIMPAN TRANSAKSI
      // ========================================

      const transaction =
        await tx.transaction.create({
          data: {
            total,

            paymentMethod,

            cashReceived:
              paymentMethod === "cash"
                ? received
                : 0,

            change,

            cashierId:
              Number(cashierId),

            // ==================================
            // SIMPAN ITEM TRANSAKSI
            // ==================================

            items: {
              create: transactionItems,
            },
          },

          // ==================================
          // DATA RESPONSE
          // ==================================

          include: {
            cashier: {
              select: {
                id: true,
                username: true,
              },
            },

            items: {
              include: {
                product: true,
              },
            },
          },
        });

      // ========================================
      // KURANGI STOCK
      // ========================================

      for (
        const item of transactionItems
      ) {
        await tx.product.update({
          where: {
            id: item.productId,
          },

          data: {
            stock: {
              decrement:
                item.quantity,
            },
          },
        });
      }

      // ========================================
      // RETURN TRANSAKSI
      // ========================================

      return transaction;
    },
    
  );
}


// ========================================
// GET ALL TRANSACTIONS
// ========================================

export async function getTransactions() {
  return await prisma.transaction.findMany({
    orderBy: {
      createdAt: "desc",
    },

    include: {
      cashier: {
        select: {
          id: true,
          username: true,
        },
      },

      items: {
        include: {
          product: true,
        },
      },
    },
  });
}


// ========================================
// GET TRANSACTION BY ID
// ========================================

export async function getTransactionById(
  id
) {
  const transaction =
    await prisma.transaction.findUnique({
      where: {
        id: Number(id),
      },

      include: {
        cashier: {
          select: {
            id: true,
            username: true,
          },
        },

        items: {
          include: {
            product: true,
          },
        },
      },
    });

  if (!transaction) {
    throw new Error(
      "Transaksi tidak ditemukan"
    );
  }

  return transaction;
}


// ========================================
// DELETE TRANSACTION
// ========================================

export async function deleteTransaction(id) {
  const transactionId = Number(id);

  if (
    !transactionId ||
    Number.isNaN(transactionId)
  ) {
    throw new Error(
      "ID transaksi tidak valid"
    );
  }

  const transaction =
    await prisma.transaction.findUnique({
      where: {
        id: transactionId,
      },

      include: {
        items: true,
      },
    });

  if (!transaction) {
    throw new Error(
      "Transaksi tidak ditemukan"
    );
  }

  return await prisma.$transaction(
    async (tx) => {

      // Kembalikan stock
      for (
        const item of transaction.items
      ) {
        await tx.product.update({
          where: {
            id: item.productId,
          },

          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      // Hapus item
      await tx.transactionItem.deleteMany({
        where: {
          transactionId,
        },
      });

      // Hapus transaksi
      return await tx.transaction.delete({
        where: {
          id: transactionId,
        },
      });
    },
    {
      maxWait: 10000,
      timeout: 20000,
    }
  );
}

