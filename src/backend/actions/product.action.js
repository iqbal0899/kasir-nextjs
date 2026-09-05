  import { prisma } from "@/lib/prisma";
  import fs from "fs/promises";
  import path from "path";

  export async function getProducts() {
  return await prisma.product.findMany({
    orderBy: {
      id: "asc",
    },
  });
}

export async function getInactiveProducts() {
  return await prisma.product.findMany({
    where: {
      isActive: false,
    },
    orderBy: {
      id: "asc",
    },
  });
}

export async function restoreProduct(id) {
  return await prisma.product.update({
    where: {
      id: Number(id),
    },
    data: {
      isActive: true,
    },
  });
}

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


  export async function createProduct({
  name,
  price,
  stock,
  category,
  image,
}) {
  const productName = name.trim();


  const existingProduct = await prisma.product.findUnique({
    where: {
      name: productName,
    },
  });

  if (existingProduct && !existingProduct.isActive) {
    return await prisma.product.update({
      where: {
        id: existingProduct.id,
      },
      data: {
        isActive: true,
        price: Number(price),
        stock: Number(stock || 0),
        category: category?.trim() || null,
        // image akan kita tangani setelah solusi storage
      },
    });
  }

  if (existingProduct && existingProduct.isActive) {
    throw new Error(
      "Product dengan nama tersebut sudah tersedia"
    );
  }

  let imagePath = null;

  if (
    image &&
    typeof image !== "string" &&
    image.size > 0
  ) {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(image.type)) {
      throw new Error(
        "Format gambar harus JPG, PNG, atau WEBP"
      );
    }

    if (image.size > 2 * 1024 * 1024) {
      throw new Error(
        "Ukuran gambar maksimal 2 MB"
      );
    }
  }

  return await prisma.product.create({
    data: {
      name: productName,
      price: Number(price),
      stock: Number(stock || 0),
      category: category?.trim() || null,
      image: imagePath,
      isActive: true,
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

  export async function updateProduct(
    id,
    data
  ) {
    return await prisma.product.update({
      where: {
        id: Number(id),
      },

      data: {
        name: data.name,
        price: Number(data.price),
        stock: Number(data.stock || 0),
        category:
          data.category || null,
        image:
          data.image ?? undefined,
      },
    });
  }

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