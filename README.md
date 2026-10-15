# 🛒 Toko Iqbal — Point of Sale (POS)

Aplikasi **Point of Sale (POS)** berbasis web untuk membantu pengelolaan produk, transaksi penjualan, stok, pengguna, laporan, monitoring, dan aktivitas sistem pada **Toko Iqbal**.

Aplikasi dibangun menggunakan **Next.js App Router** dengan arsitektur full-stack, **PostgreSQL + Prisma** sebagai database layer, serta beberapa fitur pendukung seperti **JWT Authentication, Role-Based Access Control, Pusher, Swagger, PDF Report, PWA, dan Rate Limiting**.

---

## ✨ Features

### 🔐 Authentication & Authorization

* Login menggunakan username dan password
* Password hashing menggunakan bcrypt
* JWT authentication
* JWT disimpan menggunakan HTTP-only cookie
* Session expiration
* Role-Based Access Control (RBAC)
* reCAPTCHA v3 pada login
* Login rate limiting
* Logout
* Audit log aktivitas pengguna

### 👥 User Roles

Aplikasi memiliki tiga role:

| Role            | Deskripsi                                                                         |
| --------------- | --------------------------------------------------------------------------------- |
| **Super Admin** | Memiliki akses penuh terhadap sistem                                              |
| **Admin**       | Mengelola operasional toko tetapi tidak dapat mengakses Monitoring dan Semua User |
| **Cashier**     | Berfokus pada proses transaksi/POS                                                |

### 🔑 Role Permissions

| Fitur           | Super Admin |       Admin       |      Cashier      |
| --------------- | :---------: | :---------------: | :---------------: |
| Login           |      ✅      |         ✅         |         ✅         |
| Dashboard       |      ✅      |         ✅         |         ✅         |
| POS             |      ✅      |         ✅         |         ✅         |
| Produk          |      ✅      |         ✅         |         ❌         |
| Transaksi       |      ✅      |         ✅         | Sesuai permission |
| Laporan         |      ✅      |         ✅         |         ❌         |
| Monitoring      |      ✅      |         ❌         |         ❌         |
| Semua User      |      ✅      |         ❌         |         ❌         |
| Audit Log       |      ✅      | Sesuai permission |         ❌         |
| User Management |      ✅      |      Terbatas     |         ❌         |

> Authorization diterapkan pada sisi server/API. Hak akses pada UI bukan satu-satunya lapisan keamanan.

---

# 📦 Product Management

Admin yang memiliki permission dapat melakukan:

* Menampilkan produk
* Menambahkan produk
* Mengedit produk
* Menghapus/deaktivasi produk
* Restore produk
* Mengelola harga
* Mengelola stok
* Mengelola kategori
* Menampilkan gambar produk
* Pagination
* Filter produk
* Stock status

### Stock Status

|    Stock | Status   |
| -------: | -------- |
|   `> 30` | Tersedia |
| `1 - 30` | Menipis  |
|      `0` | Habis    |

---

# 💳 Point of Sale

Halaman POS digunakan untuk melakukan transaksi penjualan.

Flow transaksi:

```text
Select Product
      ↓
Add to Cart
      ↓
Set Quantity
      ↓
Calculate Total
      ↓
Payment
      ↓
Validate Payment
      ↓
Create Transaction
      ↓
Decrease Stock
      ↓
Create Stock History
      ↓
Create Audit Log
      ↓
Send Realtime Event
      ↓
Receipt
```

### Payment Method

Saat ini mendukung:

* Cash
* QRIS

Untuk pembayaran cash, sistem menghitung:

```text
Change = Cash Received - Total Amount
```

Sistem akan menolak pembayaran apabila uang cash yang diterima kurang dari total transaksi.

---

# 🧾 Transaction Management

Fitur transaksi meliputi:

* Membuat transaksi
* Melihat daftar transaksi
* Melihat detail transaksi
* Menampilkan item transaksi
* Total transaksi
* Payment method
* Cash received
* Change
* Cashier
* Transaction history

