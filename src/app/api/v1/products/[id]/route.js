import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import {
  getProductById,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
} from "@/backend/actions/product.action";

import { createAuditLog } from "@/backend/service/audit.service";
import { getClientIp } from "@/backend/utils/getClientIp";

export async function GET(request, { params }) {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Token tidak valid atau sudah expired",
        },
        { status: 401 }
      );
    }

    const { id } = await params;
    const productId = Number(id);

    if (
      Number.isNaN(productId) ||
      productId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "ID product tidak valid",
        },
        { status: 400 }
      );
    }

    const product =
      await getProductById(productId);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Produk tidak ditemukan",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        price: Number(product.price),
        stock: Number(product.stock || 0),
      },
    });
  } catch (error) {
    console.error(
      "GET PRODUCT BY ID ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Gagal mengambil produk",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    let user;

    try {
      user = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            "Token tidak valid atau sudah expired",
        },
        { status: 401 }
      );
    }

    if (!["admin", "super_admin"].includes(user.role)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Hanya admin yang dapat mengubah produk",
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const productId = Number(id);

    if (
      Number.isNaN(productId) ||
      productId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "ID product tidak valid",
        },
        { status: 400 }
      );
    }

    const contentType =
      request.headers.get("content-type") || "";


    if (
      contentType.includes("application/json")
    ) {
      const body = await request.json();

      if (
        typeof body.isActive === "boolean"
      ) {
        const product =
          await toggleProductStatus(
            productId,
            body.isActive
          );

console.log(
  "STATUS PRODUK DIUBAH:",
  {
    id: product.id,
    name: product.name,
    isActive: product.isActive,
    Waktu: new Date().toISOString(),
  }
);

console.log(
  "USER YANG MENGUBAH STATUS:",
  {
    id: user.id,
    username: user.username,
    role: user.role,
    Waktu: new Date().toISOString(),
  }
);

        await createAuditLog({
          userId: user.id,
          username: user.username,
          role: user.role,
          action: body.isActive
            ? "ACTIVATE_PRODUCT"
            : "DEACTIVATE_PRODUCT",
          entity: "Product",
          entityId: product.id,
          details: {
            name: product.name,
            isActive: product.isActive,
          },
          ipAddress:
            getClientIp(request),
          userAgent:
            request.headers.get(
              "user-agent"
            ) || null,
        });

        return NextResponse.json({
          success: true,
          message: body.isActive
            ? "Produk berhasil diaktifkan"
            : "Produk berhasil dinonaktifkan",
          data: product,
        });
      }

      return NextResponse.json(
        {
          success: false,
          message: "Data JSON tidak valid",
        },
        { status: 400 }
      );
    }

    if (
      contentType.includes(
        "multipart/form-data"
      )
    ) {
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

      /*
       * image saat ini hanya dibaca.
       *
       * Kalau belum menggunakan Cloudinary /
       * Vercel Blob / storage lain, jangan
       * masukkan File langsung ke Prisma.
       */
      const image =
        formData.get("image");

      if (
        typeof name !== "string" ||
        !name.trim()
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Nama produk wajib diisi",
          },
          { status: 400 }
        );
      }

      const numericPrice =
        Number(price);

      const numericStock =
        Number(stock);

      if (
        Number.isNaN(numericPrice) ||
        numericPrice < 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Harga produk tidak valid",
          },
          { status: 400 }
        );
      }

      if (
        Number.isNaN(numericStock) ||
        numericStock < 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Stock produk tidak valid",
          },
          { status: 400 }
        );
      }

      const updateData = {
        name: name.trim(),
        price: numericPrice,
        stock: numericStock,
        category:
          typeof category === "string"
            ? category.trim()
            : null,
      };

      const product =
        await updateProduct(
          productId,
          updateData
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

      await createAuditLog({
        userId: user.id,
        username: user.username,
        role: user.role,
        action: "UPDATE_PRODUCT",
        entity: "Product",
        entityId: product.id,
        details: {
          name: product.name,
          price: Number(product.price),
          stock: product.stock,
          category: product.category,
          isActive: product.isActive,
          imageUploaded:
            image instanceof File,
        },
        ipAddress:
          getClientIp(request),
        userAgent:
          request.headers.get(
            "user-agent"
          ) || null,
      });

      return NextResponse.json({
        success: true,
        message:
          "Produk berhasil diperbarui",
        data: {
          ...product,
          price: Number(product.price),
        },
      });
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Content-Type request tidak didukung",
      },
      { status: 415 }
    );
  } catch (error) {
    console.error(
      "PATCH PRODUCT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Gagal memperbarui produk",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request,
  { params }
) {
  try {

    const cookieStore =
      await cookies();

    const token =
      cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    let user;

    try {
      user = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Token tidak valid atau sudah expired",
        },
        { status: 401 }
      );
    }

    if (!["admin", "super_admin"].includes(user.role)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Hanya admin yang dapat menghapus produk",
        },
        { status: 403 }
      );
    }

    const { id } = await params;

    const productId = Number(id);

    if (
      Number.isNaN(productId) ||
      productId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "ID product tidak valid",
        },
        { status: 400 }
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


    const product =
      await deleteProduct(
        productId
      );

    await createAuditLog({
      userId: user.id,
      username: user.username,
      role: user.role,

      action: "DELETE_PRODUCT",

      entity: "Product",

      entityId: product.id,

      details: {
        name: product.name,
        price: Number(product.price),
        stock: Number(product.stock),
        category: product.category,
        isActive: product.isActive,

        message:
          "Produk berhasil dinonaktifkan",
      },

      ipAddress:
        getClientIp(request),

      userAgent:
        request.headers.get(
          "user-agent"
        ) || null,
    });

    return NextResponse.json({
      success: true,

      message:
        "Produk berhasil dinonaktifkan",

      data: {
        ...product,
        price: Number(product.price),
        stock: Number(product.stock || 0),
      },
    });
  } catch (error) {
    console.error(
      "DELETE PRODUCT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Gagal menghapus produk",
      },
      { status: 500 }
    );
  }
}

