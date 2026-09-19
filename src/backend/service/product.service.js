import { prisma } from "@/lib/prisma";

// =====================================================
// GET PRODUCTS
// =====================================================

export async function getProducts({
  page = 1,
  limit = 10,
  startDateProduct,
  endDateProduct,
} = {}) {
  const currentPage = Math.max(Number(page) || 1, 1);

  const currentLimit = Math.min(
    Math.max(Number(limit) || 10, 1),
    100
  );

  const skip = (currentPage - 1) * currentLimit;

  // =====================================================
  // DATE FILTER
  // =====================================================

  const startDate = startDateProduct
    ? new Date(`${startDateProduct}T00:00:00`)
    : null;

  const endDate = endDateProduct
    ? new Date(`${endDateProduct}T23:59:59.999`)
    : null;

  const hasDateFilter = Boolean(startDate || endDate);

  const transactionDateFilter = {};

  if (startDate) {
    transactionDateFilter.gte = startDate;
  }

  if (endDate) {
    transactionDateFilter.lte = endDate;
  }

  // =====================================================
  // PRODUCT QUERY
  // =====================================================

const products = await prisma.product.findMany({
  orderBy: {
    id: "asc",
  },
  skip,
  take: currentLimit,
  select: {
    id: true,
    name: true,
    price: true,
    stock: true,
    category: true,
    image: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
  },
});

const total = await prisma.product.count();

  // =====================================================
  // PRODUCT IDS
  // =====================================================

  const productIds = products.map(
    (product) => product.id
  );

  // =====================================================
  // SOLD STOCK
  // =====================================================

  const soldStockMap = {};

  if (productIds.length > 0) {
    const soldItems =
      await prisma.transactionItem.groupBy({
        by: ["productId"],

        where: {
          productId: {
            in: productIds,
          },

          ...(hasDateFilter
            ? {
                transaction: {
                  createdAt: transactionDateFilter,
                },
              }
            : {}),
        },

        _sum: {
          quantity: true,
        },
      });

    for (const item of soldItems) {
      soldStockMap[item.productId] =
        Number(item._sum.quantity || 0);
    }
  }

  // =====================================================
  // HISTORICAL STOCK
  // =====================================================

  const soldAfterDateMap = {};

  if (endDate && productIds.length > 0) {
    const soldAfterDate =
      await prisma.transactionItem.groupBy({
        by: ["productId"],

        where: {
          productId: {
            in: productIds,
          },

          transaction: {
            createdAt: {
              gt: endDate,
            },
          },
        },

        _sum: {
          quantity: true,
        },
      });

    for (const item of soldAfterDate) {
      soldAfterDateMap[item.productId] =
        Number(item._sum.quantity || 0);
    }
  }

  // =====================================================
  // RESPONSE DATA
  // =====================================================

  const data = products.map((product) => {
    const currentStock =
      Number(product.stock || 0);

    const soldStock =
      soldStockMap[product.id] || 0;

    let historicalStock =
      currentStock;

    if (endDate) {
      historicalStock =
        currentStock +
        (soldAfterDateMap[product.id] || 0);
    }

    return {
      id: product.id,

      name: product.name,

      price:
        Number(product.price),

      stock:
        historicalStock,

      category:
        product.category,

      image:
        product.image,

      isActive:
        product.isActive,

      createdAt:
        product.createdAt,

      updatedAt:
        product.updatedAt,

      soldStock,
    };
  });

  // =====================================================
  // RESPONSE
  // =====================================================

  return {
    data,

    pagination: {
      page: currentPage,

      limit: currentLimit,

      total,

      totalPages:
        Math.ceil(
          total / currentLimit
        ),
    },
  };
}


// =====================================================
// GET PRODUCT BY ID
// =====================================================

export async function getProductById(id) {
  return await prisma.product.findUnique({
    where: {
      id: Number(id),
    },
  });
}


// =====================================================
// CREATE PRODUCT
// =====================================================

export async function createProduct(data) {
  return await prisma.product.create({
    data: {
      name: data.name,
      price: data.price,
      stock: data.stock,
      category: data.category,
      image: data.image,
      isActive: true,
    },
  });
}


// =====================================================
// UPDATE PRODUCT
// =====================================================

export async function updateProduct(id, data) {
  return await prisma.product.update({
    where: {
      id: Number(id),
    },
    data,
  });
}


// =====================================================
// AKTIF / NONAKTIF PRODUK
// =====================================================

export async function toggleProductStatus(
  id,
  isActive
) {
  return await prisma.product.update({
    where: {
      id: Number(id),
    },
    data: {
      isActive: Boolean(isActive),
    },
  });
}


// =====================================================
// SOFT DELETE
// =====================================================

export async function deleteProduct(id) {
  return await prisma.product.update({
    where: {
      id: Number(id),
    },
    data: {
      isActive: false,
    },
  });
}


// =====================================================
// RESTORE PRODUCT
// =====================================================

export async function restoreProduct(id) {

  const productId = Number(id);

  if (
    !productId ||
    Number.isNaN(productId)
  ) {
    throw new Error(
      "ID produk tidak valid"
    );
  }


  const product =
    await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });


  if (!product) {
    throw new Error(
      "Produk tidak ditemukan"
    );
  }


  const restoredProduct =
    await prisma.product.update({
      where: {
        id: productId,
      },

      data: {
        isActive: true,
      },
    });


  return restoredProduct;
}

