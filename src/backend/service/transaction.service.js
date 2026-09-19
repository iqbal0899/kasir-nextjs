import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export async function createTransaction({
  items,
  paymentMethod,
  cashReceived,
  cashierId,
  idempotencyKey,
}) {
  console.log(
    "TRANSACTION ITEMS DARI FRONTEND:",
    items
  );

  console.log(
    "IDEMPOTENCY KEY:",
    idempotencyKey
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

  if (!idempotencyKey) {
    throw new Error(
      "Idempotency-Key wajib diisi"
    );
  }

  // ==========================================
  // DATABASE TRANSACTION
  // ==========================================

  const transaction = await prisma.$transaction(
    async (tx) => {

      

      // ==========================================
      // CEK IDEMPOTENCY KEY
      // ==========================================

      const existingTransaction =
  await tx.transaction.findUnique({
    where: {
      idempotencyKey,
    },

    select: {
      id: true,
    },
  });

      if (existingTransaction) {
        console.log(
          "TRANSAKSI SUDAH PERNAH DIBUAT"
        );

        console.log(
          "ID:",
          existingTransaction.id
        );

        return existingTransaction;
      }

      console.log(
        "IDEMPOTENCY KEY BARU, MEMBUAT TRANSAKSI..."
      );

      // ==========================================
      // VALIDASI ITEM
      // ==========================================

      const transactionItems = items.map(
        (item) => {
          const productId = Number(
            item.productId ?? item.id
          );

          const quantity = Number(
            item.quantity ?? item.qty
          );

          const price = Number(item.price);

          if (
            !productId ||
            Number.isNaN(productId)
          ) {
            throw new Error(
              "Product ID tidak ditemukan dalam item transaksi"
            );
          }

          if (
            !quantity ||
            quantity <= 0 ||
            Number.isNaN(quantity)
          ) {
            throw new Error(
              `Jumlah produk tidak valid untuk product ID ${productId}`
            );
          }

          if (
            !price ||
            price <= 0 ||
            Number.isNaN(price)
          ) {
            throw new Error(
              `Harga produk tidak valid untuk product ID ${productId}`
            );
          }

          const subtotal =
            quantity * price;

          return {
            productId,
            quantity,
            price,
            subtotal,
          };
        }
      );

      // ==========================================
      // TOTAL
      // ==========================================

      const total =
        transactionItems.reduce(
          (sum, item) =>
            sum + item.subtotal,
          0
        );

      // ==========================================
      // CEK STOCK
      // ==========================================

      // ==========================================
// CEK STOCK
// ==========================================

const productIds = transactionItems.map(
  (item) => item.productId
);

const products = await tx.product.findMany({
  where: {
    id: {
      in: productIds,
    },
  },

  select: {
    id: true,
    name: true,
    stock: true,
  },
});

const productMap = new Map(
  products.map((product) => [
    product.id,
    product,
  ])
);

for (const item of transactionItems) {
  const product = productMap.get(
    item.productId
  );

  if (!product) {
    throw new Error(
      `Produk dengan ID ${item.productId} tidak ditemukan`
    );
  }

  if (product.stock < item.quantity) {
    throw new Error(
      `Stock ${product.name} tidak mencukupi`
    );
  }
}

      // ==========================================
      // PEMBAYARAN
      // ==========================================

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

      const change =
        paymentMethod === "cash"
          ? received - total
          : 0;

      // ==========================================
      // CREATE TRANSACTION
      // ==========================================

const transaction =
  await tx.transaction.create({
    data: {
      idempotencyKey,

      totalAmount: total,

      paymentMethod,

      cashReceived:
        paymentMethod === "cash"
          ? received
          : 0,

      change,

      cashierId:
        Number(cashierId),

      items: {
        create: transactionItems,
      },
    },

    select: {
      id: true,
      idempotencyKey: true,
      totalAmount: true,
      paymentMethod: true,
      cashReceived: true,
      change: true,
      cashierId: true,
      createdAt: true,
    },
  });

      // ==========================================
      // KURANGI STOCK
      // ==========================================

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

      console.log(
        "TRANSAKSI BERHASIL DIBUAT:",
        transaction.id
      );

      return transaction;
    },
    {
      maxWait: 10000,
      timeout: 20000,
    }
  );

  const transactionDetail =
  await prisma.transaction.findUnique({
    where: {
      id: transaction.id,
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

  // ==========================================
  // PUSHER
  // ==========================================

  try {
    await pusherServer.trigger(
      "dashboard",
      "transaction-created",
      {
        transactionId: transaction.id,
      }
    );

    console.log(
      "PUSHER: transaction-created terkirim"
    );

  } catch (error) {
    console.error(
      "PUSHER ERROR:",
      error
    );
  }

  return transactionDetail;
}

const dbStart = performance.now();

const transactionStart = performance.now();

export async function getTransactions({
  page = 1,
  limit = 10,
  startDateTransaction,
  endDateTransaction,
} = {}) {
  const currentPage = Math.max(Number(page) || 1, 1);

  const currentLimit = Math.min(
    Math.max(Number(limit) || 10, 1),
    100
  );

  const skip = (currentPage - 1) * currentLimit;

  const where = {};

  if (startDateTransaction || endDateTransaction) {
    where.createdAt = {};

    if (startDateTransaction) {
      where.createdAt.gte = new Date(
        `${startDateTransaction}T00:00:00`
      );
    }

    if (endDateTransaction) {
      where.createdAt.lte = new Date(
        `${endDateTransaction}T23:59:59.999`
      );
    }
  }

const dbStart = performance.now();

const transactionStart = performance.now();

const transactions = await prisma.transaction.findMany({
  where,
  skip,
  take: currentLimit + 1,
  orderBy: [
    { createdAt: "desc" },
    { id: "desc" },
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

console.log(
  `TRANSACTIONS FINDMANY: ${(
    performance.now() - transactionStart
  ).toFixed(2)} ms`
);

const countStart = performance.now();

const total = await prisma.transaction.count({
  where,
});

console.log(
  `TRANSACTIONS COUNT: ${(
    performance.now() - countStart
  ).toFixed(2)} ms`
);

console.log(
  `TRANSACTIONS DB TOTAL: ${(
    performance.now() - dbStart
  ).toFixed(2)} ms`
);

const hasNext = transactions.length > currentLimit;

if (hasNext) {
  transactions.pop();
}

return {
  transactions,
  pagination: {
    page: currentPage,
    limit: currentLimit,
    hasNext,
  },
};
}


export async function getTransactionById(id) {
  const transactionId = Number(id);

  if (!transactionId || Number.isNaN(transactionId)) {
    throw new Error("ID transaksi tidak valid");
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
}
          },
        },
      },
    });

  if (!transaction) {
    throw new Error("Transaksi tidak ditemukan");
  }

  return transaction;
}

export async function deleteTransaction(id) {
  const transactionId = Number(id);

  if (!transactionId || Number.isNaN(transactionId)) {
    throw new Error("ID transaksi tidak valid");
  }

  return await prisma.$transaction(async (tx) => {
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
      throw new Error("Transaksi tidak ditemukan");
    }

    // Kembalikan stock produk
    for (const item of transaction.items) {
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

    // Hapus transaction item
    await tx.transactionItem.deleteMany({
      where: {
        transactionId,
      },
    });

    // Hapus transaksi
    const deletedTransaction =
      await tx.transaction.delete({
        where: {
          id: transactionId,
        },
      });

    return deletedTransaction;
  });
}


