import { prisma } from "@/lib/prisma";

export async function getProducts({
  page = 1,
  limit = 10,
} = {}) {
  const currentPage = Math.max(Number(page) || 1, 1);
  const currentLimit = Math.max(Number(limit) || 10, 1);

  const skip = (currentPage - 1) * currentLimit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      orderBy: {
        id: "asc",
      },
      skip,
      take: currentLimit,
    }),

    prisma.product.count(),
  ]);

  return {
    data: products,
    pagination: {
      page: currentPage,
      limit: currentLimit,
      total,
      totalPages: Math.ceil(total / currentLimit),
    },
  };
}

export async function getActiveProducts({
  page = 1,
  limit = 10,
  startDate,
  endDate,
} = {}) {
  const currentPage = Math.max(
    Number(page) || 1,
    1
  );

  const currentLimit = Math.max(
    Number(limit) || 10,
    1
  );

  const skip =
    (currentPage - 1) * currentLimit;

  // =====================================================
  // FILTER TANGGAL TRANSAKSI
  // =====================================================

  const transactionDateFilter = {};

  if (startDate) {
    transactionDateFilter.gte =
      new Date(`${startDate}T00:00:00`);
  }

  if (endDate) {
    transactionDateFilter.lte =
      new Date(`${endDate}T23:59:59.999`);
  }

  const hasDateFilter =
    Object.keys(transactionDateFilter).length > 0;

  // =====================================================
  // PRODUCT WHERE
  // =====================================================

  const where = {
    isActive: true,
  };

  // =====================================================
  // QUERY
  // =====================================================

  const [products, total] =
    await Promise.all([
      prisma.product.findMany({
        where,

        include: {
          transactionItems: {
            where: hasDateFilter
              ? {
                  transaction: {
                    createdAt:
                      transactionDateFilter,
                  },
                }
              : undefined,

            select: {
              quantity: true,
            },
          },
        },

        orderBy: {
          id: "asc",
        },

        skip,
        take: currentLimit,
      }),

      prisma.product.count({
        where,
      }),
    ]);

  // =====================================================
  // HITUNG STOCK TERJUAL
  // =====================================================

  const data = products.map(
    (product) => {
       console.log("PRODUCT:", product.name);
  console.log("TRANSACTION ITEMS:", product.transactionItems);
      const soldStock =
        product.transactionItems.reduce(
          (totalSold, item) => {
            return (
              totalSold +
              Number(item.quantity || 0)
            );
          },
          0
        );

      return {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        stock: Number(product.stock || 0),
        category: product.category,
        image: product.image,
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,

        soldStock,
      };
    }
  );

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
        Math.ceil(total / currentLimit),
    },
  };
}

export async function getProductById(id) {
  return await prisma.product.findUnique({
    where: {
      id: Number(id),
    },
  });
}

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

export async function updateProduct(id, data) {
  return await prisma.product.update({
    where: {
      id: Number(id),
    },
    data,
  });
}

// AKTIF / NONAKTIF PRODUK
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

// SOFT DELETE
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

export async function restoreProduct(id) {
  const productId = Number(id);

  if (!productId || Number.isNaN(productId)) {
    throw new Error("ID produk tidak valid");
  }

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new Error("Produk tidak ditemukan");
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