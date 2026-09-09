This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

Product
# 🛒 POS Kasir — Point of Sale Management System

Aplikasi **Point of Sale (POS)** berbasis web yang digunakan untuk membantu proses transaksi penjualan, pengelolaan produk, stok, pengguna, dan laporan penjualan.

Project ini dikembangkan menggunakan **Next.js** dengan arsitektur full-stack, sehingga frontend dan backend berada dalam satu aplikasi.

---

## Features

### Authentication & Authorization

* Login dan logout pengguna
* Authentication menggunakan JWT
* Role-based access control
* Role **Admin** dan **Cashier**
* Protected dashboard dan API endpoint

### Product Management

* Menampilkan daftar produk
* Menambahkan produk
* Mengubah data produk
* Menghapus produk
* Pengelolaan harga dan stok
* Kategori produk
* Dukungan gambar produk

### Point of Sale

* Menampilkan produk untuk transaksi
* Menambahkan produk ke keranjang
* Mengatur quantity produk
* Perhitungan subtotal otomatis
* Perhitungan total transaksi
* Input pembayaran pelanggan
* Perhitungan kembalian
* Pemilihan metode pembayaran

### Transaction Management

* Membuat transaksi
* Menampilkan riwayat transaksi
* Melihat detail transaksi
* Menyimpan informasi kasir
* Menyimpan detail produk yang dibeli
* Update stok setelah transaksi

### Reports

* Laporan produk
* Laporan transaksi
* Ringkasan data penjualan
* Export laporan dalam format PDF

### 👥 User Management

* Menampilkan daftar pengguna
* Menambahkan pengguna
* Mengubah role pengguna
* Menghapus pengguna
* Pengelolaan role Admin dan Cashier

### 📱 Responsive UI

* Responsive untuk desktop
* Responsive untuk tablet
* Responsive untuk smartphone
* Sidebar navigation
* Dashboard layout

---

## 🛠️ Tech Stack

### Frontend

* **Next.js**
* **React.js**
* **CSS Modules**
* **Lucide React**
* **SweetAlert2**
* **React Toastify**

### Backend

* **Next.js API Routes**
* **Node.js**
* **Prisma ORM**
* **JWT**
* **bcrypt**

### Database

* **PostgreSQL**
* **Neon PostgreSQL**

### Tools

* **Git**
* **GitHub**
* **VS Code**
* **Postman**
* **Prisma Studio**

---

## Architecture

Project menggunakan pendekatan full-stack menggunakan Next.js.

```text
┌─────────────────────────────┐
│          Frontend           │
│                             │
│  React + Next.js            │
│  CSS Modules                │
│  POS / Dashboard / Reports  │
└──────────────┬──────────────┘
               │
               │ HTTP Request
               ▼
┌─────────────────────────────┐
│          Backend            │
│                             │
│  Next.js API Routes         │
│  Authentication             │
│  Authorization              │
│  Business Logic             │
└──────────────┬──────────────┘
               │
               │ Prisma ORM
               ▼
┌─────────────────────────────┐
│          Database           │
│                             │
│     PostgreSQL / Neon       │
└─────────────────────────────┘
```

---

## Project Structure

```text
src/
│
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── users/
│   │       ├── products/
│   │       ├── transactions/
│   │       └── reports/
│   │
│   ├── auth/
│   │   └── login/
│   │
│   ├── dashboard/
│   │   ├── products/
│   │   ├── transactions/
│   │   ├── users/
│   │   ├── reports/
│   │   └── layout.jsx
│   │
│   └── pos/
│       └── pos/
│
├── backend/
│   ├── service/
│   │   ├── auth.service.js
│   │   ├── product.service.js
│   │   └── transaction.service.js
│   │
│   └── utils/
│       └── pdfGenerator.js
│
├── frontend/
│   ├── components/
│   │   ├── Sidebar/
│   │   ├── Navbar/
│   │   ├── ProductGrid/
│   │   ├── CartSidebar/
│   │   ├── PaymentModal/
│   │   └── ReceiptModal/
│   │
│   └── services/
│       ├── authApi.js
│       └── transactionApi.js
│
└── shared/
    └── utils/
        └── formatCurrency.js

prisma/
└── schema.prisma

public/
└── images/
```

---

## Authentication Flow

Authentication menggunakan JWT.

```text
User
 │
 │ Login
 ▼
Login API
 │
 ├── Validate username
 ├── Validate password
 └── Generate JWT
 │
 ▼
Authentication Cookie
 │
 ▼
Protected API
 │
 ├── Verify JWT
 └── Check User Role
 │
 ▼
Allow / Reject Request
```

Role yang tersedia:

| Role    | Access                   |
| ------- | ------------------------ |
| Admin   | Full management access   |
| Cashier | POS & transaction access |

---

## Transaction Flow

Proses transaksi:

