import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";

import {
  getProducts,
  createProduct,
} from "@/backend/service/product.service";

import { createAuditLog } from "@/backend/service/audit.service";
import { getClientIp } from "@/backend/utils/getClientIp";


// =====================================================
// GET PRODUCTS
// =====================================================

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(
      Number(searchParams.get("page")) || 1,
      1
    );

    const limit = Math.max(
      Number(searchParams.get("limit")) || 10,
      1
    );

    const result = await getProducts({
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });

  } catch (error) {
    console.error(
      "GET PRODUCTS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Gagal mengambil data produk",
      },
      {
        status: 500,
      }
    );
  }
}


// =====================================================
// POST CREATE PRODUCT
// =====================================================

export async function POST(request) {
  try {

    // =================================================
    // AUTHENTICATION
    // =================================================

    const cookieStore = await cookies();

    const token =
      cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const user = jwt.verify(
      token,
      process.env.JWT_SECRET
    );


    // =================================================
    // AUTHORIZATION
    // =================================================

    if (user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Hanya admin yang dapat menambahkan produk",
        },
        {
          status: 403,
        }
      );
    }


    // =================================================
    // FORM DATA
    // =================================================

    const formData =
      await request.formData();

    const name =
      formData.get("name");

    const price =
      formData.get("price");

    const stock =
      formData.get("stock");

    const category =
      formData.get("category");

    const image =
      formData.get("image");


    // =================================================
    // VALIDASI NAMA
    // =================================================

    if (
      !name ||
      !String(name).trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Nama produk wajib diisi",
        },
        {
          status: 400,
        }
      );
    }


    // =================================================
    // VALIDASI HARGA
    // =================================================

    if (
      price === null ||
      price === ""
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Harga produk wajib diisi",
        },
        {
          status: 400,
        }
      );
    }

    const productPrice =
      Number(price);

    if (
      Number.isNaN(productPrice) ||
      productPrice < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Harga tidak valid",
        },
        {
          status: 400,
        }
      );
    }


    // =================================================
    // VALIDASI STOCK
    // =================================================

    const productStock =
      stock === null ||
      stock === ""
        ? 0
        : Number(stock);

    if (
      Number.isNaN(productStock) ||
      productStock < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Stock tidak valid",
        },
        {
          status: 400,
        }
      );
    }


    // =================================================
    // UPLOAD IMAGE
    // =================================================

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
        return NextResponse.json(
          {
            success: false,
            message:
              "Format gambar harus JPG, PNG, atau WEBP",
          },
          {
            status: 400,
          }
        );
      }

      if (
        image.size >
        2 * 1024 * 1024
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Ukuran gambar maksimal 2 MB",
          },
          {
            status: 400,
          }
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


    // =================================================
    // CREATE PRODUCT
    // =================================================

    const product =
      await createProduct({
        name:
          String(name).trim(),

        price:
          productPrice,

        stock:
          productStock,

        category:
          category
            ? String(category).trim()
            : null,

        image:
          imagePath,
      });


    // =================================================
    // CONSOLE LOG
    // =================================================

    console.log(
      "PRODUK YANG DIBUAT:",
      {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        stock: Number(product.stock),
        category: product.category,
        image: product.image,
      }
    );


    console.log(
      "USER YANG MEMBUAT:",
      {
        id: user.id,
        username: user.username,
        role: user.role,
      }
    );


    // =================================================
    // AUDIT LOG
    // =================================================

    try {
      await createAuditLog({
        userId: user.id,
        username: user.username,
        role: user.role,

        action: "CREATE_PRODUCT",

        entity: "Product",

        entityId: product.id,

        details: {
          name: product.name,
          price: Number(product.price),
          stock: Number(product.stock),
          category: product.category,
          image: product.image,
        },

        ipAddress:
          getClientIp(request),

        userAgent:
          request.headers.get(
            "user-agent"
          ) || null,
      });

    } catch (auditError) {
      console.error(
        "AUDIT LOG ERROR:",
        auditError
      );
    }


    // =================================================
    // RESPONSE
    // =================================================

    return NextResponse.json(
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

    return NextResponse.json(
      {
        success: false,
        message:
          "Gagal menambahkan produk",
        error:
          error.message,
      },
      {
        status: 500,
      }
    );
  }
}

