import { prisma } from "@/lib/prisma";


// ========================================
// GET PRODUCT BY ID
// ========================================

export async function GET(
  request,
  { params }
) {
  try {
    const { id } = await params;

    const product =
      await prisma.product.findUnique({
        where: {
          id: Number(id),
        },
      });

    if (!product) {
      return Response.json(
        {
          success: false,
          message: "Produk tidak ditemukan",
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


// ========================================
// UPDATE PRODUCT
// ========================================

export async function PUT(
  request,
  { params }
) {
  try {
    const { id } = await params;

    const productId = Number(id);

    if (isNaN(productId)) {
      return Response.json(
        {
          success: false,
          message: "ID produk tidak valid",
        },
        {
          status: 400,
        }
      );
    }

    const body =
      await request.json();

    const {
      name,
      price,
      stock,
      category,
      image,
    } = body;

    if (!name) {
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

    const existingProduct =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },
      });

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

    const product =
      await prisma.product.update({
        where: {
          id: productId,
        },

        data: {
          name: name,
          price: Number(price),
          stock: Number(stock || 0),
          category:
            category || null,
          image:
            image || null,
        },
      });

    return Response.json({
      success: true,
      message:
        "Produk berhasil diperbarui",
      data: product,
    });

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


// ========================================
// DELETE PRODUCT
// ========================================

export async function DELETE(
  request,
  { params }
) {
  try {
    const { id } = await params;

    const productId = Number(id);

    if (isNaN(productId)) {
      return Response.json(
        {
          success: false,
          message: "ID produk tidak valid",
        },
        {
          status: 400,
        }
      );
    }

    const product =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },
      });

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

    await prisma.product.delete({
      where: {
        id: productId,
      },
    });

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