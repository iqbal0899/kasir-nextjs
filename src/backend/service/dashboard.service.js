import { prisma } from "@/lib/prisma";

export async function getDashboardAnalytics() {
  try {
    const [
      totalProducts,
      totalStockResult,
      totalTransactions,
      revenueResult,
      lowStock,
    ] = await Promise.all([
      // =========================
      // TOTAL PRODUCTS
      // =========================
      prisma.product.count(),

      // =========================
      // TOTAL STOCK
      // =========================
      prisma.product.aggregate({
        _sum: {
          stock: true,
        },
      }),

      // =========================
      // TOTAL TRANSACTIONS
      // =========================
      prisma.transaction.count(),

      // =========================
      // TOTAL REVENUE
      // =========================
      prisma.transaction.aggregate({
        _sum: {
          totalAmount: true,
        },
      }),

      // =========================
      // LOW STOCK
      // =========================
      prisma.product.count({
        where: {
          stock: {
            lte: 5,
          },
        },
      }),
    ]);

    // =========================
    // SALES 7 DAYS
    // =========================

    const startDate = new Date();

    startDate.setHours(0, 0, 0, 0);

    startDate.setDate(
      startDate.getDate() - 6
    );

    const transactions =
      await prisma.transaction.findMany({
        where: {
          createdAt: {
            gte: startDate,
          },
        },

        select: {
          totalAmount: true,
          createdAt: true,
        },

        orderBy: {
          createdAt: "asc",
        },
      });

    const salesMap = {};

    transactions.forEach((transaction) => {
      const date = new Date(
        transaction.createdAt
      );

      const key = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(
          2,
          "0"
        ),
        String(date.getDate()).padStart(
          2,
          "0"
        ),
      ].join("-");

      if (!salesMap[key]) {
        salesMap[key] = 0;
      }

      salesMap[key] += Number(
        transaction.totalAmount || 0
      );
    });

    const salesChart = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();

      date.setHours(0, 0, 0, 0);

      date.setDate(
        date.getDate() - i
      );

      const key = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(
          2,
          "0"
        ),
        String(date.getDate()).padStart(
          2,
          "0"
        ),
      ].join("-");

      salesChart.push({
        date: key,
        total: salesMap[key] || 0,
      });
    }

    // =========================
    // TOP PRODUCTS
    // =========================

    const topProductsRaw =
      await prisma.transactionItem.groupBy({
        by: ["productId"],

        _sum: {
          quantity: true,
          subtotal: true,
        },

        orderBy: {
          _sum: {
            quantity: "desc",
          },
        },

        take: 5,
      });

    const productIds =
      topProductsRaw.map(
        (item) => item.productId
      );

    const products =
      await prisma.product.findMany({
        where: {
          id: {
            in: productIds,
          },
        },

        select: {
          id: true,
          name: true,
        },
      });

    const productMap = new Map(
      products.map((product) => [
        product.id,
        product.name,
      ])
    );

    const topProducts =
      topProductsRaw.map((item) => ({
        productId: item.productId,

        name:
          productMap.get(
            item.productId
          ) || "Produk tidak ditemukan",

        quantity:
          item._sum.quantity || 0,

        revenue: Number(
          item._sum.subtotal || 0
        ),
      }));

    // =========================
    // PAYMENT METHODS
    // =========================

    const paymentRaw =
      await prisma.transaction.groupBy({
        by: ["paymentMethod"],

        _sum: {
          totalAmount: true,
        },

        _count: {
          id: true,
        },
      });

    const paymentMethods =
      paymentRaw.map((item) => ({
        method: item.paymentMethod,

        total: Number(
          item._sum.totalAmount || 0
        ),

        count: item._count.id,
      }));

    // =========================
    // RECENT TRANSACTIONS
    // =========================

    const recentTransactions =
      await prisma.transaction.findMany({
        take: 5,

        orderBy: {
          createdAt: "desc",
        },

        select: {
          id: true,
          totalAmount: true,
          paymentMethod: true,
          createdAt: true,

          cashier: {
            select: {
              username: true,
            },
          },
        },
      });

    // =========================
    // RETURN
    // =========================

    return {
      summary: {
        totalProducts,

        totalStock:
          totalStockResult._sum.stock || 0,

        totalTransactions,

        totalRevenue: Number(
          revenueResult._sum.totalAmount || 0
        ),

        lowStock,
      },

      salesChart,

      topProducts,

      paymentMethods,

      recentTransactions:
        recentTransactions.map(
          (transaction) => ({
            id: transaction.id,

            total: Number(
              transaction.totalAmount || 0
            ),

            paymentMethod:
              transaction.paymentMethod,

            createdAt:
              transaction.createdAt,

            cashier:
              transaction.cashier?.username ||
              "-",
          })
        ),
    };
  } catch (error) {
    console.error(
      "DASHBOARD ANALYTICS ERROR:",
      error
    );

    throw error;
  }
}