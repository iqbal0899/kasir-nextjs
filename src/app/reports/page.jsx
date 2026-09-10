"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/shared/utils/formatDate";

import styles from "@/frontend/css/report.module.css";

import Sidebar from "@/frontend/components/shared/Sidebar";
import Navbar from "@/frontend/components/shared/Navbar";

export default function ReportsPage() {
  const [products, setProducts] = useState([]);

  const [transactions, setTransactions] = useState([]);

  const [user, setUser] = useState(null);

  const [loadingProducts, setLoadingProducts] = useState(true);

  const [loadingTransactions, setLoadingTransactions] = useState(true);

  const [productError, setProductError] = useState("");

  const [transactionError, setTransactionError] = useState("");

  const [search, setSearch] = useState("");

  // ===============================
// PAGINATION PRODUK
// ===============================
const [productPage, setProductPage] = useState(1);

const [productLimit, setProductLimit] = useState(10);

const [productPagination, setProductPagination] = useState({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
});

// ===============================
// PAGINATION TRANSAKSI
// ===============================
const [transactionPage, setTransactionPage] = useState(1);

const [transactionLimit, setTransactionLimit] = useState(10);

const [transactionPagination, setTransactionPagination] = useState({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
});

  const [startDate, setStartDate] = useState("");

  const [endDate, setEndDate] = useState("");



 const fetchProducts = async () => {
  try {
    setLoadingProducts(true);
    setProductError("");

    const params = new URLSearchParams({
      page: String(productPage),
      limit: String(productLimit),
    });

    if (startDate) {
      params.append("startDate", startDate);
    }

    if (endDate) {
      params.append("endDate", endDate);
    }

    const response = await fetch(
      `/api/v1/products?${params.toString()}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    const result = await response.json();

    console.log("PRODUCT REPORT:", result);

    if (!response.ok) {
      throw new Error(
        result.message ||
          "Gagal mengambil data produk"
      );
    }

    setProducts(result.data || []);

    setProductPagination(
      result.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      }
    );
  } catch (error) {
    console.error(
      "PRODUCTS REPORT ERROR:",
      error
    );

    setProductError(
      error.message ||
        "Gagal mengambil data produk"
    );
  } finally {
    setLoadingProducts(false);
  }
};

useEffect(() => {
  const loadProducts = async () => {
    await fetchProducts();
  };

  loadProducts();
}, [
  productPage,
  productLimit,
  startDate,
  endDate,
]);

  const fetchTransactions = async () => {
  try {
    setLoadingTransactions(true);
    setTransactionError("");

    const params = new URLSearchParams({
      page: String(transactionPage),
      limit: String(transactionLimit),
    });

    if (startDate) {
      params.append("startDate", startDate);
    }

    if (endDate) {
      params.append("endDate", endDate);
    }

    const response = await fetch(
      `/api/v1/transactions?${params.toString()}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    const result = await response.json();

    console.log(
      "TRANSACTION REPORT:",
      result
    );

    if (!response.ok) {
      throw new Error(
        result.message ||
          "Gagal mengambil data transaksi"
      );
    }

    setTransactions(result.data || []);

    setTransactionPagination(
      result.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      }
    );
  } catch (error) {
    console.error(
      "TRANSACTION REPORT ERROR:",
      error
    );

    setTransactionError(
      error.message ||
        "Gagal mengambil data transaksi"
    );
  } finally {
    setLoadingTransactions(false);
  }
};

 useEffect(() => {
  const loadTransactions = async () => {
    await fetchTransactions();
  };

  loadTransactions();
}, [
  transactionPage,
  transactionLimit,
  startDate,
  endDate,
]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      console.log("USER LOGIN:", parsedUser);

      setUser(parsedUser);
    } catch (error) {
      console.error("USER DATA ERROR:", error);

      localStorage.removeItem("user");
    }
  }, []);

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString("id-ID");
  };

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (total, product) => total + Number(product.stock || 0),
    0,
  );

  const readyStock = products.filter(
    (product) => Number(product.stock || 0) > 30
  ).length

  const lowStock = products.filter(
    (product) => Number(product.stock || 0) > 0 &&
                 Number(product.stock || 0) <= 30
    ).length;

  const emptyStock = products.filter(
    (product) => Number(product.stock || 0) === 0,
  ).length

  const totalTransactions = transactions.length;

  const totalRevenue = transactions.reduce(
    (total, transaction) => total + Number(transaction.total || 0),
    0,
  );

  const handlePrint = (type) => {
  const params = new URLSearchParams();

  params.set("type", type);

  if (startDate) {
    params.set("startDate", startDate);
  }

  if (endDate) {
    params.set("endDate", endDate);
  }

  const url = `/api/v1/reports/pdf?${params.toString()}`;

  window.open(url, "_blank", "noopener,noreferrer");
};

  const handleLogout = () => {
    localStorage.removeItem("token");

    localStorage.removeItem("user");

    window.location.href = "/auth/login";
  };

  return (
    <div className="app-shell">
      <div className={styles.noPrint}>
        <Sidebar role={user?.role || "cashier"} />
      </div>

      <div className="app-main">
        <div className={styles.noPrint}>
          <Navbar
            storeName="Toko Iqbal"
            userName={user?.username || "User"}
            userRole={user?.role || "cashier"}
            onLogout={handleLogout}
          />
        </div>

        <main className={styles.container}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Laporan</h1>

              <p className={styles.subtitle}>
                Laporan produk dan transaksi Toko Iqbal
              </p>
            </div>

            {/* PRINT ALL */}

            <button
              type="button"
              className={styles.printButton}
              onClick={() => handlePrint("all")}
            >
              🖨️ Print Laporan
            </button>
          </div>

          <section className={styles.section}>
            {/* SECTION HEADER */}

            <div className={styles.sectionHeader}>
              <div>
                <h2>Laporan Produk</h2>

                <p>Ringkasan produk dan persediaan</p>
              </div>

              {/* PRINT PRODUCT */}

              <button
                type="button"
                className={styles.printButton}
                onClick={() => handlePrint("product")}
              >
                🖨️ Print Produk
              </button>
            </div>

            <div className={styles.toolbar}>

    <div className={styles.filterContainer}>

      <div className={styles.filterGroup}>
        <label htmlFor="startDate">
          Dari tanggal
        </label>

        <input
          id="startDate"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="endDate">
          Sampai tanggal
        </label>

        <input
          id="endDate"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <button
  type="button"
  className={styles.filterButton}
  onClick={() => {
    setProductPage(1);
  }}
>
  Filter
</button>

      <button
  type="button"
  className={styles.resetButton}
  onClick={() => {
    setStartDate("");
    setEndDate("");
    setProductPage(1);
  }}
>
  Reset
</button>

    </div>

    <input
      type="text"
      className={styles.searchInput}
      placeholder="Cari transaksi..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
            </div>

            <div className={styles.cardsProduct}>
              <div className={styles.cardProduct}>
                <span>Total Produk</span>

                <strong>{loadingProducts ? "..." : totalProducts}</strong>
              </div>

              <div className={styles.cardProduct}>
                <span>Total Stock</span>

                <strong>{loadingProducts ? "..." : totalStock}</strong>
              </div>

              <div className={styles.cardProduct}>
                <span>Stock Menipis</span>

                <strong>{loadingProducts ? "..." : lowStock}</strong>
              </div>

              <div className={styles.cardProduct}>
                <span>Stock Habis</span>

                <strong>{loadingProducts ? "..." : emptyStock}</strong>
              </div>
            </div>

            {productError && <div className={styles.error}>{productError}</div>}

            {!loadingProducts && !productError && (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>

                      <th>No.</th>

                      <th>ID</th>

                      <th>Produk</th>

                      <th>Kategori</th>

                      <th>Harga</th>

                      <th>Stock Terjual</th>

                      <th>Stock Tersisa</th>

                      <th>Status</th>
                    </tr>
                  </thead>

<tbody>
  {products.length === 0 ? (
    <tr>
      <td colSpan="8" className={styles.empty}>
        Belum ada produk.
      </td>
    </tr>
  ) : (
    products.map((product, index) => (
      <tr key={product.id}>
        <td>{index + 1}</td>

        <td>{product.id}</td>

        <td>
          <strong>{product.name}</strong>
        </td>

        <td>{product.category || "Tanpa kategori"}</td>

        <td>Rp {formatPrice(product.price)}</td>

        {/* STOK TERJUAL */}
        <td>{product.soldStock || 0}</td>

        {/* STOK TERSISA */}
        <td>{product.stock}</td>

        {/* STATUS */}
        <td>
          {Number(product.stock) === 0 ? (
            <span className={styles.danger}>
              Stok Habis
            </span>
          ) : Number(product.stock) <= 30 ? (
            <span className={styles.warning}>
              Stok Menipis
            </span>
          ) : (
            <span className={styles.success}>
              Tersedia
            </span>
          )}
        </td>
      </tr>
    ))
  )}
</tbody>
                </table>
              </div>
              
            )}

            <div className={styles.pagination}>
  <button
    type="button"
    onClick={() =>
      setProductPage((prev) =>
        Math.max(prev - 1, 1)
      )
    }
    disabled={productPage === 1}
  >
    Previous
  </button>

  <span>
    Halaman {productPagination.page} dari{" "}
    {productPagination.totalPages || 1}
  </span>

  <button
    type="button"
    onClick={() =>
      setProductPage((prev) => prev + 1)
    }
    disabled={
      productPage >=
      productPagination.totalPages
    }
  >
    Next
  </button>
</div>
          </section>

          <section className={styles.section}>
            {/* SECTION HEADER */}

              <div className={styles.sectionHeader}>
    <div>
      <h2>Laporan Transaksi</h2>
      <p>Ringkasan transaksi penjualan</p>
    </div>

    <button
      type="button"
      className={styles.printButton}
      onClick={() => handlePrint("transaction")}
    >
      🖨️ Print Transaksi
    </button>
  </div>

  <div className={styles.toolbar}>

    <div className={styles.filterContainer}>

      <div className={styles.filterGroup}>
        <label htmlFor="startDate">
          Dari tanggal
        </label>

        <input
          id="startDate"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="endDate">
          Sampai tanggal
        </label>

        <input
          id="endDate"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <button
        type="button"
        className={styles.filterButton}
        onClick={fetchTransactions}
      >
        Filter
      </button>

      <button
        type="button"
        className={styles.resetButton}
        onClick={() => {
          setStartDate("");
          setEndDate("");
        }}
      >
        Reset
      </button>

    </div>

    <input
      type="text"
      className={styles.searchInput}
      placeholder="Cari transaksi..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
            </div>

            {/* PRINT TRANSACTION */}

            

            <div className={styles.cardsTransaction}>
              <div className={styles.cardTransaction}>
                <span>Total Transaksi</span>

                <strong>
                  {loadingTransactions ? "..." : totalTransactions}
                </strong>
              </div>

              <div className={styles.cardTransaction}>
                <span>Pendapatan</span>

                <strong>
                  Rp {loadingTransactions ? "..." : formatPrice(totalRevenue)}
                </strong>
              </div>
            </div>

            {transactionError && (
              <div className={styles.error}>{transactionError}</div>
            )}

            {!loadingTransactions && !transactionError && (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>No.</th>
                      
                      <th>ID</th>

                      <th>Tanggal</th>

                      <th>Kasir</th>

                      <th>Total</th>

                      <th>Metode</th>
                    </tr>
                  </thead>

                  <tbody>
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan="6" className={styles.empty}>
                          Belum ada transaksi.
                        </td>
                      </tr>
                    ) : (
                      transactions.map((transaction, index) => (
                        <tr key={transaction.id}>

                          <td>{index + 1}</td>

                          <td>{transaction.id}</td>

                          <td>{formatDate(transaction.createdAt)}</td>

                          <td>{transaction.cashier?.username || "-"}</td>

                          <td>
                            <strong>Rp {formatPrice(transaction.total)}</strong>
                          </td>

                          <td>{transaction.paymentMethod || "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
            <div className={styles.pagination}>
  <button
    type="button"
    onClick={() =>
      setTransactionPage((prev) =>
        Math.max(prev - 1, 1)
      )
    }
    disabled={transactionPage === 1}
  >
    Previous
  </button>

  <span>
    Halaman {transactionPagination.page} dari{" "}
    {transactionPagination.totalPages || 1}
  </span>

  <button
    type="button"
    onClick={() =>
      setTransactionPage((prev) => prev + 1)
    }
    disabled={
      transactionPage >=
      transactionPagination.totalPages
    }
  >
    Next
  </button>
</div>

          </section>
        </main>
      </div>
    </div>
  );
}
