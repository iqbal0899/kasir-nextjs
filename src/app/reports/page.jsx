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

const [productPage, setProductPage] = useState(1);
const [productLimit, setProductLimit] = useState(10);

const [productPagination, setProductPagination] = useState({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
});

const [transactionPage, setTransactionPage] = useState(1);
const [transactionLimit, setTransactionLimit] = useState(10);

const [transactionPagination, setTransactionPagination] = useState({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
});

const [startDateProduct, setStartDateProduct] = useState("");
const [endDateProduct, setEndDateProduct] = useState("");

const [appliedStartDateProduct, setAppliedStartDateProduct] =
  useState("");

const [appliedEndDateProduct, setAppliedEndDateProduct] =
  useState("");

const [startDateTransaction, setStartDateTransaction] =
  useState("");

const [endDateTransaction, setEndDateTransaction] =
  useState("");

const [appliedStartDateTransaction, setAppliedStartDateTransaction] =
  useState("");

const [appliedEndDateTransaction, setAppliedEndDateTransaction] =
  useState("");


  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      setProductError("");

      const params = new URLSearchParams({
        page: String(productPage),
        limit: String(productLimit),
      });

      if (appliedStartDateProduct) {
        params.append(
          "startDateProduct",
          appliedStartDateProduct
        );
      }

      if (appliedEndDateProduct) {
        params.append(
          "endDateProduct",
          appliedEndDateProduct
        );
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

      // Jika API mengembalikan null, tetap menjadi array
      setProducts(
        Array.isArray(result.data)
          ? result.data
          : []
      );

      setProductPagination(
        result.pagination || {
          page: 1,
          limit: productLimit,
          total: 0,
          totalPages: 0,
        }
      );
    } catch (error) {
      console.error(
        "PRODUCTS REPORT ERROR:",
        error
      );

      setProducts([]);

      setProductPagination({
        page: 1,
        limit: productLimit,
        total: 0,
        totalPages: 0,
      });

      setProductError(
        error.message ||
          "Gagal mengambil data produk"
      );
    } finally {
      setLoadingProducts(false);
    }
  };


  useEffect(() => {
    fetchProducts();
  }, [
    productPage,
    productLimit,
    appliedStartDateProduct,
    appliedEndDateProduct,
  ]);

  const fetchTransactions = async () => {
    try {
      setLoadingTransactions(true);
      setTransactionError("");

      const params = new URLSearchParams({
        page: String(transactionPage),
        limit: String(transactionLimit),
      });

      // Gunakan FILTER YANG SUDAH DITERAPKAN
      if (appliedStartDateTransaction) {
        params.append(
          "startDateTransaction",
          appliedStartDateTransaction
        );
      }

      if (appliedEndDateTransaction) {
        params.append(
          "endDateTransaction",
          appliedEndDateTransaction
        );
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

      // Jika tidak ada data, paksa menjadi array kosong
      setTransactions(
        Array.isArray(result.data)
          ? result.data
          : []
      );

      setTransactionPagination(
        result.pagination || {
          page: 1,
          limit: transactionLimit,
          total: 0,
          totalPages: 0,
        }
      );
    } catch (error) {
      console.error(
        "TRANSACTION REPORT ERROR:",
        error
      );

      setTransactions([]);

      setTransactionPagination({
        page: 1,
        limit: transactionLimit,
        total: 0,
        totalPages: 0,
      });

      setTransactionError(
        error.message ||
          "Gagal mengambil data transaksi"
      );
    } finally {
      setLoadingTransactions(false);
    }
  };

  // =====================================================
  // FETCH TRANSACTIONS EFFECT
  // =====================================================

  useEffect(() => {
    fetchTransactions();
  }, [
    transactionPage,
    transactionLimit,
    appliedStartDateTransaction,
    appliedEndDateTransaction,
  ]);

  // =====================================================
  // USER LOGIN
  // =====================================================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      console.log(
        "USER LOGIN:",
        parsedUser
      );

      setUser(parsedUser);
    } catch (error) {
      console.error(
        "USER DATA ERROR:",
        error
      );

      localStorage.removeItem("user");
    }
  }, []);

  // =====================================================
  // HANDLE FILTER PRODUCT
  // =====================================================

  const handleFilterProduct = () => {
    // Jika hanya salah satu tanggal yang diisi,
    // tetap diperbolehkan.
    //
    // Contoh:
    // startDateProduct = 2026-01-01
    // endDateProduct   = ""
    //
    // Artinya dari 2026-01-01 sampai seterusnya.

    // Validasi tanggal
    if (
      startDateProduct &&
      endDateProduct &&
      startDateProduct > endDateProduct
    ) {
      setProductError(
        "Tanggal mulai tidak boleh lebih besar dari tanggal akhir."
      );

      setProducts([]);

      return;
    }

    setProductError("");

    // Reset halaman
    setProductPage(1);

    // Terapkan filter
    setAppliedStartDateProduct(
      startDateProduct
    );

    setAppliedEndDateProduct(
      endDateProduct
    );
  };

  // =====================================================
  // HANDLE FILTER TRANSACTION
  // =====================================================

  const handleFilterTransaction = () => {
    // Validasi tanggal
    if (
      startDateTransaction &&
      endDateTransaction &&
      startDateTransaction > endDateTransaction
    ) {
      setTransactionError(
        "Tanggal mulai tidak boleh lebih besar dari tanggal akhir."
      );

      setTransactions([]);

      return;
    }

    setTransactionError("");

    // Reset halaman
    setTransactionPage(1);

    // Terapkan filter
    setAppliedStartDateTransaction(
      startDateTransaction
    );

    setAppliedEndDateTransaction(
      endDateTransaction
    );
  };

  // =====================================================
  // RESET FILTER PRODUCT
  // =====================================================

  const handleResetProduct = () => {
    setStartDateProduct("");
    setEndDateProduct("");

    setAppliedStartDateProduct("");
    setAppliedEndDateProduct("");

    setProductPage(1);
    setProductError("");
  };

  // =====================================================
  // RESET FILTER TRANSACTION
  // =====================================================

  const handleResetTransaction = () => {
    setStartDateTransaction("");
    setEndDateTransaction("");

    setAppliedStartDateTransaction("");
    setAppliedEndDateTransaction("");

    setTransactionPage(1);
    setTransactionError("");
  };

  // =====================================================
  // FORMAT PRICE
  // =====================================================

  const formatPrice = (price) => {
    return Number(
      price || 0
    ).toLocaleString("id-ID");
  };

  // =====================================================
  // PRODUCT SUMMARY
  // =====================================================

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (total, product) =>
      total +
      Number(product.stock || 0),
    0
  );

  const readyStock = products.filter(
    (product) =>
      Number(product.stock || 0) > 30
  ).length;

  const lowStock = products.filter(
    (product) =>
      Number(product.stock || 0) > 0 &&
      Number(product.stock || 0) <= 30
  ).length;

  const emptyStock = products.filter(
    (product) =>
      Number(product.stock || 0) === 0
  ).length;

  // =====================================================
  // TRANSACTION SUMMARY
  // =====================================================

  const totalTransactions =
    transactions.length;

  const totalRevenue =
    transactions.reduce(
      (total, transaction) =>
        total +
        Number(
          transaction.totalAmount || 0
        ),
      0
    );

  // =====================================================
  // PRINT
  // =====================================================

  const handlePrint = (type) => {
    const params =
      new URLSearchParams();

    params.set("type", type);

    // FILTER PRODUK
    if (
      appliedStartDateProduct
    ) {
      params.set(
        "startDateProduct",
        appliedStartDateProduct
      );
    }

    if (
      appliedEndDateProduct
    ) {
      params.set(
        "endDateProduct",
        appliedEndDateProduct
      );
    }

    // FILTER TRANSAKSI
    if (
      appliedStartDateTransaction
    ) {
      params.set(
        "startDateTransaction",
        appliedStartDateTransaction
      );
    }

    if (
      appliedEndDateTransaction
    ) {
      params.set(
        "endDateTransaction",
        appliedEndDateTransaction
      );
    }

    const url =
      `/api/v1/reports/pdf?${params.toString()}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href =
      "/auth/login";
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="app-shell">
      {/* SIDEBAR */}
      <div className={styles.noPrint}>
        <Sidebar
          role={
            user?.role || "cashier"
          }
        />
      </div>

      <div className="app-main">
        {/* NAVBAR */}
        <div className={styles.noPrint}>
          <Navbar
            storeName="Toko Iqbal"
            userName={
              user?.username || "User"
            }
            userRole={
              user?.role || "cashier"
            }
            onLogout={handleLogout}
          />
        </div>

        <main
          className={styles.container}
        >
          {/* =====================================================
              HEADER
          ===================================================== */}

          <div className={styles.header}>
            <div>
              <h1
                className={styles.title}
              >
                Laporan
              </h1>

              <p
                className={
                  styles.subtitle
                }
              >
                Laporan produk dan
                transaksi Toko Iqbal
              </p>
            </div>

            <button
              type="button"
              className={
                styles.printButton
              }
              onClick={() =>
                handlePrint("all")
              }
            >
              🖨️ Print Laporan
            </button>
          </div>

          {/* =====================================================
              LAPORAN PRODUK
          ===================================================== */}

          <section
            className={styles.section}
          >
            <div
              className={
                styles.sectionHeader
              }
            >
              <div>
                <h2>
                  Laporan Produk
                </h2>

                <p>
                  Ringkasan produk
                  dan persediaan
                </p>
              </div>

              <button
                type="button"
                className={
                  styles.printButton
                }
                onClick={() =>
                  handlePrint(
                    "product"
                  )
                }
              >
                🖨️ Print Produk
              </button>
            </div>

            {/* FILTER PRODUK */}

            <div
              className={
                styles.toolbar
              }
            >
              <div
                className={
                  styles.filterContainer
                }
              >
                <div
                  className={
                    styles.filterGroup
                  }
                >
                  <label htmlFor="startDateProduct">
                    Dari tanggal
                  </label>

                  <input
                    id="startDateProduct"
                    type="date"
                    value={
                      startDateProduct
                    }
                    onChange={(e) =>
                      setStartDateProduct(
                        e.target.value
                      )
                    }
                  />
                </div>

                <div
                  className={
                    styles.filterGroup
                  }
                >
                  <label htmlFor="endDateProduct">
                    Sampai tanggal
                  </label>

                  <input
                    id="endDateProduct"
                    type="date"
                    value={
                      endDateProduct
                    }
                    onChange={(e) =>
                      setEndDateProduct(
                        e.target.value
                      )
                    }
                  />
                </div>

                <button
                  type="button"
                  className={
                    styles.filterButton
                  }
                  onClick={
                    handleFilterProduct
                  }
                >
                  Filter
                </button>

                <button
                  type="button"
                  className={
                    styles.resetButton
                  }
                  onClick={
                    handleResetProduct
                  }
                >
                  Reset
                </button>
              </div>

              <input
                type="text"
                className={
                  styles.searchInput
                }
                placeholder="Cari produk..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />
            </div>

            {/* CARD PRODUK */}

            <div
              className={
                styles.cardsProduct
              }
            >
              <div
                className={
                  styles.cardProduct
                }
              >
                <span>
                  Total Produk
                </span>

                <strong>
                  {loadingProducts
                    ? "..."
                    : totalProducts}
                </strong>
              </div>

              <div
                className={
                  styles.cardProduct
                }
              >
                <span>
                  Total Stock
                </span>

                <strong>
                  {loadingProducts
                    ? "..."
                    : totalStock}
                </strong>
              </div>

              <div
                className={
                  styles.cardProduct
                }
              >
                <span>
                  Stock Menipis
                </span>

                <strong>
                  {loadingProducts
                    ? "..."
                    : lowStock}
                </strong>
              </div>

              <div
                className={
                  styles.cardProduct
                }
              >
                <span>
                  Stock Habis
                </span>

                <strong>
                  {loadingProducts
                    ? "..."
                    : emptyStock}
                </strong>
              </div>
            </div>

            {/* ERROR PRODUK */}

            {productError && (
              <div
                className={
                  styles.error
                }
              >
                {productError}
              </div>
            )}

            {/* TABLE PRODUK */}

            {!loadingProducts &&
              !productError && (
                <div
                  className={
                    styles.tableWrapper
                  }
                >
                  <table
                    className={
                      styles.table
                    }
                  >
                    <thead>
                      <tr>
                        <th>
                          No.
                        </th>

                        <th>
                          ID
                        </th>

                        <th>
                          Produk
                        </th>

                        <th>
                          Kategori
                        </th>

                        <th>
                          Harga
                        </th>

                        <th>
                          Stock Terjual
                        </th>

                        <th>
                          Stock Tersisa
                        </th>

                        <th>
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {products.length ===
                      0 ? (
                        <tr>
                          <td
                            colSpan="8"
                            className={
                              styles.empty
                            }
                          >
                            Data produk tidak
                            ada pada tanggal
                            yang dipilih.
                          </td>
                        </tr>
                      ) : (
                        products.map(
                          (
                            product,
                            index
                          ) => (
                            <tr
                              key={
                                product.id
                              }
                            >
                              <td>
                                {(productPage -
                                  1) *
                                  productLimit +
                                  index +
                                  1}
                              </td>

                              <td>
                                {
                                  product.id
                                }
                              </td>

                              <td>
                                <strong>
                                  {
                                    product.name
                                  }
                                </strong>
                              </td>

                              <td>
                                {product.category ||
                                  "Tanpa kategori"}
                              </td>

                              <td>
                                Rp{" "}
                                {formatPrice(
                                  product.price
                                )}
                              </td>

                              <td>
                                {product.soldStock ||
                                  0}
                              </td>

                              <td>
                                {
                                  product.stock
                                }
                              </td>

                              <td>
                                {Number(
                                  product.stock
                                ) === 0 ? (
                                  <span
                                    className={
                                      styles.danger
                                    }
                                  >
                                    Stok Habis
                                  </span>
                                ) : Number(
                                    product.stock
                                  ) <= 30 ? (
                                  <span
                                    className={
                                      styles.warning
                                    }
                                  >
                                    Stok Menipis
                                  </span>
                                ) : (
                                  <span
                                    className={
                                      styles.success
                                    }
                                  >
                                    Tersedia
                                  </span>
                                )}
                              </td>
                            </tr>
                          )
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}

            {/* PAGINATION PRODUK */}

            <div
              className={
                styles.pagination
              }
            >
              <button
                type="button"
                onClick={() =>
                  setProductPage(
                    (prev) =>
                      Math.max(
                        prev - 1,
                        1
                      )
                  )
                }
                disabled={
                  productPage ===
                  1
                }
              >
                Previous
              </button>

              <span>
                Halaman{" "}
                {
                  productPagination.page
                }{" "}
                dari{" "}
                {
                  productPagination.totalPages ||
                    1
                }
              </span>

              <button
                type="button"
                onClick={() =>
                  setProductPage(
                    (prev) =>
                      prev + 1
                  )
                }
                disabled={
                  productPagination.totalPages ===
                    0 ||
                  productPage >=
                    productPagination.totalPages
                }
              >
                Next
              </button>
            </div>
          </section>

          {/* =====================================================
              LAPORAN TRANSAKSI
          ===================================================== */}

          <section
            className={styles.section}
          >
            <div
              className={
                styles.sectionHeader
              }
            >
              <div>
                <h2>
                  Laporan Transaksi
                </h2>

                <p>
                  Ringkasan transaksi
                  penjualan
                </p>
              </div>

              <button
                type="button"
                className={
                  styles.printButton
                }
                onClick={() =>
                  handlePrint(
                    "transaction"
                  )
                }
              >
                🖨️ Print Transaksi
              </button>
            </div>

            {/* FILTER TRANSAKSI */}

            <div
              className={
                styles.toolbar
              }
            >
              <div
                className={
                  styles.filterContainer
                }
              >
                <div
                  className={
                    styles.filterGroup
                  }
                >
                  <label htmlFor="startDateTransaction">
                    Dari tanggal
                  </label>

                  <input
                    id="startDateTransaction"
                    type="date"
                    value={
                      startDateTransaction
                    }
                    onChange={(e) =>
                      setStartDateTransaction(
                        e.target.value
                      )
                    }
                  />
                </div>

                <div
                  className={
                    styles.filterGroup
                  }
                >
                  <label htmlFor="endDateTransaction">
                    Sampai tanggal
                  </label>

                  <input
                    id="endDateTransaction"
                    type="date"
                    value={
                      endDateTransaction
                    }
                    onChange={(e) =>
                      setEndDateTransaction(
                        e.target.value
                      )
                    }
                  />
                </div>

                <button
                  type="button"
                  className={
                    styles.filterButton
                  }
                  onClick={
                    handleFilterTransaction
                  }
                >
                  Filter
                </button>

                <button
                  type="button"
                  className={
                    styles.resetButton
                  }
                  onClick={
                    handleResetTransaction
                  }
                >
                  Reset
                </button>
              </div>

              <input
                type="text"
                className={
                  styles.searchInput
                }
                placeholder="Cari transaksi..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />
            </div>

            {/* CARD TRANSAKSI */}

            <div
              className={
                styles.cardsTransaction
              }
            >
              <div
                className={
                  styles.cardTransaction
                }
              >
                <span>
                  Total Transaksi
                </span>

                <strong>
                  {loadingTransactions
                    ? "..."
                    : totalTransactions}
                </strong>
              </div>

              <div
                className={
                  styles.cardTransaction
                }
              >
                <span>
                  Pendapatan
                </span>

                <strong>
                  Rp{" "}
                  {loadingTransactions
                    ? "..."
                    : formatPrice(
                        totalRevenue
                      )}
                </strong>
              </div>
            </div>

            {/* ERROR TRANSAKSI */}

            {transactionError && (
              <div
                className={
                  styles.error
                }
              >
                {transactionError}
              </div>
            )}

            {/* TABLE TRANSAKSI */}

            {!loadingTransactions &&
              !transactionError && (
                <div
                  className={
                    styles.tableWrapper
                  }
                >
                  <table
                    className={
                      styles.table
                    }
                  >
                    <thead>
                      <tr>
                        <th>
                          No.
                        </th>

                        <th>
                          ID
                        </th>

                        <th>
                          Tanggal
                        </th>

                        <th>
                          Kasir
                        </th>

                        <th>
                          Total
                        </th>

                        <th>
                          Metode
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {transactions.length ===
                      0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            className={
                              styles.empty
                            }
                          >
                            Data transaksi tidak
                            ada pada tanggal
                            yang dipilih.
                          </td>
                        </tr>
                      ) : (
                        transactions.map(
                          (
                            transaction,
                            index
                          ) => (
                            <tr
                              key={
                                transaction.id
                              }
                            >
                              <td>
                                {(transactionPage -
                                  1) *
                                  transactionLimit +
                                  index +
                                  1}
                              </td>

                              <td>
                                {
                                  transaction.id
                                }
                              </td>

                              <td>
                                {formatDate(
                                  transaction.createdAt
                                )}
                              </td>

                              <td>
                                {transaction
                                  .cashier
                                  ?.username ||
                                  "-"}
                              </td>

                              <td>
                                <strong>
                                  Rp{" "}
                                  {formatPrice(
                                    transaction.totalAmount
                                  )}
                                </strong>
                              </td>

                              <td>
                                {transaction.paymentMethod ||
                                  "-"}
                              </td>
                            </tr>
                          )
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}

            {/* PAGINATION TRANSAKSI */}

            <div
              className={
                styles.pagination
              }
            >
              <button
                type="button"
                onClick={() =>
                  setTransactionPage(
                    (prev) =>
                      Math.max(
                        prev - 1,
                        1
                      )
                  )
                }
                disabled={
                  transactionPage ===
                  1
                }
              >
                Previous
              </button>

              <span>
                Halaman{" "}
                {
                  transactionPagination.page
                }{" "}
                dari{" "}
                {
                  transactionPagination.totalPages ||
                    1
                }
              </span>

              <button
                type="button"
                onClick={() =>
                  setTransactionPage(
                    (prev) =>
                      prev + 1
                  )
                }
                disabled={
                  transactionPagination.totalPages ===
                    0 ||
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

