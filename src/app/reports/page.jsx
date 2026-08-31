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

  const [printDate, setPrintDate] = useState(null);
  const [printSection, setPrintSection] = useState(null);

  const [loadingProducts, setLoadingProducts] =
    useState(true);

  const [loadingTransactions, setLoadingTransactions] =
    useState(true);

  const [productError, setProductError] =
    useState("");

  const [transactionError, setTransactionError] =
    useState("");

  // ========================================
  // PRINT DATE
  // ========================================

  useEffect(() => {
    setPrintDate(new Date());
  }, []);

  // ========================================
  // GET PRODUCTS
  // ========================================

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        setProductError("");

        const response = await fetch(
          "/api/v1/products",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Gagal mengambil data produk"
          );
        }

        setProducts(result.data || []);
      } catch (error) {
        console.error(
          "PRODUCT REPORT ERROR:",
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

    fetchProducts();
  }, []);

  // ========================================
  // GET TRANSACTIONS
  // ========================================

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoadingTransactions(true);
        setTransactionError("");

        const response = await fetch(
          "/api/v1/transactions",
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

        setTransactions(
          result.data || []
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

    fetchTransactions();
  }, []);

  // ========================================
  // GET USER LOGIN
  // ========================================

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      return;
    }

    try {
      const parsedUser =
        JSON.parse(storedUser);

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

  // ========================================
  // FORMAT PRICE
  // ========================================

  const formatPrice = (price) => {
    return Number(
      price || 0
    ).toLocaleString("id-ID");
  };

  // ========================================
  // PRODUCT STATISTICS
  // ========================================

  const totalProducts =
    products.length;

  const totalStock =
    products.reduce(
      (total, product) =>
        total +
        Number(
          product.stock || 0
        ),
      0
    );

  const lowStock =
    products.filter(
      (product) =>
        Number(
          product.stock || 0
        ) <= 5
    ).length;

  // ========================================
  // TRANSACTION STATISTICS
  // ========================================

  const totalTransactions =
    transactions.length;

  const totalRevenue =
    transactions.reduce(
      (total, transaction) =>
        total +
        Number(
          transaction.total || 0
        ),
      0
    );

  // ========================================
  // PRINT
  // ========================================

  const handlePrint = (
    section
  ) => {
    setPrintSection(section);

    setTimeout(() => {
      window.print();
    }, 300);
  };

  // ========================================
  // AFTER PRINT
  // ========================================

  useEffect(() => {
    const handleAfterPrint = () => {
      setPrintSection(null);
    };

    window.addEventListener(
      "afterprint",
      handleAfterPrint
    );

    return () => {
      window.removeEventListener(
        "afterprint",
        handleAfterPrint
      );
    };
  }, []);

  // ========================================
  // LOGOUT
  // ========================================

  const handleLogout = () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    window.location.href =
      "/auth/login";
  };

  return (
    <div className="app-shell">

      {/* ========================================
          SIDEBAR
      ======================================== */}

      <div className={styles.noPrint}>
        <Sidebar
          role={
            user?.role ||
            "cashier"
          }
        />
      </div>

      {/* ========================================
          MAIN
      ======================================== */}

      <div className="app-main">

        {/* ========================================
            NAVBAR
        ======================================== */}

        <div className={styles.noPrint}>
          <Navbar
            storeName="Toko Iqbal"
            userName={
              user?.username ||
              "User"
            }
            userRole={
              user?.role ||
              "cashier"
            }
            onLogout={
              handleLogout
            }
          />
        </div>

        {/* ========================================
            REPORT CONTENT
        ======================================== */}

        <main
          className={`
            ${styles.container}
            ${
              printSection ===
              "product"
                ? styles.printProduct
                : printSection ===
                    "transaction"
                  ? styles.printTransaction
                  : printSection ===
                      "all"
                    ? styles.printAll
                    : ""
            }
          `}
        >

          {/* ========================================
              PRINT HEADER
          ======================================== */}

          <div
            className={
              styles.printHeader
            }
          >
            <h1>TOKO IQBAL</h1>

            {printSection ===
              "product" && (
              <h2>
                LAPORAN PRODUK
              </h2>
            )}

            {printSection ===
              "transaction" && (
              <h2>
                LAPORAN TRANSAKSI
              </h2>
            )}

            {printSection ===
              "all" && (
              <h2>
                LAPORAN PRODUK & TRANSAKSI
              </h2>
            )}

            <p>
              Dicetak oleh:{" "}
              {user?.username ||
                "User"}
            </p>

            <p>
              Tanggal:{" "}
              {printDate
                ? formatDate(
                    printDate
                  )
                : "-"}
            </p>
          </div>

          {/* ========================================
              PAGE HEADER
          ======================================== */}

          <div
            className={
              styles.header
            }
          >
            <div>
              <h1
                className={
                  styles.title
                }
              >
                Laporan
              </h1>

              <p
                className={
                  styles.subtitle
                }
              >
                Laporan produk dan transaksi
                Toko Iqbal
              </p>
            </div>

            <button
              type="button"
              className={`
                ${styles.printButton}
                ${styles.noPrint}
              `}
              onClick={() =>
                handlePrint("all")
              }
            >
              🖨️ Print Laporan
            </button>
          </div>

          {/* ========================================
              PRODUCT REPORT
          ======================================== */}

          <section
            className={`
              ${styles.section}
              ${
                printSection ===
                "product"
                  ? styles.printVisible
                  : styles.printHidden
              }
            `}
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
                  Ringkasan produk dan persediaan
                </p>
              </div>

              <button
                type="button"
                className={`
                  ${styles.printButton}
                  ${styles.noPrint}
                `}
                onClick={() =>
                  handlePrint(
                    "product"
                  )
                }
              >
                🖨️ Print Produk
              </button>
            </div>

            {/* PRODUCT CARDS */}

            <div
              className={
                styles.cards
              }
            >
              <div
                className={
                  styles.card
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
                  styles.card
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
                  styles.card
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
            </div>

            {/* PRODUCT ERROR */}

            {productError && (
              <div
                className={
                  styles.error
                }
              >
                {productError}
              </div>
            )}

            {/* PRODUCT TABLE */}

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
                        <th>ID</th>
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
                          Stock
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
                            colSpan="6"
                            className={
                              styles.empty
                            }
                          >
                            Belum ada produk.
                          </td>
                        </tr>
                      ) : (
                        products.map(
                          (
                            product
                          ) => (
                            <tr
                              key={
                                product.id
                              }
                            >
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
                                {
                                  product.stock
                                }
                              </td>

                              <td>
                                {Number(
                                  product.stock
                                ) <= 5 ? (
                                  <span
                                    className={
                                      styles.warning
                                    }
                                  >
                                    Stock Menipis
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
          </section>

          {/* ========================================
              TRANSACTION REPORT
          ======================================== */}

          <section
            className={`
              ${styles.section}
              ${
                printSection ===
                "transaction"
                  ? styles.printVisible
                  : styles.printHidden
              }
            `}
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
                  Ringkasan transaksi penjualan
                </p>
              </div>

              <button
                type="button"
                className={`
                  ${styles.printButton}
                  ${styles.noPrint}
                `}
                onClick={() =>
                  handlePrint(
                    "transaction"
                  )
                }
              >
                🖨️ Print Transaksi
              </button>
            </div>

            {/* TRANSACTION CARDS */}

            <div
              className={
                styles.cards
              }
            >
              <div
                className={
                  styles.card
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
                  styles.card
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

            {/* TRANSACTION ERROR */}

            {transactionError && (
              <div
                className={
                  styles.error
                }
              >
                {transactionError}
              </div>
            )}

            {/* TRANSACTION TABLE */}

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
                        <th>ID</th>
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
                            colSpan="5"
                            className={
                              styles.empty
                            }
                          >
                            Belum ada transaksi.
                          </td>
                        </tr>
                      ) : (
                        transactions.map(
                          (
                            transaction
                          ) => (
                            <tr
                              key={
                                transaction.id
                              }
                            >
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
                                    transaction.total
                                  )}
                                </strong>
                              </td>

                              <td>
                                {
                                  transaction.paymentMethod ||
                                  "-"
                                }
                              </td>
                            </tr>
                          )
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
          </section>

          {/* ========================================
              PRINT FOOTER
          ======================================== */}

          <div
            className={
              styles.printFooter
            }
          >
            <p>
              Toko Iqbal
            </p>

            <p>
              Dicetak pada:{" "}
              {printDate
                ? formatDate(
                    printDate
                  )
                : "-"}
            </p>
          </div>

        </main>
      </div>
    </div>
  );
}