## Idempotency

Transaksi menggunakan:

```text
idempotencyKey
```

dengan constraint unique pada database.

Tujuannya untuk mencegah transaksi yang sama diproses lebih dari satu kali ketika terjadi:

* Double click
* Retry request
* Network issue
* Request duplication

Contoh flow:

```text
Client
  ↓
Generate UUID
  ↓
Send idempotencyKey
  ↓
Server
  ↓
Check existing transaction
  ↓
Already exists?
 ┌───────────────┐
 │ Yes           │ No
 ↓               ↓
Return existing  Create transaction
                 ↓
                 Commit
```

---

# 📊 Dashboard

Dashboard menampilkan informasi utama toko seperti:

* Total transaksi
* Total pendapatan
* Jumlah produk
* Produk dengan stok rendah
* Statistik penjualan
* Grafik transaksi
* Ringkasan penjualan

Dashboard menggunakan data dari API:

```text
/api/v1/dashboard/analytics
```

---

# 📡 Realtime Monitoring

Aplikasi menggunakan **Pusher** untuk komunikasi realtime.

Contoh event:

```text
Channel:
dashboard

Event:
transaction-created
```

Ketika transaksi baru berhasil dibuat:

```text
POS
 ↓
Create Transaction
 ↓
Database
 ↓
Pusher Event
 ↓
Dashboard
 ↓
Refresh Analytics
```

Dengan demikian dashboard dapat memperbarui data tanpa harus selalu melakukan refresh halaman secara manual.

---

# 🖥️ Monitoring

Monitoring digunakan untuk memantau aktivitas sistem secara realtime.

Akses Monitoring dibatasi untuk:

```text
Super Admin
```

Admin dan Cashier tidak dapat membuka halaman Monitoring.

Route:

```text
/dashboard/monitoring
```

API:

```text
/api/v1/dashboard/monitoring
```

---

# 📈 Reports

Aplikasi menyediakan laporan:

* Product report
* Transaction report
* Combined report

Laporan dapat menggunakan filter tanggal:

```text
Start Date
End Date
```

PDF report tersedia melalui:

```text
/api/v1/reports/pdf
```

Parameter:

```text
type=all
type=product
type=transaction
```

Contoh:

```text
/api/v1/reports/pdf?type=transaction
```

PDF dibuat menggunakan **PDFKit**.

---

# 🖨️ Receipt & Thermal Printer

Aplikasi menyediakan receipt setelah transaksi berhasil.

Receipt dapat digunakan untuk kebutuhan printer thermal.

Utility printer:

```text
src/backend/utils/escpos.js
```

Flow:

```text
Transaction Success
       ↓
Receipt Modal
       ↓
Generate Receipt
       ↓
Thermal Printer
```

---

# 📝 Audit Log

Sistem mencatat aktivitas penting pengguna melalui Audit Log.

Contoh aktivitas:

* Login
* Logout
* Create product
* Update product
* Delete/restore product
* Create transaction
* User management
* Aktivitas administratif lainnya

API:

```text
/api/v1/audit-logs
```

Test endpoint:

```text
/api/v1/audit-logs/test
```

Audit log membantu administrator melakukan tracking terhadap aktivitas sistem.

---

# 🛡️ Security

Aplikasi menerapkan beberapa mekanisme keamanan.

### Password Hashing

Password tidak disimpan dalam bentuk plaintext.

Digunakan:

```text
bcrypt
```

### JWT Authentication

Authentication menggunakan JWT.

Token digunakan untuk memvalidasi session user pada request yang membutuhkan authentication.

### HTTP-Only Cookie

JWT disimpan menggunakan cookie sehingga token tidak perlu diakses langsung oleh JavaScript client.

### Role-Based Authorization

Setiap role memiliki permission yang berbeda.

Authorization harus tetap diverifikasi di server/API.

