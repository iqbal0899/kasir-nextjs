import { prisma } from "@/lib/prisma";

export async function getProducts() {
  return await prisma.product.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      id: "asc",
    },
  });
}

export async function getActiveProducts({
  page = 1,
  limit = 10,
  startDate,
  endDate,
} = {}) {
  const currentPage = Math.max(Number(page) || 1, 1);
  const currentLimit = Math.max(Number(limit) || 10, 1);

  const skip = (currentPage - 1) * currentLimit;

  // Filter transaksi berdasarkan tanggal
  const transactionDateFilter =
    startDate || endDate
      ? {
          createdAt: {
            ...(startDate
              ? {
                  gte: new Date(`${startDate}T00:00:00`),
                }
              : {}),
            ...(endDate
              ? {
                  lte: new Date(`${endDate}T23:59:59.999`),
                }
              : {}),
          },
        }
      : undefined;

  const where = {
    isActive: true,
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        transactionItems: {
          where: transactionDateFilter
            ? {
                transaction: transactionDateFilter,
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

  const data = products.map((product) => {
    const soldStock = product.transactionItems.reduce(
      (total, item) =>
        total + Number(item.quantity || 0),
      0
    );

    return {
      ...product,
      soldStock,
      transactionItems: undefined,
    };
  });

  return {
    data,
    pagination: {
      page: currentPage,
      limit: currentLimit,
      total,
      totalPages: Math.ceil(total / currentLimit),
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
export async function toggleProductStatus(id, isActive) {
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