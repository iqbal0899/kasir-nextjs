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

      // =====================================================
      // TAGS
      // =====================================================

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

      // =====================================================
      // COMPONENTS
      // =====================================================

      components: {
        // ===================================================
        // AUTHENTICATION
        // ===================================================

        securitySchemes: {
          cookieAuth: {
            type: "apiKey",
            in: "cookie",
            name: "token",
            description: "JWT authentication menggunakan cookie token",
          },
        },

        // ===================================================
        // SCHEMAS
        // ===================================================

        schemas: {
          // =================================================
          // USER
          // =================================================

          User: {
            type: "object",

            properties: {
              id: {
                type: "integer",
                example: 1,
              },

              username: {
                type: "string",
                example: "admin",
              },

              role: {
                type: "string",
                example: "admin",
              },
            },
          },

          // =================================================
          // PRODUCT
          // =================================================

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

          // =================================================
          // TRANSACTION ITEM
          // =================================================

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

          // =================================================
          // TRANSACTION
          // =================================================

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

              change: {
                type: "number",
                nullable: true,
                example: 3000,
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

          // =================================================
          // ERROR
          // =================================================

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

      // =====================================================
      // API PATHS
      // =====================================================

      paths: {
        // ===================================================
        // AUTHENTICATION
        // ===================================================

        "/api/v1/users/login": {
          post: {
            summary: "Login pengguna",
            description:
              "Melakukan autentikasi pengguna menggunakan username dan password.",

            tags: ["Authentication"],

            requestBody: {
              required: true,

              content: {
                "application/json": {
                  schema: {
                    type: "object",

                    required: [
                      "username",
                      "password",
                    ],

                    properties: {
                      username: {
                        type: "string",
                        example: "admin",
                      },

                      password: {
                        type: "string",
                        format: "password",
                        example: "password123",
                      },
                    },
                  },
                },
              },
            },

            responses: {
              200: {
                description: "Login berhasil",
              },

              400: {
                description: "Request tidak valid",
              },

              401: {
                description:
                  "Username atau password salah",
              },

              429: {
                description:
                  "Terlalu banyak percobaan login",
              },

              500: {
                description: "Internal server error",
              },
            },
          },
        },

        "/api/v1/users/logout": {
          post: {
            summary: "Logout pengguna",
            description:
              "Menghapus session pengguna.",

            tags: ["Authentication"],

            security: [
              {
                cookieAuth: [],
              },
            ],

            responses: {
              200: {
                description: "Logout berhasil",
              },

              401: {
                description:
                  "Tidak terautentikasi",
              },

              500: {
                description:
                  "Internal server error",
              },
            },
          },
        },

        // ===================================================
        // USERS
        // ===================================================

        "/api/v1/users": {
          get: {
            summary: "Mendapatkan daftar pengguna",

            description:
              "API untuk mendapatkan daftar seluruh pengguna.",

            tags: ["Users"],

            security: [
              {
                cookieAuth: [],
              },
            ],

            parameters: [
              {
                name: "page",
                in: "query",

                description:
                  "Nomor halaman",

                required: false,

                schema: {
                  type: "integer",
                  minimum: 1,
                  default: 1,
                },

                example: 1,
              },

              {
                name: "limit",
                in: "query",

                description:
                  "Jumlah data per halaman",

                required: false,

                schema: {
                  type: "integer",
                  minimum: 1,
                  maximum: 100,
                  default: 10,
                },

                example: 10,
              },
            ],

            responses: {
              200: {
                description:
                  "Data pengguna berhasil diambil",

                content: {
                  "application/json": {
                    schema: {
                      type: "object",

                      properties: {
                        success: {
                          type: "boolean",
                          example: true,
                        },

                        data: {
                          type: "array",

                          items: {
                            $ref: "#/components/schemas/User",
                          },
                        },
                      },
                    },
                  },
                },
              },

              401: {
                description:
                  "Tidak terautentikasi",
              },

              403: {
                description:
                  "Tidak memiliki permission",
              },

              500: {
                description:
                  "Internal server error",
              },
            },
          },

          post: {
            summary: "Membuat pengguna",

            description:
              "API untuk membuat pengguna baru.",

            tags: ["Users"],

            security: [
              {
                cookieAuth: [],
              },
            ],

            requestBody: {
              required: true,

              content: {
                "application/json": {
                  schema: {
                    type: "object",

                    required: [
                      "username",
                      "password",
                      "role",
                    ],

                    properties: {
                      username: {
                        type: "string",
                        example: "cashier01",
                      },

                      password: {
                        type: "string",
                        format: "password",
                        example: "password123",
                      },

                      role: {
                        type: "string",
                        example: "cashier",
                      },
                    },
                  },
                },
              },
            },

            responses: {
              201: {
                description:
                  "User berhasil dibuat",
              },

              400: {
                description:
                  "Data user tidak valid",
              },

              401: {
                description:
                  "Tidak terautentikasi",
              },

              403: {
                description:
                  "Tidak memiliki permission",
              },

              409: {
                description:
                  "Username sudah digunakan",
              },

              500: {
                description:
                  "Internal server error",
              },
            },
          },
        },

        "/api/v1/users/{id}": {
          get: {
            summary: "Mendapatkan detail pengguna",

            description:
              "API untuk mendapatkan detail pengguna berdasarkan ID.",

            tags: ["Users"],

            security: [
              {
                cookieAuth: [],
              },
            ],

            parameters: [
              {
                name: "id",
                in: "path",

                description:
                  "ID pengguna",

                required: true,

                schema: {
                  type: "integer",
                },

                example: 1,
              },
            ],

            responses: {
              200: {
                description:
                  "Detail pengguna berhasil diambil",

                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/User",
                    },
                  },
                },
              },

              401: {
                description:
                  "Tidak terautentikasi",
              },

              403: {
                description:
                  "Tidak memiliki permission",
              },

              404: {
                description:
                  "User tidak ditemukan",
              },

              500: {
                description:
                  "Internal server error",
              },
            },
          },

          put: {
            summary: "Mengubah pengguna",

            description:
              "API untuk mengubah data pengguna berdasarkan ID.",

            tags: ["Users"],

            security: [
              {
                cookieAuth: [],
              },
            ],

            parameters: [
              {
                name: "id",
                in: "path",

                description:
                  "ID pengguna",

                required: true,

                schema: {
                  type: "integer",
                },

                example: 1,
              },
            ],

            requestBody: {
              required: true,

              content: {
                "application/json": {
                  schema: {
                    type: "object",

                    properties: {
                      username: {
                        type: "string",
                        example: "admin01",
                      },

                      password: {
                        type: "string",
                        format: "password",
                        example: "newpassword123",
                      },

                      role: {
                        type: "string",
                        example: "admin",
                      },
                    },
                  },
                },
              },
            },

            responses: {
              200: {
                description:
                  "User berhasil diperbarui",
              },

              400: {
                description:
                  "Data tidak valid",
              },

              401: {
                description:
                  "Tidak terautentikasi",
              },

              403: {
                description:
                  "Tidak memiliki permission",
              },

              404: {
                description:
                  "User tidak ditemukan",
              },

              500: {
                description:
                  "Internal server error",
              },
            },
          },

          delete: {
            summary: "Menghapus pengguna",

            description:
              "API untuk menghapus pengguna berdasarkan ID.",

            tags: ["Users"],

            security: [
              {
                cookieAuth: [],
              },
            ],

            parameters: [
              {
                name: "id",
                in: "path",

                description:
                  "ID pengguna",

                required: true,

                schema: {
                  type: "integer",
                },

                example: 1,
              },
            ],

            responses: {
              200: {
                description:
                  "User berhasil dihapus",
              },

              401: {
                description:
                  "Tidak terautentikasi",
              },

              403: {
                description:
                  "Tidak memiliki permission",
              },

              404: {
                description:
                  "User tidak ditemukan",
              },

              500: {
                description:
                  "Internal server error",
              },
            },
          },
        },

        // ===================================================
        // PRODUCTS
        // ===================================================

        "/api/v1/products": {
          get: {
            summary: "Mendapatkan daftar produk",

            description:
              "API untuk mendapatkan daftar produk.",

            tags: ["Products"],

            security: [
              {
                cookieAuth: [],
              },
            ],

            responses: {
              200: {
                description:
                  "Data produk berhasil diambil",
              },

              401: {
                description:
                  "Tidak terautentikasi",
              },

              500: {
                description:
                  "Internal server error",
              },
            },
          },

          post: {
            summary: "Menambahkan produk",

            description:
              "API untuk membuat produk baru.",

            tags: ["Products"],

            security: [
              {
                cookieAuth: [],
              },
            ],

            requestBody: {
              required: true,

              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Product",
                  },
                },
              },
            },

            responses: {
              201: {
                description:
                  "Produk berhasil dibuat",
              },

              400: {
                description:
                  "Data produk tidak valid",
              },

              401: {
                description:
                  "Tidak terautentikasi",
              },

              403: {
                description:
                  "Tidak memiliki permission",
              },

              500: {
                description:
                  "Internal server error",
              },
            },
          },
        },

        "/api/v1/products/{id}": {
          get: {
            summary: "Mendapatkan detail produk",

            tags: ["Products"],

            security: [
              {
                cookieAuth: [],
              },
            ],

            parameters: [
              {
                name: "id",
                in: "path",
                required: true,

                schema: {
                  type: "integer",
                },

                example: 1,
              },
            ],

            responses: {
              200: {
                description:
                  "Detail produk berhasil diambil",
              },

              404: {
                description:
                  "Produk tidak ditemukan",
              },

              500: {
                description:
                  "Internal server error",
              },
            },
          },

          put: {
            summary: "Mengubah produk",

            tags: ["Products"],

            security: [
              {
                cookieAuth: [],
              },
            ],

            parameters: [
              {
                name: "id",
                in: "path",
                required: true,

                schema: {
                  type: "integer",
                },

                example: 1,
              },
            ],

            requestBody: {
              required: true,

              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/Product",
                  },
                },
              },
            },

            responses: {
              200: {
                description:
                  "Produk berhasil diperbarui",
              },

              400: {
                description:
                  "Data tidak valid",
              },

              404: {
                description:
                  "Produk tidak ditemukan",
              },

              500: {
                description:
                  "Internal server error",
              },
            },
          },

          delete: {
            summary: "Menghapus produk",

            tags: ["Products"],

            security: [
              {
                cookieAuth: [],
              },
            ],

            parameters: [
              {
                name: "id",
                in: "path",
                required: true,

                schema: {
                  type: "integer",
                },

                example: 1,
              },
            ],

            responses: {
              200: {
                description:
                  "Produk berhasil dihapus",
              },

              404: {
                description:
                  "Produk tidak ditemukan",
              },

              500: {
                description:
                  "Internal server error",
              },
            },
          },
        },

        "/api/v1/products/{id}/restore": {
          post: {
            summary: "Restore produk",

            description:
              "Mengaktifkan kembali produk yang sebelumnya dinonaktifkan.",

            tags: ["Products"],

            security: [
              {
                cookieAuth: [],
              },
            ],

            parameters: [
              {
                name: "id",
                in: "path",
                required: true,

                schema: {
                  type: "integer",
                },

                example: 1,
              },
            ],

            responses: {
              200: {
                description:
                  "Produk berhasil direstore",
              },

              404: {
                description:
                  "Produk tidak ditemukan",
              },

              500: {
                description:
                  "Internal server error",
              },
            },
          },
        },

        // ===================================================
        // TRANSACTIONS
        // ===================================================

        "/api/v1/transactions": {
          get: {
            summary: "Mendapatkan daftar transaksi",

            description:
              "API untuk mendapatkan daftar transaksi penjualan.",

            tags: ["Transactions"],

            security: [
              {
                cookieAuth: [],
              },
            ],

            responses: {
              200: {
                description:
                  "Data transaksi berhasil diambil",
              },

              401: {
                description:
                  "Tidak terautentikasi",
              },

              500: {
                description:
                  "Internal server error",
              },
            },
          },

          post: {
            summary: "Membuat transaksi",

            description:
              "API untuk membuat transaksi penjualan baru.",

            tags: ["Transactions"],

            security: [
              {
                cookieAuth: [],
              },
            ],

            requestBody: {
              required: true,

              content: {
                "application/json": {
                  schema: {
                    type: "object",

                    required: [
                      "items",
                      "paymentMethod",
                      "cashierId",
                      "idempotencyKey",
                    ],

                    properties: {
                      items: {
                        type: "array",

                        items: {
                          $ref:
                            "#/components/schemas/TransactionItem",
                        },
                      },

                      paymentMethod: {
                        type: "string",

                        enum: [
                          "cash",
                          "qris",
                        ],

                        example: "cash",
                      },

                      cashReceived: {
                        type: "number",
                        nullable: true,
                        example: 10000,
                      },

                      cashierId: {
                        type: "integer",
                        example: 8,
                      },

                      idempotencyKey: {
                        type: "string",
                        format: "uuid",

                        example:
                          "550e8400-e29b-41d4-a716-446655440000",
                      },
                    },
                  },
                },
              },
            },

            responses: {
              201: {
                description:
                  "Transaksi berhasil dibuat",
              },

              400: {
                description:
                  "Data transaksi tidak valid",
              },

              401: {
                description:
                  "Tidak terautentikasi",
              },

              409: {
                description:
                  "Transaksi dengan idempotency key tersebut sudah ada",
              },

              500: {
                description:
                  "Internal server error",
              },
            },
          },
        },

        "/api/v1/transactions/{id}": {
          get: {
            summary: "Mendapatkan detail transaksi",

            tags: ["Transactions"],

            security: [
              {
                cookieAuth: [],
              },
            ],

            parameters: [
              {
                name: "id",
                in: "path",
                required: true,

                schema: {
                  type: "integer",
                },

                example: 100,
              },
            ],

            responses: {
              200: {
                description:
                  "Detail transaksi berhasil diambil",
              },

              404: {
                description:
                  "Transaksi tidak ditemukan",
              },

              500: {
                description:
                  "Internal server error",
              },
            },
          },
        },

        // ===================================================
        // DASHBOARD
        // ===================================================

        "/api/v1/dashboard/analytics": {
          get: {
            summary: "Dashboard analytics",

            description:
              "Mendapatkan data statistik dashboard.",

            tags: ["Dashboard"],

            security: [
              {
                cookieAuth: [],
              },
            ],

            responses: {
              200: {
                description:
                  "Analytics berhasil diambil",
              },

              401: {
                description:
                  "Tidak terautentikasi",
              },

              500: {
                description:
                  "Internal server error",
              },
            },
          },
        },

        "/api/v1/dashboard/monitoring": {
          get: {
            summary: "Dashboard monitoring",

            description:
              "Mendapatkan data monitoring sistem.",

            tags: ["Dashboard"],

            security: [
              {
                cookieAuth: [],
              },
            ],

            responses: {
              200: {
                description:
                  "Data monitoring berhasil diambil",
              },

              401: {
                description:
                  "Tidak terautentikasi",
              },

              403: {
                description:
                  "Tidak memiliki permission",
              },

              500: {
                description:
                  "Internal server error",
              },
            },
          },
        },

        // ===================================================
        // REPORTS
        // ===================================================

        "/api/v1/reports/pdf": {
          get: {
            summary: "Generate laporan PDF",

            description:
              "Menghasilkan laporan dalam format PDF.",

            tags: ["Reports"],

            security: [
              {
                cookieAuth: [],
              },
            ],

            parameters: [
              {
                name: "type",
                in: "query",
                required: true,

                schema: {
                  type: "string",

                  enum: [
                    "all",
                    "product",
                    "transaction",
                  ],
                },

                example: "transaction",
              },

              {
                name: "startDate",
                in: "query",

                schema: {
                  type: "string",
                  format: "date",
                },

                example: "2026-09-01",
              },

              {
                name: "endDate",
                in: "query",

                schema: {
                  type: "string",
                  format: "date",
                },

                example: "2026-09-30",
              },
            ],

            responses: {
              200: {
                description:
                  "PDF berhasil dibuat",

                content: {
                  "application/pdf": {
                    schema: {
                      type: "string",
                      format: "binary",
                    },
                  },
                },
              },

              400: {
                description:
                  "Parameter tidak valid",
              },

              401: {
                description:
                  "Tidak terautentikasi",
              },

              500: {
                description:
                  "Internal server error",
              },
            },
          },
        },

        // ===================================================
        // AUDIT LOGS
        // ===================================================

        "/api/v1/audit-logs": {
          get: {
            summary: "Mendapatkan audit logs",

            description:
              "Mendapatkan riwayat aktivitas pengguna.",

            tags: ["Audit Logs"],

            security: [
              {
                cookieAuth: [],
              },
            ],

            responses: {
              200: {
                description:
                  "Audit logs berhasil diambil",
              },

              401: {
                description:
                  "Tidak terautentikasi",
              },

              403: {
                description:
                  "Tidak memiliki permission",
              },

              500: {
                description:
                  "Internal server error",
              },
            },
          },
        },

        "/api/v1/audit-logs/test": {
          get: {
            summary: "Test audit logs",

            description:
              "Endpoint untuk melakukan pengujian audit log.",

            tags: ["Audit Logs"],

            responses: {
              200: {
                description:
                  "Test berhasil",
              },

              500: {
                description:
                  "Internal server error",
              },
            },
          },
        },
      },
    },
  });

  return spec;
};

