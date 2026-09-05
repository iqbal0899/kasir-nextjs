import PDFDocument from "pdfkit";

import { formatCurrency } from "@/shared/utils/formatCurrency";

/**
 * =========================================================
 * HELPER
 * =========================================================
 */

function formatPrice(value) {
  return formatCurrency(value);
}

function formatDate(date) {
  if (!date) {
    return "-";
  }

  try {
    return new Date(date).toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
}

/**
 * =========================================================
 * DOCUMENT
 * =========================================================
 */

function createDocument() {
  return new PDFDocument({
    size: "A4",
    margin: 40,
    bufferPages: true,
  });
}

/**
 * =========================================================
 * HEADER
 * =========================================================
 */
function addHeader(doc, title, userName = "User") {
  // ========================================
  // NAMA TOKO
  // ========================================

  doc
    .font("Helvetica-Bold")
    .fontSize(20)
    .text("TOKO IQBAL", {
      align: "center",
    });

  doc.moveDown(0.2);

  // ========================================
  // SUBTITLE
  // ========================================

  doc
    .font("Helvetica")
    .fontSize(9)
    .text("Toko Penjualan & Kasir", {
      align: "center",
    });

  doc.text(
    "Melayani kebutuhan Anda dengan mudah dan terpercaya",
    {
      align: "center",
    }
  );

  doc.moveDown(0.2);

  doc.text(
    "Jl. Contoh Alamat Toko Iqbal | Telp. 08xxxxxxxxxx",
    {
      align: "center",
    }
  );

  doc.moveDown(0.8);

  // ========================================
  // GARIS ATAS
  // ========================================

  doc
    .moveTo(40, doc.y)
    .lineTo(555, doc.y)
    .lineWidth(1)
    .stroke();

  doc.moveDown(0.7);

  // ========================================
  // INFORMASI LAPORAN
  // SATU BARIS
  // ========================================

  const infoY = doc.y;

  // Dicetak oleh - KIRI
  doc
    .font("Helvetica")
    .fontSize(8)
    .text(
      `Dicetak oleh: ${userName}`,
      40,
      infoY,
      {
        width: 150,
        align: "left",
      }
    );

  // Judul laporan - TENGAH
  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .text(
      title,
      210,
      infoY - 2,
      {
        width: 175,
        align: "center",
      }
    );

  // Tanggal cetak - KANAN
  doc
    .font("Helvetica")
    .fontSize(8)
    .text(
      `Tanggal cetak: ${formatDate(new Date())}`,
      365,
      infoY,
      {
        width: 190,
        align: "right",
      }
    );

  doc.moveDown(2);

  // ========================================
  // GARIS BAWAH
  // ========================================

  doc
    .moveTo(40, doc.y)
    .lineTo(555, doc.y)
    .lineWidth(0.5)
    .stroke();

  doc.moveDown(0.7);
}



/**
 * =========================================================
 * FOOTER
 * =========================================================
 *
 * Footer hanya berisi nama toko.
 * Tidak ada:
 * - Nomor halaman
 * - Sistem Informasi Penjualan & Manajemen Toko
 * =========================================================
 */

function addFooter(doc) {
  const pageHeight = doc.page.height;
  const pageWidth = doc.page.width;

  const footerY = pageHeight - 45;

  // Garis footer
  doc
    .moveTo(40, footerY - 8)
    .lineTo(pageWidth - 40, footerY - 8)
    .lineWidth(0.5)
    .stroke();

  // Nama toko
  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .text(
      "TOKO IQBAL",
      40,
      footerY,
      {
        width: pageWidth - 80,
        align: "center",
      }
    );
}



/**
 * =========================================================
 * APPLY FOOTER
 * =========================================================
 *
 * Footer diberikan ke SEMUA halaman setelah selesai generate.
 */

function applyFooters(doc) {
  const range = doc.bufferedPageRange();

  for (
    let i = range.start;
    i < range.start + range.count;
    i++
  ) {
    doc.switchToPage(i);

    const pageHeight = doc.page.height;
    const pageWidth = doc.page.width;

    const footerY = pageHeight - 55;

    doc
      .moveTo(40, footerY - 8)
      .lineTo(pageWidth - 40, footerY - 8)
      .lineWidth(0.5)
      .stroke();

    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .text(
        "TOKO IQBAL",
        40,
        footerY,
        {
          width: pageWidth - 80,
          align: "center",
        }
      );
  }
}

/**
 * =========================================================
 * DOCUMENT TO BUFFER
 * =========================================================
 */

function documentToBuffer(doc) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    doc.on("data", (chunk) => {
      chunks.push(chunk);
    });

    doc.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    doc.on("error", reject);

    applyFooters(doc);

    doc.end();
  });
}