### Rate Limiting

Endpoint login memiliki rate limiting untuk mengurangi risiko:

* Brute force
* Credential attack
* Excessive request

### reCAPTCHA

Login menggunakan reCAPTCHA v3 untuk membantu mendeteksi automated/bot requests.

### Session Expiration

Session memiliki masa berlaku dan mekanisme logout ketika session sudah tidak valid.

### SQL Injection Protection

Database access menggunakan Prisma sehingga query tidak dibuat dengan string concatenation SQL secara manual.

### Security Headers

Aplikasi menggunakan beberapa security headers, termasuk Content Security Policy (CSP).

---

# 🗄️ Database

Database menggunakan:

```text
PostgreSQL
```

ORM:

```text
Prisma
```

Database adapter menggunakan PostgreSQL adapter.

Konfigurasi database menggunakan:

```env
DATABASE_URL="postgresql://..."
```

## Main Models

```text
User
Product
StockHistory
Transaction
TransactionItem
AuditLog
```

### Relationship Overview

```text
User
 │
 ├── Transactions
 │
 └── AuditLogs

Product
 │
 ├── TransactionItems
 │
 └── StockHistories

Transaction
 │
 ├── User / Cashier
 │
 └── TransactionItems

TransactionItem
 │
 └── Product
```

---

# 🧱 Project Architecture

Project menggunakan struktur full-stack di dalam Next.js.

```text
src/
├── app/
│   ├── api/
│   ├── auth/
│   ├── dashboard/
│   ├── pos/
│   ├── reports/
│   └── api-doc/
│
├── backend/
│   ├── actions/
│   ├── service/
│   └── utils/
│
├── frontend/
│   ├── components/
│   ├── css/
│   ├── data/
│   ├── services/
│   └── ...
│
├── generated/
│   └── prisma/
│
├── lib/
│
├── shared/
│   ├── constants/
│   └── utils/
│
└── proxy.js
```

---

# 📁 Project Structure

```text
src/
│
├── app/
│   │
│   ├── api/
│   │   └── v1/
│   │       ├── audit-logs/
│   │       ├── dashboard/
│   │       ├── products/
│   │       ├── reports/
│   │       ├── test-api/
│   │       ├── transactions/
│   │       └── users/
│   │
│   ├── api-doc/
│   │   ├── page.jsx
│   │   └── react-swagger.jsx
│   │
│   ├── auth/
│   │   ├── Layout.jsx
│   │   └── login/
│   │
│   ├── dashboard/
│   │   ├── layout.jsx
│   │   ├── monitoring/
│   │   ├── products/
│   │   ├── transactions/
│   │   └── users/
│   │
│   ├── pos/
│   │   ├── Layout.jsx
│   │   ├── page.jsx
│   │   └── ProductGrid.jsx
│   │
│   ├── reports/
│   │   └── page.jsx
│   │
│   ├── globals.css
│   ├── layout.js
│   └── page.js
│
├── backend/
│   ├── actions/
│   │   ├── checkout.action.js
│   │   ├── product.action.js
│   │   └── report.action.js
│   │
│   ├── service/
│   │   ├── audit.service.js
│   │   ├── dashboard.service.js
│   │   ├── product.service.js
│   │   ├── stock.service.js
│   │   └── transaction.service.js
│   │
│   └── utils/
│       ├── escpos.js
│       ├── getClientIp.js
│       ├── pdfGenerator.js
│       └── rateLimiter.js
│
├── frontend/
│   ├── components/
│   │   ├── admin/
│   │   ├── pos/
│   │   ├── shared/
│   │   └── ui/
│   │
│   ├── css/
│   ├── data/
│   └── services/
│
├── generated/
│   └── prisma/
│
├── lib/
│   ├── auth.js
│   ├── prisma.js
│   ├── pusher.js
│   └── swagger.js
│
├── shared/
│   ├── constants/
│   └── utils/
│
└── proxy.js
```

---

