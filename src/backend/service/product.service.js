import { prisma } from "@/lib/prisma";

const INVENTORY_API_URL =
  process.env.INVENTORY_API_URL;

  const transfers = await prisma.inventoryTransfer.findMany({
  select: {
    requestId: true,
    status: true,
    items: {
      select: {
        productId: true,
        quantity: true,
      },
    },
  },
});

console.dir(transfers, { depth: null });

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

  const where = {
    isActive: true,
    inventoryTransfers: {
      some: {
        transfer: {
          status: "COMPLETED",
        },
      },
    },
  };

  if (startDateProduct || endDateProduct) {
    where.createdAt = {};

    if (startDateProduct) {
      const startDate = new Date(startDateProduct);

      if (Number.isNaN(startDate.getTime())) {
        throw new Error("Tanggal awal tidak valid");
      }

      where.createdAt.gte = startDate;
    }

    if (endDateProduct) {
      const endDate = new Date(endDateProduct);

      if (Number.isNaN(endDate.getTime())) {
        throw new Error("Tanggal akhir tidak valid");
      }

      endDate.setHours(23, 59, 59, 999);
      where.createdAt.lte = endDate;
    }
  }

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      skip: (currentPage - 1) * currentLimit,
      take: currentLimit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        inventoryMappings: {
          select: {
            inventoryCode: true,
          },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const [totalProducts, completedTransfers] = await Promise.all([
  prisma.product.count(),
  prisma.inventoryTransfer.findMany({
    select: {
      requestId: true,
      status: true,
      items: {
        select: {
          productId: true,
          quantity: true,
        },
      },
    },
  }),
]);

console.log("TOTAL PRODUK POS:", totalProducts);
console.dir(completedTransfers, { depth: null });

  const data = products.map((product) => ({
    id: product.id,
    inventoryCode:
      product.inventoryMappings[0]?.inventoryCode || null,
    name: product.name,
    price: Number(product.price),
    stock: product.stock,
    category: product.category || null,
    image: product.image || null,
    isActive: product.isActive,
    status: "ACTIVE",
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    soldStock: 0,
  }));

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
  if (!INVENTORY_API_URL) {
    throw new Error(
      "INVENTORY_API_URL belum dikonfigurasi"
    );
  }

  const response = await fetch(
    `${INVENTORY_API_URL}/api/v1/products/${id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const errorText =
      await response.text();

    throw new Error(
      `Produk tidak ditemukan di inventory-system: ${response.status} ${errorText}`
    );
  }

  const result =
    await response.json();

  if (!result.success) {
    throw new Error(
      result.message ||
        "Gagal mengambil produk"
    );
  }

  return result.data;
}

export async function createProduct() {
  throw new Error(
    "Produk harus dibuat melalui inventory-system"
  );
}

export async function updateProduct() {
  throw new Error(
    "Produk harus diperbarui melalui inventory-system"
  );
}

export async function toggleProductStatus() {
  throw new Error(
    "Status produk harus diperbarui melalui inventory-system"
  );
}

export async function deleteProduct() {
  throw new Error(
    "Produk harus dihapus melalui inventory-system"
  );
}

export async function restoreProduct() {
  throw new Error(
    "Produk harus direstore melalui inventory-system"
  );
}