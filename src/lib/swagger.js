import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = () => {
  const spec = createSwaggerSpec({
    apiFolder: "src/app/api",
    autoDoc: true,

    definition: {
      openapi: "3.0.0",

      info: {
        title: "Toko Iqbal API",
        version: "1.0.0",
        description: "REST API untuk aplikasi POS Toko Iqbal",
      },

      servers: [
        {
          url: "http://localhost:5000",
          description: "Development server",
        },
      ],

      tags: [
        {
          name: "Authentication",
          description: "API untuk autentikasi pengguna",
        },
        {
          name: "Products",
          description: "API untuk mengelola produk",
        },
        {
          name: "Transactions",
          description: "API transaksi penjualan",
        },
        {
          name: "Users",
          description: "API manajemen pengguna",
        },
        {
          name: "Dashboard",
          description: "API dashboard dan analytics",
        },
        {
          name: "Reports",
          description: "API laporan",
        },
        {
          name: "Audit Logs",
          description: "API audit log",
        },
      ],

      components: {
        securitySchemes: {
          cookieAuth: {
            type: "apiKey",
            in: "cookie",
            name: "token",
          },
        },

        schemas: {
          Product: {
            type: "object",

            properties: {
              id: {
                type: "integer",
                example: 1,
              },

              name: {
                type: "string",
                example: "Indomie Goreng",
              },

              price: {
                type: "number",
                format: "decimal",
                example: 3500,
              },

              stock: {
                type: "integer",
                example: 50,
              },

              category: {
                type: "string",
                nullable: true,
                example: "Makanan",
              },

              image: {
                type: "string",
                nullable: true,
                example: "/uploads/indomie.jpg",
              },

              isActive: {
                type: "boolean",
                example: true,
              },
            },
          },

          TransactionItem: {
            type: "object",

            required: [
              "productId",
              "quantity",
              "price",
            ],

            properties: {
              productId: {
                type: "integer",
                example: 1,
              },

              quantity: {
                type: "integer",
                minimum: 1,
                example: 2,
              },

              price: {
                type: "number",
                example: 3500,
              },
            },
          },

          Transaction: {
            type: "object",

            properties: {
              id: {
                type: "integer",
                example: 100,
              },

              totalAmount: {
                type: "number",
                example: 7000,
              },

              cashReceived: {
                type: "number",
                nullable: true,
                example: 10000,
              },

              paymentMethod: {
                type: "string",
                enum: ["cash", "qris"],
                example: "cash",
              },

              cashierId: {
                type: "integer",
                example: 8,
              },

              idempotencyKey: {
                type: "string",
                example:
                  "550e8400-e29b-41d4-a716-446655440000",
              },
            },
          },

          Error: {
            type: "object",

            properties: {
              success: {
                type: "boolean",
                example: false,
              },

              message: {
                type: "string",
                example: "Terjadi kesalahan",
              },
            },
          },
        },
      },
    },
  });

  return spec;
};