# 🔌 API Endpoints

## Authentication

| Method | Endpoint                               | Description |
| ------ | -------------------------------------- | ----------- |
| POST   | `/api/v1/users/login`                  | Login       |
| POST   | `/api/v1/users/logout`                 | Logout      |
| POST   | `/api/v1/users/register`               | Register    |
| POST   | `/api/v1/users/reset-login/[username]` | Reset login |

## Users

| Method    | Endpoint             | Description |
| --------- | -------------------- | ----------- |
| GET       | `/api/v1/users`      | Get users   |
| GET       | `/api/v1/users/[id]` | Get user    |
| PUT/PATCH | `/api/v1/users/[id]` | Update user |
| DELETE    | `/api/v1/users/[id]` | Delete user |

## Products

| Method    | Endpoint                        | Description     |
| --------- | ------------------------------- | --------------- |
| GET       | `/api/v1/products`              | Get products    |
| POST      | `/api/v1/products`              | Create product  |
| GET       | `/api/v1/products/[id]`         | Get product     |
| PUT/PATCH | `/api/v1/products/[id]`         | Update product  |
| DELETE    | `/api/v1/products/[id]`         | Delete product  |
| POST      | `/api/v1/products/[id]/restore` | Restore product |

## Transactions

| Method | Endpoint                    | Description            |
| ------ | --------------------------- | ---------------------- |
| GET    | `/api/v1/transactions`      | Get transactions       |
| POST   | `/api/v1/transactions`      | Create transaction     |
| GET    | `/api/v1/transactions/[id]` | Get transaction detail |

## Dashboard

| Method | Endpoint                       | Description         |
| ------ | ------------------------------ | ------------------- |
| GET    | `/api/v1/dashboard/analytics`  | Dashboard analytics |
| GET    | `/api/v1/dashboard/monitoring` | Monitoring data     |

## Reports

| Method | Endpoint              | Description         |
| ------ | --------------------- | ------------------- |
| GET    | `/api/v1/reports/pdf` | Generate PDF report |

## Audit Log

| Method | Endpoint                  | Description    |
| ------ | ------------------------- | -------------- |
| GET    | `/api/v1/audit-logs`      | Get audit logs |
| GET    | `/api/v1/audit-logs/test` | Test audit log |

---

# 📚 Swagger API Documentation

API documentation tersedia menggunakan Swagger.

Route:

```text
/api-doc
```

Swagger digunakan untuk:

* Melihat daftar API
* Melihat HTTP method
* Melihat request
* Melihat response
* Testing endpoint
* Dokumentasi API

Swagger configuration:

```text
src/lib/swagger.js
```

Swagger UI:

```text
src/app/api-doc/react-swagger.jsx
```

---

# 🧪 Testing

Project dapat diuji menggunakan beberapa pendekatan.

### API Testing

API dapat diuji menggunakan:

* Swagger
* Postman
* Browser
* Custom testing script

### Security Testing

Beberapa pengujian keamanan yang dapat dilakukan:

* SQL Injection
* Authentication testing
* Rate limit testing
* Authorization testing
* Security headers
* CSP testing

Contoh SQL injection test:

```text
Username: '
Password: test
```

Response yang diharapkan:

```text
401 Unauthorized
```

---

# 🚦 Load Testing

Project juga dapat diuji menggunakan Python dengan virtual users.

Contoh:

```text
testing-user/
├── testing-products.py
├── testing-transactions.py
└── testing-login.py
```

Load testing dapat digunakan untuk mengukur:

* Response time
* Throughput
* Success rate
* Failed request
* Average latency
* P95 latency
* Server behavior under concurrent requests

Contoh hasil:

```text
Virtual Users : 50
Total Requests: 50
Success Rate  : 100%
Throughput    : 8.73 req/s
```

> Hasil load test sangat bergantung pada hardware, database, network, query, konfigurasi server, dan environment tempat testing dilakukan.

---

