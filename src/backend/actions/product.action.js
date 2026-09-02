  import { prisma } from "@/lib/prisma";
  import fs from "fs/promises";
  import path from "path";

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


  export async function createProduct({
    name,
    price,
    stock,
    category,
    image,
  }) {
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

      const bytes =
        await image.arrayBuffer();

      const buffer =
        Buffer.from(bytes);

      const extension =
        image.name
          .split(".")
          .pop()
          .toLowerCase();

      const fileName =
        `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${extension}`;

      const uploadDir =
        path.join(
          process.cwd(),
          "public",
          "products"
        );

      await fs.mkdir(
        uploadDir,
        {
          recursive: true,
        }
      );

      const filePath =
        path.join(
          uploadDir,
          fileName
        );

      await fs.writeFile(
        filePath,
        buffer
      );

      imagePath =
        `/products/${fileName}`;
    }

    return await prisma.product.create({
      data: {
        name: name.trim(),

        price,

        stock,

        category:
          category?.trim() || null,

        image: imagePath,
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