/**
 * =========================================================
 * TABLE HEADER
 * =========================================================
 */

function drawTableHeader(doc, columns, y) {
  doc
    .font("Helvetica-Bold")
    .fontSize(9);

  columns.forEach((column) => {
    doc.text(
      column.label,
      column.x,
      y,
      {
        width: column.width,
        align: column.align || "left",
      }
    );
  });

  doc
    .moveTo(40, y + 15)
    .lineTo(555, y + 15)
    .lineWidth(0.5)
    .stroke();

  return y + 25;
}

/**
 * =========================================================
 * PRODUCT COLUMNS
 * =========================================================
 */

const productColumns = [
  {
    label: "No.",
    x: 40,
    width: 35,
  },
  {
    label: "ID",
    x: 75,
    width: 35,
  },
  {
    label: "Produk",
    x: 110,
    width: 125,
  },
  {
    label: "Kategori",
    x: 245,
    width: 100,
  },
  {
    label: "Harga",
    x: 275,
    width: 90,
    align: "right",
  },
  {
    label: "Stock",
    x: 375,
    width: 50,
    align: "right",
  },
  {
    label: "Status",
    x: 450,
    width: 75,
  },
];

/**
 * =========================================================
 * TRANSACTION COLUMNS
 * =========================================================
 */

const transactionColumns = [
  {
    label: "No.",
    x: 40,
    width: 35,
  },
  {
    label: "ID",
    x: 75,
    width: 45,
  },
  {
    label: "Tanggal",
    x: 120,
    width: 115,
  },
  {
    label: "Kasir",
    x: 235,
    width: 100,
  },
  {
    label: "Total",
    x: 240,
    width: 110,
    align: "right",
  },
  {
    label: "Metode",
    x: 450,
    width: 105,
  },
];

/**
 * =========================================================
 * WRITE PRODUCT ROW
 * =========================================================
 */

function writeProductRow(doc, product, y, index) {
  const stock = Number(product.stock || 0);

  const status =
    stock === 0
      ? "Habis"
      : stock < 30
      ? "Menipis"
      : "Tersedia";

  doc
    .font("Helvetica")
    .fontSize(8);

  // NO.
  doc.text(
    String(index + 1),
    40,
    y,
    {
      width: 35,
    }
  );

  // ID
  doc.text(
    String(product.id ?? "-"),
    75,
    y,
    {
      width: 35,
    }
  );

  // PRODUK
  doc.text(
    product.name || "-",
    110,
    y,
    {
      width: 125,
    }
  );

  // KATEGORI
  doc.text(
    product.category || "Tanpa kategori",
    245,
    y,
    {
      width: 100,
    }
  );

  // HARGA
  doc.text(
    formatPrice(product.price),
    285,
    y,
    {
      width: 90,
      align: "right",
    }
  );

  // STOCK
  doc.text(
    String(stock),
    365,
    y,
    {
      width: 50,
      align: "right",
    }
  );

  // STATUS
  doc.text(
    status,
    450,
    y,
    {
      width: 75,
    }
  );
}

/**
 * =========================================================
 * WRITE TRANSACTION ROW
 * =========================================================
 */

function writeTransactionRow(
  doc,
  transaction,
  y,
  index
) {
  doc
    .font("Helvetica")
    .fontSize(8);

  doc.text(
    String(index + 1),
    40,
    y,
    { width: 35 }
  );

  doc.text(
    String(transaction.id ?? "-"),
    75,
    y,
    { width: 45 }
  );

  doc.text(
    formatDate(transaction.createdAt),
    120,
    y,
    { width: 115 }
  );

  doc.text(
    transaction.cashier?.username ||
      transaction.cashierName ||
      "-",
    235,
    y,
    { width: 100 }
  );

  doc.text(
    formatPrice(transaction.total),
    258,
    y,
    {
      width: 110,
      align: "right",
    }
  );

  const method =
    transaction.paymentMethod === "cash"
      ? "Tunai"
      : transaction.paymentMethod === "qris"
      ? "QRIS"
      : transaction.paymentMethod || "-";

  doc.text(
    method,
    450,
    y,
    { width: 105 }
  );
}

/**
 * =========================================================
 * PRODUCT REPORT
 * =========================================================
 */

