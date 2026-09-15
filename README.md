# 🛒 POS Kasir — Toko Iqbal

Aplikasi **Point of Sale (POS)** berbasis web untuk membantu pengelolaan penjualan, produk, stok, pengguna, transaksi, dashboard analytics, dan laporan.

Project ini dibangun menggunakan **Next.js App Router** dengan pendekatan full-stack, sehingga frontend dan backend API berada dalam satu aplikasi.

---

## 📌 Overview

**POS Kasir — Toko Iqbal** menyediakan sistem kasir dengan fitur:

* 🔐 Authentication & Authorization
* 👥 Role-based Access Control
* 📦 Product Management
* 🛒 Point of Sale
* 💳 Multiple Payment Methods
* 📊 Dashboard Analytics
* 🧾 Transaction Management
* 📄 PDF Reports
* 🔍 Product Search
* 📑 Pagination
* 🛡️ Rate Limiting
* 🔑 JWT Authentication
* 📝 Audit Log
* 🔄 Idempotency untuk mencegah transaksi ganda
* ⚡ Real-time update menggunakan Pusher
* 📱 Responsive UI
* 📲 Progressive Web App (PWA)
* 🧮 Server-side transaction calculation

---

# ✨ Features

## 🔐 Authentication & Authorization

Sistem authentication menggunakan JWT.

Features:

* Login
* Logout
* JWT Authentication
* HTTP Cookie Authentication
* Password hashing menggunakan bcrypt
* Role-based authorization
* Protected API endpoint
* Protected dashboard
* Admin role
* Cashier role
* Automatic session expiration
* Rate limiting pada login
* reCAPTCHA protection

### Role

| Role    | Access                   |
| ------- | ------------------------ |
| Admin   | Full management access   |
| Cashier | POS & transaction access |

---

# 👥 User Management

Admin dapat mengelola pengguna aplikasi.

Features:

* Menampilkan user
* Membuat user
* Mengubah user
* Mengubah role
* Menghapus user
* Password hashing
* Role management
* Audit log aktivitas user

---

# 📦 Product Management

Admin dapat mengelola seluruh data produk.

Features:

* Tambah produk
* Edit produk
* Hapus produk
* Restore produk
* Soft delete
* Product search
* Pagination
* Kategori produk
* Harga produk
* Stok produk
* Upload gambar produk
* Product status
* Validasi harga
* Validasi stok
* Validasi image

### Product Status

|  Stock | Status       |
| -----: | ------------ |
|   > 30 | Tersedia     |
| 1 - 30 | Stok Menipis |
|      0 | Stok Habis   |

Product menggunakan **soft delete**, sehingga produk yang dihapus tidak langsung hilang dari database dan dapat dipulihkan.

---

# 🛒 Point of Sale

POS digunakan oleh kasir untuk melakukan transaksi.

Features:

* Menampilkan produk aktif
* Product search
* Menambahkan produk ke cart
* Mengubah quantity
* Menghapus item dari cart
* Perhitungan subtotal
* Perhitungan total
* Input pembayaran
* Perhitungan kembalian
* Cash payment
* QRIS payment
* Validasi stok
* Update stok otomatis
* Receipt / struk transaksi

### Transaction Calculation

```text
Subtotal = Product Price × Quantity

Total = Σ Subtotal

Change = Cash Received - Total
```

Perhitungan transaksi dilakukan kembali di server untuk mencegah manipulasi harga atau total dari client.

---

# 💳 Payment Method

Saat ini sistem mendukung:

* 💵 Cash
* 📱 QRIS

Payment method disimpan pada database bersama informasi transaksi.

---

# 🧾 Transaction Management

Admin dapat melihat dan mengelola transaksi.

Features:

* Membuat transaksi
* Transaction history
* Transaction detail
* Transaction pagination
* Filter berdasarkan tanggal
* Informasi kasir
* Transaction items
* Product information
* Total transaksi
* Payment method
* Cash received
* Change
* Update stock
* Receipt

---

# 🔐 Idempotency

Transaction API menggunakan **idempotency key** untuk mencegah transaksi yang sama diproses lebih dari satu kali.

Contoh kasus:

```text
User klik "Bayar"
        ↓
Request dikirim
        ↓
Network lambat
        ↓
User klik "Bayar" lagi
        ↓
Request kedua masuk
```

Tanpa idempotency:

```text
Transaction #1
Transaction #2
```

Dengan idempotency:

```text
Request #1 → Transaction created

Request #2 → Existing transaction returned
```

Hal ini membantu mencegah **double transaction**.

