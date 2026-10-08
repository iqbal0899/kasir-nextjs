const INVENTORY_API_URL =
  process.env.INVENTORY_API_URL;

export async function getProducts({
  page = 1,
  limit = 10,
} = {}) {
  if (!INVENTORY_API_URL) {
    throw new Error(
      "INVENTORY_API_URL belum dikonfigurasi"
    );
  }

  const response = await fetch(
    `${INVENTORY_API_URL}/api/v1/products`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Gagal mengambil produk dari inventory-system: ${response.status} ${errorText}`
    );
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(
      result.message ||
        "Gagal mengambil produk dari inventory-system"
    );
  }

  const products = Array.isArray(result.data)
    ? result.data
    : [];

  const currentPage = Math.max(
    Number(page) || 1,
    1
  );

  const currentLimit = Math.min(
    Math.max(Number(limit) || 10, 1),
    100
  );

  const total = products.length;

  const start =
    (currentPage - 1) * currentLimit;

  const end =
    start + currentLimit;

  const paginatedProducts =
    products.slice(start, end);

  const data = paginatedProducts.map(
    (product) => ({
      id: product.id,

      inventoryCode:
        product.code ||
        product.inventoryCode ||
        null,

      name: product.name,

      price: Number(
        product.price || 0
      ),

      stock: Number(
        product.stock || 0
      ),

      category:
        product.category?.name ||
        product.category ||
        null,

      image:
        product.image || null,

      isActive:
        product.isActive ??
        product.status === "ACTIVE",

      status:
        product.status || null,

      unit:
        product.unit || "pcs",

      createdAt:
        product.createdAt || null,

      updatedAt:
        product.updatedAt || null,

      soldStock: 0,
    })
  );

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