# ⚡ Performance Considerations

Beberapa optimasi yang diterapkan atau dapat dikembangkan:

* Pagination
* Limit query
* Database indexing
* Efficient Prisma queries
* Avoid unnecessary data fetching
* API caching jika diperlukan
* Rate limiting
* Connection pooling
* Query optimization
* Realtime update menggunakan Pusher

Untuk endpoint dengan jumlah data besar, pagination digunakan agar server tidak mengambil seluruh data sekaligus.

---

# 📱 Progressive Web App

Aplikasi mendukung konsep **Progressive Web App (PWA)**.

Komponen PWA:

```text
manifest.webmanifest
sw.js
icons/
```

Tujuannya agar aplikasi dapat memberikan pengalaman seperti aplikasi desktop/mobile.

---

# 🛠️ Tech Stack

## Frontend

* Next.js
* React
* JavaScript
* JSX
* CSS
* CSS Modules
* Recharts
* Lucide React
* React Toastify

## Backend

* Next.js App Router
* Node.js
* Prisma
* PostgreSQL
* JWT
* bcrypt
* Pusher

## Documentation

* Swagger
* next-swagger-doc
* swagger-ui-react

## Reporting

* PDFKit

## Security

* bcrypt
* JWT
* reCAPTCHA v3
* Rate Limiting
* CSP
* Security Headers
* RBAC

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

## 2. Install Dependencies

```bash
npm install
```

Semua dependency yang terdapat di `package.json` akan otomatis di-install.

## 3. Environment Variables

Buat file:

```text
.env
```

Kemudian isi konfigurasi yang dibutuhkan:

```env
DATABASE_URL="your_postgresql_database_url"

JWT_SECRET="your_jwt_secret"

NEXT_PUBLIC_RECAPTCHA_SITE_KEY="your_recaptcha_site_key"

RECAPTCHA_SECRET_KEY="your_recaptcha_secret_key"

PUSHER_APP_ID="your_pusher_app_id"
PUSHER_KEY="your_pusher_key"
PUSHER_SECRET="your_pusher_secret"
PUSHER_CLUSTER="your_pusher_cluster"

NEXT_PUBLIC_PUSHER_KEY="your_pusher_key"
NEXT_PUBLIC_PUSHER_CLUSTER="your_pusher_cluster"
```

> Jangan commit file `.env` ke repository.

## 4. Generate Prisma Client

```bash
npx prisma generate
```

## 5. Database Migration

Untuk development:

```bash
npx prisma migrate dev
```

Untuk production:

```bash
npx prisma migrate deploy
```

---

# 🚀 Running Development Server

Jalankan:

```bash
npm run dev
```

Aplikasi berjalan pada:

```text
http://localhost:5000
```

---

# 🏗️ Production Build

Build aplikasi:

```bash
npm run build
```

Start production server:

```bash
npm start
```

---

# 🔍 Lint

Jalankan ESLint:

```bash
npm run lint
```

ESLint digunakan untuk membantu mendeteksi:

* Potential bugs
* React issues
* Hook issues
* Code quality issues
* Unused variables
* Invalid patterns

Disarankan memperbaiki warning/error ESLint daripada menonaktifkan rule secara global.

---

# 🗂️ Important Routes

| Route                           | Description           |
| ------------------------------- | --------------------- |
| `/`                             | Home                  |
| `/auth/login`                   | Login                 |
| `/dashboard`                    | Dashboard             |
| `/dashboard/products`           | Product management    |
| `/dashboard/products/tambah`    | Add product           |
| `/dashboard/products/edit/[id]` | Edit product          |
| `/dashboard/transactions`       | Transactions          |
| `/dashboard/transactions/[id]`  | Transaction detail    |
| `/dashboard/users`              | User management       |
| `/dashboard/monitoring`         | System monitoring     |
| `/reports`                      | Reports               |
| `/pos`                          | Point of Sale         |
| `/api-doc`                      | Swagger documentation |