---

# 📝 Audit Log

Aktivitas penting user dicatat menggunakan audit log.

Contoh aktivitas:

```text
CREATE_PRODUCT
UPDATE_PRODUCT
DELETE_PRODUCT
ACTIVATE_PRODUCT
DEACTIVATE_PRODUCT
CREATE_TRANSACTION
LOGIN
LOGOUT
```

Informasi yang dapat dicatat:

* User ID
* Username
* Role
* Action
* Entity
* Entity ID
* Detail aktivitas
* IP Address
* User Agent
* Timestamp

Contoh:

```text
USER YANG MEMBUAT:
{
  id: 1,
  username: "admin",
  role: "admin"
}

PRODUK YANG DIBUAT:
{
  id: 10,
  name: "Indomie Goreng",
  price: 3500,
  stock: 50
}
```

---

# ⚡ Real-time Update

Dashboard menggunakan **Pusher** untuk menerima event secara real-time.

Flow:

```text
Cashier
   │
   │ Create Transaction
   ▼
Transaction API
   │
   ▼
PostgreSQL
   │
   │ Transaction Success
   ▼
Pusher
   │
   │ transaction-created
   ▼
Dashboard
   │
   ▼
Refresh Analytics
```

Pusher digunakan sebagai **notification/event layer**, bukan sebagai database.

Contoh event:

```text
transaction-created
```

Dashboard kemudian melakukan request ulang ke API analytics untuk mendapatkan data terbaru.

---

# 📊 Dashboard Analytics

Dashboard menyediakan informasi statistik penjualan.

Contoh informasi:

* Total transaksi
* Total revenue
* Total produk
* Total stok
* Produk terlaris
* Penjualan berdasarkan periode
* Grafik penjualan

Visualisasi menggunakan **Recharts**.

---

# 📄 Reports

Aplikasi menyediakan laporan dalam format PDF.

Jenis laporan:

### Product Report

Berisi:

* Product ID
* Product name
* Category
* Price
* Stock
* Product status

### Transaction Report

Berisi:

* Transaction ID
* Cashier
* Total
* Payment method
* Cash received
* Change
* Transaction date

### Combined Report

Menggabungkan:

* Product report
* Transaction report
* Summary

Endpoint:

```text
GET /api/v1/reports/pdf
```

Parameter:

```text
type=product
type=transaction
type=all
```

Filter tanggal:

```text
startDate=2026-01-01
endDate=2026-01-31
```

Contoh:

```text
/api/v1/reports/pdf?type=transaction&startDate=2026-01-01&endDate=2026-01-31
```

---

# 🧾 Receipt / Thermal Printer

Sistem menyediakan tampilan receipt setelah transaksi selesai.

Receipt dapat digunakan untuk kebutuhan printer thermal.

Flow:

```text
Transaction
     ↓
Receipt Modal
     ↓
Print
     ↓
Thermal Printer
```

---

# 📱 Responsive UI

Interface dibuat responsive untuk:

* Desktop
* Laptop
* Tablet
* Smartphone

Komponen utama:

* Navbar
* Sidebar
* Dashboard
* Product Grid
* Cart Sidebar
* Payment Modal
* Receipt Modal
* Product Management
* Transaction Management
* User Management
* Reports

---

# 📲 Progressive Web App

Project juga memiliki konfigurasi PWA.

Komponen PWA:

```text
public/
├── manifest.webmanifest
├── sw.js
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

PWA memungkinkan aplikasi memiliki pengalaman seperti aplikasi mobile.

---

# 🧱 Architecture

Project menggunakan arsitektur full-stack menggunakan Next.js.

```text
┌──────────────────────────────────┐
│            Frontend              │
│                                  │
│ React + Next.js                  │
│ Dashboard                        │
│ POS                              │
│ Products                         │
│ Transactions                     │
│ Reports                          │
└────────────────┬─────────────────┘
                 │
                 │ HTTP Request
                 ▼
┌──────────────────────────────────┐
│             Backend              │
│                                  │
│ Next.js API Routes               │
│ Authentication                   │
│ Authorization                    │
│ Business Logic                   │
│ Validation                       │
│ Rate Limiting                    │
│ Audit Log                        │
└────────────────┬─────────────────┘
                 │
                 │ Prisma ORM
                 ▼
┌──────────────────────────────────┐
│            Database              │
│                                  │
│ PostgreSQL / Neon                │
└──────────────────────────────────┘
```

Real-time communication:

```text
Backend
   │
   ▼
 Pusher
   │
   ▼
