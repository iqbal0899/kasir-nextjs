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

  return await prisma.$transaction(
    async (tx) => {
      let total = 0;

      const transactionItems = [];

      // ========================================
      // CEK PRODUK
      // ========================================

      for (const item of items) {
        const product =
          await tx.product.findUnique({
            where: {
              id: Number(item.productId),
            },
          });

        if (!product) {
          throw new Error(
            `Produk dengan ID ${item.productId} tidak ditemukan`
          );
        }

        const quantity =
          Number(item.quantity);

        if (
          !quantity ||
          quantity <= 0
        ) {
          throw new Error(
            `Jumlah produk ${product.name} tidak valid`
          );
        }

        if (
          product.stock < quantity
        ) {
          throw new Error(
            `Stock ${product.name} tidak mencukupi`
          );
        }

        const price =
          Number(product.price);

        const subtotal =
          price * quantity;

        total += subtotal;

        transactionItems.push({
          productId: product.id,
          quantity,
          price,
          subtotal,
        });
      }

      // ========================================
      // PEMBAYARAN
      // ========================================

      const received =
        Number(cashReceived || 0);

      if (
        paymentMethod === "cash" &&
        received < total
      ) {
        throw new Error(
          "Uang pembayaran tidak mencukupi"
        );
      }

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

            transactionItems: {
              create:
                transactionItems,
            },
          },

          include: {
            cashier: {
              select: {
                id: true,
                username: true,
              },
            },

            transactionItems: {
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

      return transaction;
    }
  );
}


// ========================================
// GET TRANSACTIONS
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

      transactionItems: {
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

        transactionItems: {
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

export async function deleteTransaction(
  id
) {
  const transaction =
    await prisma.transaction.findUnique({
      where: {
        id: Number(id),
      },

      include: {
        transactionItems: true,
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
        const item of transaction.transactionItems
      ) {
        await tx.product.update({
          where: {
            id: item.productId,
          },

          data: {
            stock: {
              increment:
                item.quantity,
            },
          },
        });
      }

      // Hapus item transaksi
      await tx.transactionItem.deleteMany({
        where: {
          transactionId:
            Number(id),
        },
      });

      // Hapus transaksi
      return await tx.transaction.delete({
        where: {
          id: Number(id),
        },
      });
    }
  );
}