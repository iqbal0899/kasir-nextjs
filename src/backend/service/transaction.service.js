import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { decreaseStock } from "./stock.service";


// =====================================================
// CREATE TRANSACTION
// =====================================================

export async function createTransaction({
  items,
  paymentMethod,
  cashReceived,
  cashierId,
  idempotencyKey,
}) {
  // ===================================================
  // VALIDATION
  // ===================================================

  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {
    throw new Error(
      "Item transaksi tidak boleh kosong"
    );
  }

  if (
    !["cash", "qris"].includes(
      paymentMethod
    )
  ) {
    throw new Error(
      "Metode pembayaran tidak valid"
    );
  }

  if (!cashierId) {
    throw new Error(
      "Cashier ID wajib diisi"
    );
  }

  if (!idempotencyKey) {
    throw new Error(
      "Idempotency key wajib diisi"
    );
  }

  // ===================================================
  // FORMAT ITEMS
  // ===================================================

  const formattedItems =
    items.map((item) => ({
      productId: Number(
        item.productId
      ),

      quantity: Number(
        item.quantity
      ),
    }));

  // ===================================================
  // VALIDATE ITEMS
  // ===================================================

  for (const item of formattedItems) {
    if (
      !Number.isInteger(
        item.productId
      ) ||
      item.productId <= 0
    ) {
      throw new Error(
        "Product ID tidak valid"
      );
    }

    if (
      !Number.isInteger(
        item.quantity
      ) ||
      item.quantity <= 0
    ) {
      throw new Error(
        "Quantity produk tidak valid"
      );
    }
  }

  let createdTransaction = null;
  let isNewTransaction = false;

  // ===================================================
  // DATABASE TRANSACTION
  // ===================================================

  await prisma.$transaction(
    async (tx) => {

      // =================================================
      // IDEMPOTENCY
      // =================================================

      const existingTransaction =
        await tx.transaction.findUnique({
          where: {
            idempotencyKey,
          },

          include: {
            items: {
              include: {
                product: true,
              },
            },

            cashier: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        });

      if (existingTransaction) {
        createdTransaction =
          existingTransaction;

        return;
      }

      // =================================================
      // PRODUCT IDS
      // =================================================

      const productIds = [
        ...new Set(
          formattedItems.map(
            (item) =>
              item.productId
          )
        ),
      ];

      // =================================================
      // GET PRODUCTS
      // =================================================

      const products =
        await tx.product.findMany({
          where: {
            id: {
              in: productIds,
            },

            isActive: true,
          },
        });

      if (
        products.length !==
        productIds.length
      ) {
        throw new Error(
          "Salah satu produk tidak ditemukan atau sudah tidak aktif"
        );
      }

      const productMap =
        new Map(
          products.map(
            (product) => [
              product.id,
              product,
            ]
          )
        );

      // =================================================
      // CALCULATE TOTAL
      // =================================================

      let totalAmount = 0;

      for (
        const item of formattedItems
      ) {
        const product =
          productMap.get(
            item.productId
          );

        if (!product) {
          throw new Error(
            `Produk ${item.productId} tidak ditemukan`
          );
        }

        const price =
          Number(product.price);

        totalAmount +=
          price *
          item.quantity;
      }

      // =================================================
      // PAYMENT
      // =================================================

      const cash =
        Number(cashReceived) || 0;

      let change = 0;

      if (
        paymentMethod === "cash"
      ) {
        if (
          cash < totalAmount
        ) {
          throw new Error(
            "Uang tunai tidak mencukupi"
          );
        }

        change =
          cash -
          totalAmount;
      }

      // =================================================
      // DECREASE STOCK
      // =================================================

      for (
        const item of formattedItems
      ) {
        const product =
          productMap.get(
            item.productId
          );

        await decreaseStock(
          tx,
          item.productId,
          item.quantity,
          product.name
        );
      }

      // =================================================
      // CREATE TRANSACTION
      // =================================================

      const transaction =
        await tx.transaction.create({
          data: {
            idempotencyKey,

            totalAmount,

            paymentMethod,

            cashReceived:
              cash,

            change,

            cashierId,

            items: {
              create:
                formattedItems.map(
                  (item) => {
                    const product =
                      productMap.get(
                        item.productId
                      );

                    const price =
                      Number(
                        product.price
                      );

                    return {
                      productId:
                        item.productId,

                      quantity:
                        item.quantity,

                      price,

                      subtotal:
                        price *
                        item.quantity,
                    };
                  }
                ),
            },
          },

          include: {
            items: {
              include: {
                product: true,
              },
            },

            cashier: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        });

      // =================================================
      // STOCK HISTORY
      // =================================================

      // =================================================
// STOCK HISTORY
// =================================================

for (const item of formattedItems) {
  const product = productMap.get(item.productId);

  if (!product) {
    throw new Error(
      `Produk ${item.productId} tidak ditemukan`
    );
  }

  const stockBefore = Number(product.stock);
  const stockAfter =
    stockBefore - item.quantity;

  await tx.stockHistory.create({
    data: {
      productId: item.productId,

      quantity: -item.quantity,

      type: "SALE",

      stockBefore,

      stockAfter,
    },
  });
}

      createdTransaction =
        transaction;

      isNewTransaction = true;
    },

    {
      maxWait: 10000,
      timeout: 20000,
    }
  );

  // ===================================================
  // PUSHER
  // ===================================================

  if (
    isNewTransaction &&
    createdTransaction
  ) {
    try {
      await pusherServer.trigger(
        "dashboard",
        "transaction-created",
        {
          transactionId:
            createdTransaction.id,
        }
      );
    } catch (error) {
      console.error(
        "PUSHER TRANSACTION EVENT ERROR:",
        error
      );
    }
  }

  return createdTransaction;
}


// =====================================================
// GET TRANSACTIONS
// =====================================================

export async function getTransactions({
  page = 1,
  limit = 10,
  startDateTransaction,
  endDateTransaction,
} = {}) {
  const currentPage =
    Math.max(
      Number(page) || 1,
      1
    );

  const currentLimit =
    Math.min(
      Math.max(
        Number(limit) || 10,
        1
      ),
      100
    );

  const skip =
    (currentPage - 1) *
    currentLimit;

  const where = {};

  if (
    startDateTransaction ||
    endDateTransaction
  ) {
    where.createdAt = {};

    if (startDateTransaction) {
      where.createdAt.gte =
        new Date(
          `${startDateTransaction}T00:00:00`
        );
    }

    if (endDateTransaction) {
      where.createdAt.lte =
        new Date(
          `${endDateTransaction}T23:59:59.999`
        );
    }
  }

  const transactions =
    await prisma.transaction.findMany({
      where,

      skip,

      take:
        currentLimit + 1,

      orderBy: [
        {
          createdAt: "desc",
        },
        {
          id: "desc",
        },
      ],

      select: {
        id: true,
        totalAmount: true,
        paymentMethod: true,
        cashReceived: true,
        change: true,
        cashierId: true,
        createdAt: true,

        cashier: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

  const hasNext =
    transactions.length >
    currentLimit;

  if (hasNext) {
    transactions.pop();
  }

  const total =
    await prisma.transaction.count({
      where,
    });

  return {
    transactions,

    pagination: {
      page: currentPage,
      limit: currentLimit,
      total,
      hasNext,
    },
  };
}


// =====================================================
// GET TRANSACTION BY ID
// =====================================================

export async function getTransactionById(
  id
) {
  const transactionId =
    Number(id);

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
        cashier: {
          select: {
            id: true,
            username: true,
          },
        },

        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                category: true,
              },
            },
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


// =====================================================
// DELETE TRANSACTION
// =====================================================

export async function deleteTransaction(
  id
) {
  const transactionId =
    Number(id);

  if (
    !transactionId ||
    Number.isNaN(transactionId)
  ) {
    throw new Error(
      "ID transaksi tidak valid"
    );
  }

  return await prisma.$transaction(
    async (tx) => {
      const transaction =
        await tx.transaction.findUnique({
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
              increment:
                item.quantity,
            },
          },
        });
      }

      // Hapus transaction items
      await tx.transactionItem.deleteMany({
        where: {
          transactionId,
        },
      });

      // Hapus transaction
      return await tx.transaction.delete({
        where: {
          id: transactionId,
        },
      });
    }
  );
}