Frontend Dashboard
```

---

# 📂 Project Structure

```text
kasir-nextjs/
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── public/
│   ├── icons/
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   ├── manifest.webmanifest
│   └── sw.js
│
├── src/
│   │
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── dashboard/
│   │   │       │   └── analytics/
│   │   │       ├── products/
│   │   │       │   ├── route.js
│   │   │       │   └── [id]/
│   │   │       │       ├── route.js
│   │   │       │       └── restore/
│   │   │       ├── transactions/
│   │   │       │   ├── route.js
│   │   │       │   └── [id]/
│   │   │       ├── users/
│   │   │       └── reports/
│   │   │           └── pdf/
│   │   │
│   │   ├── auth/
│   │   │   └── login/
│   │   │
│   │   ├── dashboard/
│   │   │   ├── products/
│   │   │   ├── transactions/
│   │   │   ├── users/
│   │   │   └── page.jsx
│   │   │
│   │   ├── reports/
│   │   │   └── page.jsx
│   │   │
│   │   └── page.jsx
│   │
│   ├── backend/
│   │   ├── service/
│   │   │   ├── auth.service.js
│   │   │   ├── product.service.js
│   │   │   ├── transaction.service.js
│   │   │   ├── user.service.js
│   │   │   └── audit.service.js
│   │   │
│   │   └── utils/
│   │       ├── rateLimit.js
│   │       ├── getClientIp.js
│   │       └── pdfGenerator.js
│   │
│   ├── frontend/
│   │   ├── components/
│   │   │   ├── Navbar/
│   │   │   ├── Sidebar/
│   │   │   ├── ProductGrid/
│   │   │   ├── CartSidebar/
│   │   │   ├── PaymentModal/
│   │   │   └── ReceiptModal/
│   │   │
│   │   ├── services/
│   │   │   ├── authApi.js
│   │   │   ├── productApi.js
│   │   │   ├── transactionApi.js
│   │   │   └── pusher.js
│   │   │
│   │   └── css/
│   │
│   ├── lib/
│   │   ├── prisma.js
│   │   └── pusher.js
│   │
│   ├── generated/
│   │   └── prisma/
│   │
│   └── shared/
│       └── utils/
│           ├── formatCurrency.js
│           └── formatDate.js
│
├── .env
├── .gitignore
├── next.config.js
├── package.json
└── README.md
```

---

# 🗄️ Database

Database menggunakan:

* PostgreSQL
* Neon PostgreSQL
* Prisma ORM

Relasi utama:

```text
User
 │
 └── Transaction
        │
        └── TransactionItem
                │
                └── Product
```

---

## User

Menyimpan data pengguna.

```text
id
username
password
role
createdAt
updatedAt
```

Role:

```text
admin
cashier
```

---

## Product

Menyimpan data produk.

```text
id
name
price
stock
category
image
isActive
createdAt
updatedAt
```

`isActive` digunakan untuk soft delete.

---

## Transaction

Menyimpan transaksi penjualan.

```text
id
total
paymentMethod
cashReceived
change
cashierId
idempotencyKey
createdAt
```

---

## TransactionItem

Menyimpan detail produk pada transaksi.

```text
id
transactionId
productId
quantity
price
subtotal
```

---

# 🔄 Transaction Flow

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
Validate Stock
       ↓
Validate Payment
       ↓
Check Idempotency Key
       ↓
Create Transaction
       ↓
Create Transaction Items
       ↓
Update Product Stock
       ↓
Commit Database Transaction
       ↓
Create Audit Log
       ↓
Trigger Pusher Event
       ↓
Transaction Completed
```

Database transaction menggunakan Prisma transaction untuk menjaga konsistensi data.

---

# 🔐 Security

Security yang diterapkan:

* JWT Authentication
* HTTP Cookie Authentication
* bcrypt password hashing
* Role-based Authorization
* Protected API
* Server-side validation
* Database validation
* Rate limiting
* reCAPTCHA
* Idempotency
* Audit logging
* Stock validation
* Server-side price validation
* Server-side total calculation
* Prisma transaction
* PostgreSQL database

### Prinsip penting

Data dari client tidak langsung dipercaya.

Contohnya:

```text
price
total
stock
cashierId
subtotal
quantity
```

Server melakukan validasi dan perhitungan ulang sebelum menyimpan transaksi.

---

# 🚦 Rate Limiting

Login API menggunakan rate limiting untuk membantu mencegah brute-force attack.

Contoh konsep:

```text
Login attempt
      ↓
Rate limiter
      ↓
Allowed?
  ┌───┴───┐
 YES      NO
  ↓        ↓
Login    Reject
```

Jika jumlah percobaan melebihi batas, request akan ditolak sementara.

---

# 🤖 reCAPTCHA

Login dapat dilindungi menggunakan **Google reCAPTCHA v3** untuk membantu mendeteksi aktivitas otomatis/bot.

Flow:

```text
Login Form
    ↓
reCAPTCHA
    ↓
Token
    ↓
Login API
    ↓
Verify Token
    ↓
Authentication
```

---

# ⏱️ Session Expiration

JWT digunakan dengan expiration time untuk membatasi masa berlaku session.

Contoh konfigurasi:

```env
JWT_EXPIRES_IN="12h"
```

Dengan konfigurasi tersebut, token akan expired setelah 12 jam.

---

# 🌐 API Endpoints

## Authentication

```text
POST /api/v1/users/login
POST /api/v1/users/register
POST /api/v1/users/logout
```

---

## Products

```text
GET    /api/v1/products
POST   /api/v1/products

GET    /api/v1/products/:id
PATCH  /api/v1/products/:id
DELETE /api/v1/products/:id

PATCH  /api/v1/products/:id/restore
```

---

## Users

```text
GET    /api/v1/users
POST   /api/v1/users
PATCH  /api/v1/users/:id
DELETE /api/v1/users/:id
```

---

## Transactions

```text
GET  /api/v1/transactions
POST /api/v1/transactions
GET  /api/v1/transactions/:id
```

---

## Dashboard

```text
GET /api/v1/dashboard/analytics
```

---

## Reports

```text
GET /api/v1/reports/pdf
```

Parameter:

```text
type=product
type=transaction
type=all
```

---

# 📚 Libraries & Dependencies

Berikut library utama yang digunakan dalam project.

## Core

### Next.js

Framework utama untuk frontend dan backend.

```bash
npm install next
```

### React

Library UI.

```bash
npm install react react-dom
```

---

# 🗄️ Database & ORM

### Prisma

ORM untuk PostgreSQL.

```bash
npm install prisma @prisma/client
```

Project menggunakan Prisma PostgreSQL adapter:

```bash
npm install @prisma/adapter-pg pg
```

Generate Prisma Client:

```bash
npx prisma generate
```

Migration:

```bash
npx prisma migrate dev
```

---

# 🔐 Authentication & Security

### JSON Web Token

Digunakan untuk authentication.

```bash
npm install jsonwebtoken
```

### bcrypt

Digunakan untuk hashing password.

```bash
npm install bcrypt
```

### reCAPTCHA

Digunakan untuk perlindungan login terhadap bot dan automated requests.

---

# 🎨 UI & Styling

### CSS Modules

Digunakan untuk styling component/page secara modular.

Next.js sudah mendukung CSS Modules secara built-in.

### Lucide React

Icon library.

```bash
npm install lucide-react
```

### SweetAlert2

Digunakan untuk dialog, confirmation, dan notification.

```bash
npm install sweetalert2
```

### React Toastify

Digunakan untuk toast notification.

```bash
npm install react-toastify
```

---

# 📊 Data Visualization

### Recharts

Digunakan untuk dashboard analytics dan grafik penjualan.

```bash
npm install recharts
```

Contoh chart:

```text
Sales
  │
  │        ╭──╮
  │   ╭────╯  ╰──╮
  │───╯           ╰──
  └──────────────────
       Date
```

---

# 📄 PDF

### PDFKit

Digunakan untuk membuat laporan PDF.

```bash
npm install pdfkit
```

Digunakan untuk:

* Product Report
* Transaction Report
* Combined Report

---

# ⚡ Real-time

### Pusher

Server-side Pusher.

```bash
npm install pusher
```

### Pusher JS

Client-side Pusher.

```bash
npm install pusher-js
```

Digunakan untuk real-time notification/event seperti:

```text
transaction-created
```

---

# 🛡️ Rate Limiting

Project menggunakan utility rate limiting pada backend untuk membatasi request tertentu, terutama login.

Contoh:

```text
Login API
    ↓
Rate Limiter
    ↓
Allowed / Blocked
```

---

# 📱 PWA

Project menggunakan:

* Web App Manifest
* Service Worker
* PWA Icons

File:

```text
public/manifest.webmanifest
public/sw.js
public/icons/icon-192.png
public/icons/icon-512.png
```

---

# 🧰 Development Tools

Tools yang digunakan selama development:

* VS Code
* Git
* GitHub
* Postman
* Prisma Studio
* Chrome DevTools
* Vercel
* Neon PostgreSQL

