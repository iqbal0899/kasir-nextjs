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
    label: "ID",
    x: 40,
    width: 35,
  },
  {
    label: "Produk",
    x: 75,
    width: 130,
  },
  {
    label: "Kategori",
    x: 205,
    width: 100,
  },
  {
    label: "Harga",
    x: 235,
    width: 90,
    align: "right",
  },
  {
    label: "Stock",
    x: 340,
    width: 60,
    align: "right",
  },
  {
    label: "Status",
    x: 455,
    width: 100,
  },
];

/**
 * =========================================================
 * TRANSACTION COLUMNS
 * =========================================================
 */

const transactionColumns = [
  {
    label: "ID",
    x: 40,
    width: 45,
  },
  {
    label: "Tanggal",
    x: 85,
    width: 115,
  },
  {
    label: "Kasir",
    x: 200,
    width: 100,
  },
  {
    label: "Total",
    x: 235,
    width: 100,
    align: "right",
  },
  {
    label: "Metode",
    x: 400,
    width: 90,
  },
];

/**
 * =========================================================
 * WRITE PRODUCT ROW
 * =========================================================
 */

function writeProductRow(doc, product, y) {
  const stock = Number(product.stock || 0);

  const status =
    stock <= 5
      ? "Menipis"
      : "Tersedia";

  doc
    .font("Helvetica")
    .fontSize(8);

  doc.text(
    String(product.id ?? "-"),
    40,
    y,
    {
      width: 35,
    }
  );

  doc.text(
    product.name || "-",
    75,
    y,
    {
      width: 130,
    }
  );

  doc.text(
    product.category || "Tanpa kategori",
    205,
    y,
    {
      width: 100,
    }
  );

  // formatPrice() sudah otomatis menyertakan "Rp", jadi tidak perlu
  // ditambahkan lagi di sini (dulu ada bug "Rp Rp xxx").
  doc.text(
    formatPrice(product.price),
    245,
    y,
    {
      width: 90,
      align: "right",
    }
  );

  doc.text(
    String(stock),
    332,
    y,
    {
      width: 60,
      align: "right",
    }
  );

  doc.text(
    status,
    455,
    y,
    {
      width: 100,
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
  y
) {
  doc
    .font("Helvetica")
    .fontSize(8);

  // ID
  doc.text(
    String(transaction.id ?? "-"),
    40,
    y,
    {
      width: 45,
    }
  );

  // TANGGAL
  doc.text(
    formatDate(transaction.createdAt),
    85,
    y,
    {
      width: 115,
    }
  );

  // KASIR
  doc.text(
    transaction.cashier?.username ||
      transaction.cashierName ||
      "-",
    200,
    y,
    {
      width: 100,
    }
  );

  // TOTAL
  // formatPrice() sudah otomatis menyertakan "Rp".
  doc.text(
    formatPrice(transaction.total),
    255,
    y,
    {
      width: 100,
      align: "right",
    }
  );

  // METODE
  const method =
    transaction.paymentMethod === "cash"
      ? "Tunai"
      : transaction.paymentMethod === "qris"
      ? "QRIS"
      : transaction.paymentMethod || "-";

  doc.text(
    method,
    405,
    y,
    {
      width: 90,
    }
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
    .text("Ringkasan Produk");

  doc.moveDown(0.5);

  // Digabung jadi satu baris (dulu 3 baris terpisah)
  doc
    .font("Helvetica")
    .fontSize(9)
    .text(
      `Total Produk : ${totalProducts}    Total Stock : ${totalStock}    Stock Menipis : ${lowStock}`
    );

  doc.moveDown(1);

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

  for (const product of products) {
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
      y
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
    .text("Ringkasan Transaksi");

  doc.moveDown(0.5);

  doc
    .font("Helvetica")
    .fontSize(9)
    .text(
      `Total Transaksi : ${totalTransactions}`
    );

  // formatPrice() sudah otomatis menyertakan "Rp".
  doc.text(
    `Total Pendapatan: ${formatPrice(
      totalRevenue
    )}`
  );

  doc.moveDown(1);

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

  for (const transaction of transactions) {
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
      y
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
   * RINGKASAN — ditempatkan di pojok kanan atas
   */

  const summaryX = 40;
  const summaryWidth = 165;
  let summaryY = doc.y;

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .text("Ringkasan Produk", summaryX, summaryY, {
      width: summaryWidth,
    });

  summaryY = doc.y + 4;

  doc
    .font("Helvetica")
    .fontSize(9)
    .text(`Total Produk  : ${totalProducts}`, summaryX, summaryY, {
      width: summaryWidth,
    });

  summaryY = doc.y;

  doc.text(`Total Stock   : ${totalStock}`, summaryX, summaryY, {
    width: summaryWidth,
  });

  summaryY = doc.y;

  doc.text(`Stock Menipis : ${lowStock}`, summaryX, summaryY, {
    width: summaryWidth,
  });

  summaryY = doc.y + 14;

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .text("Ringkasan Transaksi", summaryX, summaryY, {
      width: summaryWidth,
    });

  summaryY = doc.y + 4;

  doc
    .font("Helvetica")
    .fontSize(9)
    .text(`Total Transaksi : ${totalTransactions}`, summaryX, summaryY, {
      width: summaryWidth,
    });

  summaryY = doc.y;

  // formatPrice() sudah otomatis menyertakan "Rp".
  doc.text(
    `Total Pendapatan: ${formatPrice(totalRevenue)}`,
    summaryX,
    summaryY,
    {
      width: summaryWidth,
    }
  );

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

    for (const product of products) {
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
        y
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

    for (const transaction of transactions) {
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
        y
      );

      y += 28;
    }
  }

  return documentToBuffer(doc);
}