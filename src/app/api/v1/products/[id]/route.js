import { NextResponse } from "next/server";

import {
  getProductById,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
} from "@/backend/actions/product.action";

import { formatDate } from "@/shared/utils/formatDate";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import fs from "fs/promises";
import path from "path";

export async function GET(
  request,
  { params }
) {
  try {
    const { id } = await params;

    const productId = Number(id);

    if (Number.isNaN(productId)) {
      return Response.json(
        {
          success: false,
          message:
            "ID produk tidak valid",
        },
        {
          status: 400,
        }
      );
    }

    const product =
      await getProductById(
        productId
      );

    if (!product) {
      return Response.json(
        {
          success: false,
          message:
            "Produk tidak ditemukan",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json({
      success: true,
      data: product,
    });

  } catch (error) {
    console.error(
      "GET PRODUCT ERROR:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "Gagal mengambil data produk",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}


export async function PUT(
  request,
  { params }
) {
  try {
     const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const user = jwt.verify(
      token,
      process.env.JWT_SECRET
    );


    const { id } = await params;

    const productId = Number(id);

    if (Number.isNaN(productId)) {
      return Response.json(
        {
          success: false,
          message:
            "ID produk tidak valid",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * Ambil produk lama
     */
    const existingProduct =
      await getProductById(
        productId
      );

    if (!existingProduct) {
      return Response.json(
        {
          success: false,
          message:
            "Produk tidak ditemukan",
        },
        {
          status: 404,
        }
      );
    }

    /**
     * FormData
     */
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


    // ========================================
    // VALIDASI NAME
    // ========================================

    if (
      !name ||
      !name.trim()
    ) {
      return Response.json(
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


    // ========================================
    // VALIDASI PRICE
    // ========================================

    if (
      price === null ||
      price === ""
    ) {
      return Response.json(
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
      Number.isNaN(
        productPrice
      ) ||
      productPrice < 0
    ) {
      return Response.json(
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


    // ========================================
    // VALIDASI STOCK
    // ========================================

    const productStock =
      stock === "" ||
      stock === null
        ? 0
        : Number(stock);

    if (
      Number.isNaN(
        productStock
      ) ||
      productStock < 0
    ) {
      return Response.json(
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


    // ========================================
    // IMAGE
    // ========================================

    let imagePath =
      existingProduct.image;

    let newImageUploaded =
      false;


    if (
      image &&
      typeof image !== "string" &&
      image.size > 0
    ) {
      // ========================================
      // VALIDASI FORMAT
      // ========================================

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
          {
            status: 400,
          }
        );
      }


      // ========================================
      // VALIDASI SIZE
      // ========================================

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

      newImageUploaded =
        true;
    }

    const product =
      await updateProduct(
        productId,
        {
          name:
            name.trim(),

          price:
            productPrice,

          stock:
            productStock,

          category:
            category?.trim() ||
            null,

          image:
            imagePath,
        }
      );

      console.log(
        "PRODUK YANG DIPERBARUI:",
        product,
      );

      console.log("USER YANG MEMPERBARUI:", {
  id: user.id,
  username: user.username,
  role: user.role,
});


    // ========================================
    // HAPUS GAMBAR LAMA
    // ========================================

    if (
      newImageUploaded &&
      existingProduct.image
    ) {
      try {
        const oldImagePath =
          path.join(
            process.cwd(),
            "public",
            existingProduct.image
          );

        await fs.unlink(
          oldImagePath
        );

      } catch (error) {
        console.warn(
          "GAMBAR LAMA GAGAL DIHAPUS:",
          error.message
        );
      }
    }


    return Response.json(
      {
        success: true,
        message:
          "Produk berhasil diperbarui",
        data: product,
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    console.error(
      "UPDATE PRODUCT ERROR:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "Gagal memperbarui produk",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  request,
  { params }
) {
  try {
    const cookieStore = await cookies();

    const token =
      cookieStore.get("token")?.value;

    if (!token) {
      return Response.json(
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
    const { id } = await params;

    const productId =
      Number(id);

    if (
      Number.isNaN(productId)
    ) {
      return Response.json(
        {
          success: false,
          message:
            "ID produk tidak valid",
        },
        {
          status: 400,
        }
      );
    }

    const product =
      await getProductById(
        productId
      );

      console.log(
        "PRODUK YANG DIHAPUS:",
        product,
      );


    if (!product) {
      return Response.json(
        {
          success: false,
          message:
            "Produk tidak ditemukan",
        },
        {
          status: 404,
        }
      );
    }

    console.log(
  "USER YANG MENGHAPUS:",
  {
    id: user.id,
    username: user.username,
    role: user.role,
  }
);

    await deleteProduct(
      productId
    );



    if (product.image) {
      try {
        const imagePath =
          path.join(
            process.cwd(),
            "public",
            product.image
          );

        await fs.unlink(
          imagePath
        );

      } catch (error) {
        console.warn(
          "GAMBAR PRODUK GAGAL DIHAPUS:",
          error.message
        );
      }
    }


    return Response.json({
      success: true,
      message:
        "Produk berhasil dihapus",
    });

  } catch (error) {
    console.error(
      "DELETE PRODUCT ERROR:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          "Gagal menghapus produk",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(
  request,
  { params }
) {
  try {
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

    const { id } = await params;

    const productId = Number(id);

    if (Number.isNaN(productId)) {
      return NextResponse.json(
        {
          success: false,
          message: "ID produk tidak valid",
        },
        {
          status: 400,
        }
      );
    }

    const { isActive } =
      await request.json();

    if (
      typeof isActive !== "boolean"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Status produk tidak valid",
        },
        {
          status: 400,
        }
      );
    }

    const product =
      await toggleProductStatus(
        productId,
        isActive
      );

    console.log(
      "STATUS PRODUK DIUBAH:",
      {
        id: product.id,
        name: product.name,
        isActive: product.isActive,
        Waktu: formatDate(new Date()),
      }
    );
    console.log(
      "USER YANG MENGUBAH STATUS:", {
        id: user.id,
        username: user.username,
        role: user.role,
        Waktu: formatDate(new Date()),
      }
    );

    return NextResponse.json({
      success: true,
      message: isActive
        ? "Produk berhasil diaktifkan"
        : "Produk berhasil dinonaktifkan",
      data: product,
    });

  } catch (error) {
    console.error(
      "TOGGLE PRODUCT STATUS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Gagal mengubah status produk",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