```text
Select Product
      ↓
Add to Cart
      ↓
Set Quantity
      ↓
Calculate Subtotal
      ↓
Calculate Total
      ↓
Payment
      ↓
Calculate Change
      ↓
Create Transaction
      ↓
Create Transaction Items
      ↓
Update Product Stock
      ↓
Transaction Completed
```

Perhitungan transaksi dilakukan berdasarkan data produk yang tersimpan di database.

```text
Subtotal = Product Price × Quantity

Total = Σ Subtotal

Change = Cash Received - Total
```

---

## Database

Database menggunakan **PostgreSQL** dengan Prisma ORM.

Model utama:

```text
User
 │
 └── Transaction
        │
        └── TransactionItem
                │
                └── Product
```

### User

Menyimpan data pengguna aplikasi.

```text
id
username
password
role
createdAt
```

### Product

Menyimpan data produk.

```text
id
name
price
stock
category
image
createdAt
updatedAt
```

### Transaction

Menyimpan data transaksi.

```text
id
total
paymentMethod
cashReceived
change
cashierId
createdAt
```

### TransactionItem

Menyimpan detail produk pada setiap transaksi.

```text
id
transactionId
productId
quantity
price
subtotal
```

---

##  Installation

### 1. Clone Repository

```bash
git clone https://github.com/username/pos-kasir.git
```

Masuk ke directory project:

```bash
cd pos-kasir
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Buat file:

```text
.env
```

Kemudian masukkan konfigurasi:

```env
DATABASE_URL="your_postgresql_database_url"

JWT_SECRET="your_secret_key"

JWT_EXPIRES_IN="1d"
```


### 4. Setup Prisma

Generate Prisma Client:

```bash
npx prisma generate
```

Jalankan migration:

```bash
npx prisma migrate dev
```

### 5. Jalankan Development Server

```bash
npm run dev
```

Aplikasi dapat diakses melalui:

```text
http://localhost:3000
```

---

## API

Beberapa endpoint utama:

### Authentication

```text
POST /api/v1/users/login
POST /api/v1/users/register
POST /api/v1/users/logout
```

### Products

```text
GET    /api/v1/products
POST   /api/v1/products
PATCH  /api/v1/products/:id
DELETE /api/v1/products/:id
```

### Users

```text
GET    /api/v1/users
POST   /api/v1/users
PATCH  /api/v1/users/:id
DELETE /api/v1/users/:id
```

### Transactions

```text
GET  /api/v1/transactions
POST /api/v1/transactions
GET  /api/v1/transactions/:id
```

### Reports

```text
GET /api/v1/reports/pdf
```

---

##  Security

Beberapa mekanisme keamanan yang diterapkan:

* JWT authentication
* Password hashing menggunakan bcrypt
* Role-based authorization
* Protected API endpoints
* Server-side validation
* Database validation menggunakan Prisma
* Transaction database menggunakan Prisma transaction
* Validasi stok sebelum transaksi
* Perhitungan total transaksi di server
* Database menggunakan PostgreSQL

### Important

Data penting seperti:

* harga produk
* total transaksi
* stok
* cashier ID
* subtotal

sebaiknya tidak dipercaya langsung dari client.

Server harus melakukan validasi dan perhitungan ulang sebelum menyimpan transaksi.

---

##  PDF Reports

Aplikasi menyediakan fitur untuk membuat laporan dalam format PDF menggunakan **PDFKit**.

Jenis laporan meliputi:

* Product Report
* Transaction Report
* Combined Report

Contoh penggunaan:

```text
Reports
   ↓
Select Report
   ↓
Generate PDF
   ↓
PDF Report
```

---

## Development

Menjalankan development server:

```bash
npm run dev
```

Build production:

```bash
npm run build
```

Menjalankan production:

```bash
npm start
```

---

## Future Improvements

Beberapa fitur yang dapat dikembangkan:

* [ ] Dashboard analytics
* [ ] Grafik penjualan
* [V] Filter laporan berdasarkan tanggal
* [ ] Export Excel
* [V] Print receipt thermal printer
* [ ] Barcode scanner
* [ ] Product search
* [V] Pagination
* [V] Rate limiting
* [ ] Idempotency untuk mencegah double transaction
* [ ] Audit log
* [ ] WebSocket untuk real-time stock
* [ ] Dark mode
* [ ] Progressive Web App (PWA)

---

## Project Goals

Project ini dibuat untuk mengimplementasikan konsep **Full-Stack Web Development**, termasuk:

* Frontend development
* Backend API development
* Database design
* Authentication
* Authorization
* REST API
* ORM
* Transaction management
* State management
* Responsive UI
* Report generation
* Deployment

---

## Developer

**Muhammad Iqbal**

Full-Stack Web Developer

Skills:

```text
Next.js
React.js
Node.js
Prisma
PostgreSQL
JavaScript
REST API
JWT
Git
GitHub
```

---

## License

This project is developed for learning, portfolio, and educational purposes.