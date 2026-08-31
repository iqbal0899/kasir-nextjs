import { prisma } from "@/lib/prisma";

// ========================================
// GET ALL PRODUCTS
// ========================================

export async function getProducts() {
  return await prisma.product.findMany({
    orderBy: {
      id: "asc",
    },
  });
}

// ========================================
// GET PRODUCT BY ID
// ========================================

export async function getProductById(id) {
  return await prisma.product.findUnique({
    where: {
      id: Number(id),
    },
  });
}

// ========================================
// CREATE PRODUCT
// ========================================

export async function createProduct(data) {
  return await prisma.product.create({
    data: {
      name: data.name,
      price: data.price,
      stock: data.stock,
      category: data.category,
      image: data.image,
    },
  });
}

// ========================================
// UPDATE PRODUCT
// ========================================

export async function updateProduct(id, data) {
  return await prisma.product.update({
    where: {
      id: Number(id),
    },
    data,
  });
}

// ========================================
// DELETE PRODUCT
// ========================================

export async function deleteProduct(id) {
  return await prisma.product.delete({
    where: {
      id: Number(id),
    },
  });
}