---

# 📦 Installation

## 1. Clone Repository

```bash
git clone https://github.com/iqbal0899/kasir-nextjs.git
```

Masuk ke project:

```bash
cd kasir-nextjs
```

---

# 2. Install Dependencies

```bash
npm install
```

---

# 3. Environment Variables

Buat file:

```text
.env
```

Contoh:

```env
DATABASE_URL="your_postgresql_database_url"

JWT_SECRET="your_secret_key"

JWT_EXPIRES_IN="12h"

NEXT_PUBLIC_PUSHER_KEY="your_pusher_key"

PUSHER_APP_ID="your_pusher_app_id"

PUSHER_SECRET="your_pusher_secret"

PUSHER_CLUSTER="your_pusher_cluster"

NEXT_PUBLIC_RECAPTCHA_SITE_KEY="your_recaptcha_site_key"

RECAPTCHA_SECRET_KEY="your_recaptcha_secret_key"
```

> Jangan commit `.env` ke GitHub.

---

# 4. Generate Prisma Client

```bash
npx prisma generate
```

---

# 5. Database Migration

Development:

```bash
npx prisma migrate dev
```

Production:

```bash
npx prisma migrate deploy
```

---

# 6. Prisma Studio

Untuk melihat database:

```bash
npx prisma studio
```

---

# 7. Jalankan Development Server

```bash
npm run dev
```

Aplikasi berjalan pada:

```text
http://localhost:5000
```

---

# 🏗️ Build Production

Build aplikasi:

```bash
npm run build
```

Jalankan production:

```bash
npm start
```

---

# 🧪 Testing API

API dapat diuji menggunakan:

* Postman
* Browser
* Chrome DevTools
* REST Client

Contoh:

```text
POST /api/v1/products
POST /api/v1/transactions
GET  /api/v1/products
GET  /api/v1/transactions
```

---

# 🚀 Deployment

Project dapat di-deploy menggunakan Vercel.

Production flow:

```text
GitHub
   ↓
Push Code
   ↓
Vercel
   ↓
npm run build
   ↓
Prisma Generate
   ↓
Next.js Build
   ↓
Production
```

Database menggunakan PostgreSQL/Neon.

---

# ⚠️ Production Notes

File upload sebaiknya tidak disimpan langsung ke filesystem server menggunakan:

```text
/public/products
```

karena filesystem pada platform serverless seperti Vercel bersifat ephemeral/read-only pada bagian tertentu.

Untuk production, gunakan object storage seperti:

* Vercel Blob
* Cloudinary
* Amazon S3
* Storage provider lainnya

Database hanya menyimpan URL gambar.

---

# 📈 Future Improvements

Roadmap pengembangan:

* [x] Dashboard analytics
* [x] Grafik penjualan
* [x] Filter laporan berdasarkan tanggal
* [x] Print receipt
* [x] Product search
* [x] Pagination
* [x] Rate limiting
* [x] Idempotency
* [x] Audit log
* [x] Real-time update
* [x] PWA basic setup
* [x] Soft delete product
* [x] Restore product
* [ ] Export Excel
* [ ] Barcode scanner
* [ ] Dark mode
* [ ] Cloud image storage
* [ ] Automated testing
* [ ] Unit testing
* [ ] Integration testing
* [ ] E2E testing

---

# 🎯 Project Goals

Project ini dibuat untuk menerapkan konsep **Full-Stack Web Development**, meliputi:

* Frontend Development
* Backend Development
* REST API
* Database Design
* PostgreSQL
* Prisma ORM
* Authentication
* Authorization
* JWT
* Password Hashing
* Role-based Access Control
* API Security
* Rate Limiting
* Idempotency
* Audit Logging
* Database Transactions
* Real-time Communication
* State Management
* Responsive UI
* PWA
* PDF Generation
* Deployment

---

# 👨‍💻 Developer

## Muhammad Iqbal

**Full-Stack Web Developer**

### Skills

```text
Next.js
React.js
JavaScript
Node.js
Prisma
PostgreSQL
Neon
REST API
JWT
bcrypt
Pusher
Recharts
Git
GitHub
Vercel
```

---

# 📄 License

Project ini dikembangkan untuk:

* Learning
* Portfolio
* Educational purposes
* Full-Stack Web Development practice

---

# ⭐ Support

Jika project ini bermanfaat, jangan lupa memberikan ⭐ pada repository GitHub.

Repository:

```text
https://github.com/iqbal0899/kasir-nextjs
```