export async function generateProductReport(
  data = {}
) {
  const {
    products = [],
    userName = "User",
  } = data;

  const doc = createDocument();

  addHeader(
    doc,
    "LAPORAN PRODUK",
    userName
  );

  const totalProducts =
    products.length;

  const totalStock =
    products.reduce(
      (total, product) =>
        total +
        Number(product.stock || 0),
      0
    );

  const lowStock =
    products.filter(
      (product) =>
        Number(product.stock || 0) <= 5
    ).length;

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("Ringkasan Produk", 40, doc.y);

  doc.moveDown(0.5);

  doc
    .font("Helvetica")
    .fontSize(9)
    .text(`Total Produk : ${totalProducts}`, 40, doc.y);

  doc.text(`Total Stok : ${totalStock}`, 40, doc.y);

  doc.text(`Stok Menipis : ${lowStock}`, 40, doc.y);

  doc.moveDown(0.6);

  // Garis panjang di bawah Ringkasan Produk
  doc
    .moveTo(40, doc.y)
    .lineTo(555, doc.y)
    .lineWidth(0.5)
    .stroke();

  doc.moveDown(1.4);

  let y = drawTableHeader(
    doc,
    productColumns,
    doc.y
  );

  if (products.length === 0) {
    doc
      .font("Helvetica")
      .fontSize(9)
      .text(
        "Belum ada produk.",
        40,
        y
      );
  }

  for (const [index, product] of products.entries()) {
    /**
     * Area aman sebelum footer
     */
    if (y > 720) {
      doc.addPage();

      addHeader(
        doc,
        "LAPORAN PRODUK",
        userName
      );

      y = drawTableHeader(
        doc,
        productColumns,
        doc.y
      );
    }

    writeProductRow(
      doc,
      product,
      y,
      index
    );

    y += 28;
  }

  return documentToBuffer(doc);
}

/**
 * =========================================================
 * TRANSACTION REPORT
 * =========================================================
 */

export async function generateTransactionReport(
  data = {}
) {
  const {
    transactions = [],
    userName = "User",
  } = data;

  const doc = createDocument();

  addHeader(
    doc,
    "LAPORAN TRANSAKSI",
    userName
  );

  const totalTransactions =
    transactions.length;

  const totalRevenue =
    transactions.reduce(
      (total, transaction) =>
        total +
        Number(transaction.total || 0),
      0
    );

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("Ringkasan Transaksi", 40, doc.y);

  doc.moveDown(0.5);

  doc
    .font("Helvetica")
    .fontSize(9)
    .text(
      `Total Transaksi : ${totalTransactions}`,
      40,
      doc.y
    );

  // formatPrice() sudah otomatis menyertakan "Rp".
  doc.text(
    `Total Pendapatan: ${formatPrice(
      totalRevenue
    )}`,
    40,
    doc.y
  );

  doc.moveDown(0.6);

  // Garis panjang di bawah Ringkasan Transaksi
  doc
    .moveTo(40, doc.y)
    .lineTo(555, doc.y)
    .lineWidth(0.5)
    .stroke();

  doc.moveDown(1.4);

  let y = drawTableHeader(
    doc,
    transactionColumns,
    doc.y
  );

  if (transactions.length === 0) {
    doc
      .font("Helvetica")
      .fontSize(9)
      .text(
        "Belum ada transaksi.",
        40,
        y
      );
  }

  for (const [index, transaction] of transactions.entries()) {
    if (y > 720) {
      doc.addPage();

      addHeader(
        doc,
        "LAPORAN TRANSAKSI",
        userName
      );

      y = drawTableHeader(
        doc,
        transactionColumns,
        doc.y
      );
    }

    writeTransactionRow(
      doc,
      transaction,
      y,
      index
    );

    y += 28;
  }

  return documentToBuffer(doc);
}

/**
 * =========================================================
 * ALL REPORT
 * =========================================================
 *
 * Struktur:
 *
 * HALAMAN 1
 * - Ringkasan produk
 * - Ringkasan transaksi
 *
 * HALAMAN 2+
 * - Produk
 *
 * HALAMAN berikutnya
 * - Transaksi
 *
 * Tidak ada halaman tambahan kecuali memang diperlukan.
 * =========================================================
 */