---

# 🔄 Main Transaction Architecture

```text
                 ┌──────────────┐
                 │   POS Page   │
                 └──────┬───────┘
                        │
                        ▼
                 Payment Modal
                        │
                        ▼
              Checkout / Transaction
                        │
                        ▼
              Transaction Service
                        │
             ┌──────────┼──────────┐
             ▼          ▼          ▼
        Transaction   Stock     Audit Log
             │        Update
             │
             ▼
        TransactionItem
             │
             ▼
           Product
                        │
                        ▼
                    Pusher
                        │
                        ▼
                   Dashboard
```

---

# 🧩 Backend Responsibility

### `backend/actions`

Berisi action yang menjadi penghubung antara API/UI dengan service.

Contoh:

```text
checkout.action.js
product.action.js
report.action.js
```

### `backend/service`

Berisi business logic utama aplikasi.

```text
audit.service.js
dashboard.service.js
product.service.js
stock.service.js
transaction.service.js
```

### `backend/utils`

Berisi utility yang digunakan oleh backend.

```text
escpos.js
getClientIp.js
pdfGenerator.js
rateLimiter.js
```

---

# 🎨 Frontend Responsibility

### `frontend/components`

Berisi reusable UI components.

Contoh:

```text
admin/
pos/
shared/
ui/
```

### `frontend/services`

Berisi logic komunikasi frontend dengan API.

Contoh:

```text
authApi.js
dashboardApi.js
productApi.js
transactionApi.js
pusher.js
```

### `frontend/css`

Berisi stylesheet dan CSS Modules.

---

# 🔗 Shared

Folder:

```text
src/shared/
```

digunakan untuk logic yang dapat digunakan oleh beberapa bagian aplikasi.

Contoh:

```text
shared/
├── constants/
└── utils/
    ├── formatCurrency.js
    └── formatDate.js
```

---

# 🧠 Development Principles

Project dikembangkan dengan beberapa prinsip:

* Separation of concerns
* Reusable components
* Service-based backend logic
* API-based communication
* Server-side authorization
* Database transactions
* Input validation
* Secure authentication
* Error handling
* Pagination
* Performance testing
* Security testing

---

# 🔒 Production Checklist

Sebelum deployment production:

* [ ] Set `DATABASE_URL`
* [ ] Set `JWT_SECRET` yang kuat
* [ ] Set reCAPTCHA credentials
* [ ] Set Pusher credentials
* [ ] Jangan commit `.env`
* [ ] Jalankan `npm run lint`
* [ ] Jalankan `npm run build`
* [ ] Jalankan Prisma migration
* [ ] Pastikan authorization API aktif
* [ ] Pastikan rate limiting aktif
* [ ] Pastikan CSP/security headers sesuai environment
* [ ] Test login
* [ ] Test transaction
* [ ] Test stock update
* [ ] Test role permissions
* [ ] Test monitoring access
* [ ] Test user management access
* [ ] Test PDF report
* [ ] Test realtime dashboard

---

# 🚧 Future Improvements

Beberapa fitur yang dapat dikembangkan:

* [ ] Automated unit testing
* [ ] Integration testing
* [ ] End-to-end testing
* [ ] Advanced monitoring
* [ ] More detailed analytics
* [ ] Export Excel
* [ ] Backup & restore database
* [ ] Inventory management yang lebih lengkap
* [ ] Supplier management
* [ ] Purchase/order management
* [ ] Multi-store support
* [ ] Advanced permission management
* [ ] Automated CI/CD
* [ ] Improved caching
* [ ] Database query optimization

---

# 👨‍💻 Developer

**Muhammad Iqbal**

Full-Stack Developer / Informatics Engineering Graduate

Project:

**Toko Iqbal — Point of Sale**

Repository:

```text
https://github.com/iqbal0899/kasir-nextjs
```

---

# 📄 License

This project is developed for learning, portfolio, and application development purposes.
