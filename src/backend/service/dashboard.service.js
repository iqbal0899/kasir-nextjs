import { prisma } from "@/lib/prisma";

export async function getDashboardAnalytics() {
  const totalStart = performance.now();

  try {
    // =========================
    // DASHBOARD SUMMARY
    // =========================
    const summary = await prisma.$queryRaw`
      SELECT
        (SELECT COUNT(*) FROM "Product") AS "totalProducts",

        (
          SELECT COALESCE(SUM("stock"), 0)
          FROM "Product"
        ) AS "totalStock",

        (
          SELECT COUNT(*)
          FROM "Transaction"
        ) AS "totalTransactions",

        (
          SELECT COALESCE(SUM("totalAmount"), 0)
          FROM "Transaction"
        ) AS "totalRevenue",

        (
          SELECT COUNT(*)
          FROM "Product"
          WHERE "stock" <= 5
        ) AS "lowStock"
    `;
    const summaryData = summary[0];

    // =========================
    // SALES 7 DAYS
    // =========================

    const startDate = new Date();

    startDate.setHours(0, 0, 0, 0);

    startDate.setDate(
      startDate.getDate() - 6
    );

    const salesRaw = await prisma.$queryRaw`
      SELECT
        DATE("createdAt") AS date,
        COALESCE(SUM("totalAmount"), 0) AS total
      FROM "Transaction"
      WHERE "createdAt" >= ${startDate}
      GROUP BY DATE("createdAt")
      ORDER BY DATE("createdAt") ASC
    `;

    // =========================
    // SALES MAP
    // =========================

    const salesMap = {};

    salesRaw.forEach((row) => {
      const date = new Date(row.date);

      const key = [
        date.getFullYear(),
        String(
          date.getMonth() + 1
        ).padStart(2, "0"),
        String(
          date.getDate()
        ).padStart(2, "0"),
      ].join("-");

      salesMap[key] = Number(
        row.total || 0
      );
    });

    // =========================
    // SALES CHART
    // =========================

    const salesChart = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();

      date.setHours(0, 0, 0, 0);

      date.setDate(
        date.getDate() - i
      );

      const key = [
        date.getFullYear(),
        String(
          date.getMonth() + 1
        ).padStart(2, "0"),
        String(
          date.getDate()
        ).padStart(2, "0"),
      ].join("-");

      salesChart.push({
        date: key,
        total: salesMap[key] || 0,
      });
    }

    // =========================
    // TOP PRODUCTS
    // =========================

const topProductsRaw = await prisma.$queryRaw`
  SELECT
    ti."productId",
    p."name",
    SUM(ti."quantity") AS "quantity",
    SUM(ti."subtotal") AS "revenue"
  FROM "TransactionItem" ti
  INNER JOIN "Product" p
    ON p."id" = ti."productId"
  GROUP BY
    ti."productId",
    p."name"
  ORDER BY
    SUM(ti."quantity") DESC
  LIMIT 5
`;

const topProducts = topProductsRaw.map(
  (item) => ({
    productId: item.productId,
    name: item.name,
    quantity: Number(item.quantity || 0),
    revenue: Number(item.revenue || 0),
  })
);

      

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
        totalProducts: Number(
          summaryData.totalProducts
        ),

        totalStock: Number(
          summaryData.totalStock
        ),

        totalTransactions: Number(
          summaryData.totalTransactions
        ),

        totalRevenue: Number(
          summaryData.totalRevenue
        ),

        lowStock: Number(
          summaryData.lowStock
        ),
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