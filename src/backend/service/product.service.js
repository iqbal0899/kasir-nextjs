import { prisma } from "@/lib/prisma";

export async function getProducts() {
  return await prisma.product.findMany({
    orderBy: {
      id: "asc",
    },
  });
}

export async function getActiveProducts() {
  return await prisma.product.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      id: "asc",
    },
  });
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