import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export async function POST(request) {
  try {
    const formData = await request.formData();

    const name = formData.get("name");
    const price = formData.get("price");
    const stock = formData.get("stock");
    const category = formData.get("category");
    const image = formData.get("image");

    // =========================
    // VALIDASI
    // =========================

    if (!name || !name.trim()) {
      return Response.json(
        {
          success: false,
          message: "Nama produk wajib diisi",
        },
        { status: 400 }
      );
    }

    if (!price) {
      return Response.json(
        {
          success: false,
          message: "Harga produk wajib diisi",
        },
        { status: 400 }
      );
    }

    const productPrice = Number(price);

    const productStock =
      stock === ""
        ? 0
        : Number(stock);

    if (
      Number.isNaN(productPrice) ||
      productPrice < 0
    ) {
      return Response.json(
        {
          success: false,
          message: "Harga tidak valid",
        },
        { status: 400 }
      );
    }

    if (
      Number.isNaN(productStock) ||
      productStock < 0
    ) {
      return Response.json(
        {
          success: false,
          message: "Stock tidak valid",
        },
        { status: 400 }
      );
    }

    // =========================
    // UPLOAD IMAGE
    // =========================

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

      if (
        !allowedTypes.includes(
          image.type
        )
      ) {
        return Response.json(
          {
            success: false,
            message:
              "Format gambar harus JPG, PNG, atau WEBP",
          },
          { status: 400 }
        );
      }

      if (
        image.size >
        2 * 1024 * 1024
      ) {
        return Response.json(
          {
            success: false,
            message:
              "Ukuran gambar maksimal 2 MB",
          },
          { status: 400 }
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

    // =========================
    // DATABASE
    // =========================

    const product =
      await prisma.product.create({
        data: {
          name: name.trim(),

          price: productPrice,

          stock: productStock,

          category:
            category?.trim() || null,

          image: imagePath,
        },
      });

    return Response.json(
      {
        success: true,
        message:
          "Produk berhasil ditambahkan",
        data: product,
      },
      {
        status: 201,
      }
    );

  } catch (error) {
    console.error(
      "CREATE PRODUCT ERROR:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "Gagal menambahkan produk",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        id: "asc",
      },
    });

    return Response.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Gagal mengambil data produk",
      },
      {
        status: 500,
      }
    );
  }
}