export async function generateAllReport(
  data = {}
) {
  const {
    products = [],
    transactions = [],
    userName = "User",
  } = data;

  const doc = createDocument();

  /**
   * =====================================================
   * HALAMAN 1
   * RINGKASAN
   * =====================================================
   */

  addHeader(
    doc,
    "LAPORAN PRODUK &TRANSAKSI",
    userName
  );

  const totalProducts =
    products.length;

  const totalStock =
    products.reduce(
      (total, product) =>
        total +
        Number(product.stock || 0),
      0
    );

  const lowStock =
    products.filter(
      (product) =>
        Number(product.stock || 0) <= 5
    ).length;

  const totalTransactions =
    transactions.length;

  const totalRevenue =
    transactions.reduce(
      (total, transaction) =>
        total +
        Number(transaction.total || 0),
      0
    );

  /**
   * =====================================================
   * RINGKASAN
   * POSISI POJOK KIRI
   * =====================================================
   */

  const summaryX = 40;
  const summaryWidth = 250;
  let summaryY = doc.y;

  /**
   * ============================
   * RINGKASAN PRODUK
   * ============================
   */

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(
      "Ringkasan Produk",
      summaryX,
      summaryY,
      {
        width: summaryWidth,
        align: "left",
      }
    );

  summaryY = doc.y + 4;

  doc
    .font("Helvetica")
    .fontSize(9)
    .text(
      `Total Produk : ${totalProducts}`,
      summaryX,
      summaryY,
      {
        width: summaryWidth,
        align: "left",
      }
    );

  summaryY = doc.y;

  doc.text(
    `Total Stok : ${totalStock}`,
    summaryX,
    summaryY,
    {
      width: summaryWidth,
      align: "left",
    }
  );

  summaryY = doc.y;

  doc.text(
    `Stok Menipis : ${lowStock}`,
    summaryX,
    summaryY,
    {
      width: summaryWidth,
      align: "left",
    }
  );

  /**
   * ============================
   * GARIS PANJANG DI BAWAH
   * RINGKASAN PRODUK
   * ============================
   */

  summaryY = doc.y + 8;

  doc
    .moveTo(40, summaryY)
    .lineTo(555, summaryY)
    .lineWidth(0.5)
    .stroke();

  summaryY += 12;

  /**
   * ============================
   * RINGKASAN TRANSAKSI
   * ============================
   */

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(
      "Ringkasan Transaksi",
      summaryX,
      summaryY,
      {
        width: summaryWidth,
        align: "left",
      }
    );

  summaryY = doc.y + 4;

  doc
    .font("Helvetica")
    .fontSize(9)
    .text(
      `Total Transaksi : ${totalTransactions}`,
      summaryX,
      summaryY,
      {
        width: summaryWidth,
        align: "left",
      }
    );

  summaryY = doc.y;

  doc.text(
    `Total Pendapatan: ${formatPrice(totalRevenue)}`,
    summaryX,
    summaryY,
    {
      width: summaryWidth,
      align: "left",
    }
  );

  /**
   * ============================
   * GARIS PANJANG DI BAWAH
   * RINGKASAN TRANSAKSI
   * ============================
   */

  summaryY = doc.y + 8;

  doc
    .moveTo(40, summaryY)
    .lineTo(555, summaryY)
    .lineWidth(0.5)
    .stroke();

  /**
   * =====================================================
   * HALAMAN PRODUK
   * =====================================================
   */

  /**
 * =====================================================
 * HALAMAN PRODUK
 * =====================================================
 */

if (products.length > 0) {
  doc.addPage();

  addHeader(
    doc,
    "LAPORAN PRODUK",
    userName
  );

  let y = drawTableHeader(
    doc,
    productColumns,
    doc.y
  );

  for (const [index, product] of products.entries()) {
    if (y > 720) {
      doc.addPage();

      addHeader(
        doc,
        "LAPORAN PRODUK",
        userName
      );

      y = drawTableHeader(
        doc,
        productColumns,
        doc.y
      );
    }

    writeProductRow(
      doc,
      product,
      y,
      index
    );

    y += 28;
  }
}

/**
 * =====================================================
 * HALAMAN TRANSAKSI
 * =====================================================
 */

if (transactions.length > 0) {
  doc.addPage();

  addHeader(
    doc,
    "LAPORAN TRANSAKSI",
    userName
  );

  let y = drawTableHeader(
    doc,
    transactionColumns,
    doc.y
  );

  for (const [index, transaction] of transactions.entries()) {
    if (y > 720) {
      doc.addPage();

      addHeader(
        doc,
        "LAPORAN TRANSAKSI",
        userName
      );

      y = drawTableHeader(
        doc,
        transactionColumns,
        doc.y
      );
    }

    writeTransactionRow(
      doc,
      transaction,
      y,
      index
    );

    y += 28;
  }
}
return documentToBuffer(doc);
}