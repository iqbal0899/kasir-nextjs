import { prisma } from "@/lib/prisma";

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

  return await prisma.$transaction(
    async (tx) => {

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
        },

      );


      const total =
        transactionItems.reduce(
          (sum, item) =>
            sum + item.subtotal,
          0
        );


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


            items: {
              create: transactionItems,
            },
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
    },
    
  );
}


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


      await tx.transactionItem.deleteMany({
        where: {
          transactionId,
        },
      });


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



