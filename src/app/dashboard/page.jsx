"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import styles from "../../frontend/css/dashboard.module.css";
import Loading from "@/frontend/components/ui/Loading";
import { pusherClient } from "@/frontend/services/pusher";
import { formatCurrency } from "@/shared/utils/formatCurrency";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH DASHBOARD
  // ==========================================

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/v1/dashboard/analytics",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      console.log(
        "DASHBOARD STATUS:",
        response.status
      );

      const text = await response.text();

      console.log(
        "DASHBOARD RESPONSE:",
        text
      );

      if (!response.ok) {
        throw new Error(
          `Dashboard API error: ${response.status}`
        );
      }

      if (!text.trim()) {
        throw new Error(
          "Dashboard API mengembalikan response kosong"
        );
      }

      const result = JSON.parse(text);

      console.log(
        "DASHBOARD RESULT:",
        result
      );

      setDashboard(result.data);
    } catch (error) {
      console.error(
        "FETCH DASHBOARD ANALYTICS ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Gagal mengambil data dashboard"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================
  // INITIAL FETCH
  // ==========================================

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // ==========================================
  // PUSHER REALTIME
  // ==========================================

  useEffect(() => {
    const channel =
      pusherClient.subscribe("dashboard");

    const handleTransactionCreated = (
      data
    ) => {
      console.log(
        "TRANSAKSI BARU:",
        data
      );

      fetchDashboard();
    };

    channel.bind(
      "transaction-created",
      handleTransactionCreated
    );

    return () => {
      channel.unbind(
        "transaction-created",
        handleTransactionCreated
      );

      pusherClient.unsubscribe(
        "dashboard"
      );
    };
  }, [fetchDashboard]);

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    return new Date(
      date
    ).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
    });
  };

  // ==========================================
  // FORMAT DATE TIME
  // ==========================================

  const formatDateTime = (date) => {
    return new Date(
      date
    ).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              Dashboard
            </h1>

            <p className={styles.subtitle}>
              Selamat datang di Toko Iqbal
            </p>
          </div>
        </div>

        <div className={styles.message}>
          <Loading
            text="Memuat data dashboard..."
            size="medium"
          />
        </div>
      </main>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <main className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              Dashboard
            </h1>

            <p className={styles.subtitle}>
              Selamat datang di Toko Iqbal
            </p>
          </div>
        </div>

        <div className={styles.error}>
          {error}
        </div>
      </main>
    );
  }

  // ==========================================
  // EMPTY
  // ==========================================

  if (!dashboard) {
    return null;
  }

  const {
    summary,
    salesChart,
    topProducts,
    paymentMethods,
    recentTransactions,
  } = dashboard;

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <main className={styles.container}>
      {/* ======================================
          HEADER
      ====================================== */}

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            Dashboard
          </h1>

          <p className={styles.subtitle}>
            Selamat datang di Toko Iqbal
          </p>
        </div>
      </div>

      {/* ======================================
          SUMMARY CARDS
      ====================================== */}

      <div className={styles.cards}>
        <div className={styles.card}>
          <p>Total Produk</p>

          <h2>
            {summary.totalProducts}
          </h2>
        </div>

        <div className={styles.card}>
          <p>Stok Produk</p>

          <h2>
            {summary.totalStock}
          </h2>
        </div>

        <div className={styles.card}>
          <p>Total Transaksi</p>

          <h2>
            {summary.totalTransactions}
          </h2>
        </div>

        <div className={styles.card}>
          <p>Total Pendapatan</p>

          <h2>
            {formatCurrency(
              summary.totalRevenue
            )}
          </h2>
        </div>
      </div>

      {/* ======================================
          ANALYTICS
      ====================================== */}

      <div className={styles.analyticsGrid}>
        {/* SALES CHART */}

        <section
          className={
            styles.analyticsCard
          }
        >
          <div
            className={
              styles.sectionHeader
            }
          >
            <div>
              <h2>
                Penjualan 7 Hari Terakhir
              </h2>

              <p>
                Total pendapatan berdasarkan
                tanggal
              </p>
            </div>
          </div>

          <div className={styles.chart}>
            <ResponsiveContainer
              width="100%"
              height={300}
            >
              <LineChart
                data={salesChart}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="date"
                  tickFormatter={
                    formatDate
                  }
                />

                <YAxis
                  tickFormatter={(
                    value
                  ) =>
                    formatCurrency(
                      value
                    )
                  }
                />

                <Tooltip
                  formatter={(value) =>
                    formatCurrency(
                      value
                    )
                  }
                  labelFormatter={(label) =>
                    formatDate(label)
                  }
                />

                <Line
                  type="monotone"
                  dataKey="total"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* TOP PRODUCTS */}

        <section
          className={
            styles.analyticsCard
          }
        >
          <div
            className={
              styles.sectionHeader
            }
          >
            <div>
              <h2>
                Produk Terlaris
              </h2>

              <p>
                Berdasarkan jumlah terjual
              </p>
            </div>
          </div>

          {topProducts.length === 0 ? (
            <div
              className={
                styles.message
              }
            >
              Belum ada data penjualan.
            </div>
          ) : (
            <div
              className={
                styles.topProducts
              }
            >
              {topProducts.map(
                (
                  product,
                  index
                ) => (
                  <div
                    className={
                      styles.topProductItem
                    }
                    key={
                      product.productId
                    }
                  >
                    <div
                      className={
                        styles.productRank
                      }
                    >
                      {index + 1}
                    </div>

                    <div
                      className={
                        styles.topProductInfo
                      }
                    >
                      <strong>
                        {product.name}
                      </strong>

                      <span>
                        {
                          product.quantity
                        }{" "}
                        terjual
                      </span>
                    </div>

                    <strong>
                      {formatCurrency(
                        product.revenue
                      )}
                    </strong>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </div>

      {/* ======================================
          SECOND ANALYTICS ROW
      ====================================== */}

      <div className={styles.analyticsGrid}>
        {/* PAYMENT METHODS */}

        <section
          className={
            styles.analyticsCard
          }
        >
          <div
            className={
              styles.sectionHeader
            }
          >
            <div>
              <h2>
                Metode Pembayaran
              </h2>

              <p>
                Ringkasan transaksi
                berdasarkan pembayaran
              </p>
            </div>
          </div>

          {paymentMethods.length ===
          0 ? (
            <div
              className={
                styles.message
              }
            >
              Belum ada transaksi.
            </div>
          ) : (
            <div
              className={
                styles.paymentList
              }
            >
              {paymentMethods.map(
                (payment) => (
                  <div
                    className={
                      styles.paymentItem
                    }
                    key={
                      payment.method
                    }
                  >
                    <div>
                      <strong>
                        {payment.method ===
                        "cash"
                          ? "Tunai"
                          : payment.method ===
                            "qris"
                          ? "QRIS"
                          : payment.method}
                      </strong>

                      <span>
                        {
                          payment.count
                        }{" "}
                        transaksi
                      </span>
                    </div>

                    <strong>
                      {formatCurrency(
                        payment.total
                      )}
                    </strong>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        {/* LOW STOCK */}

        <section
          className={
            styles.analyticsCard
          }
        >
          <div
            className={
              styles.sectionHeader
            }
          >
            <div>
              <h2>
                Stok Menipis
              </h2>

              <p>
                Produk dengan stok ≤ 5
              </p>
            </div>
          </div>

          <div
            className={
              styles.lowStock
            }
          >
            <div
              className={
                styles.lowStockNumber
              }
            >
              {summary.lowStock}
            </div>

            <span>
              produk membutuhkan perhatian
            </span>
          </div>
        </section>
      </div>

      {/* ======================================
          RECENT TRANSACTIONS
      ====================================== */}

      <section
        className={
          styles.analyticsCard
        }
      >
        <div
          className={
            styles.sectionHeader
          }
        >
          <div>
            <h2>
              Transaksi Terbaru
            </h2>

            <p>
              5 transaksi terakhir
            </p>
          </div>
        </div>

        {recentTransactions.length ===
        0 ? (
          <div
            className={
              styles.message
            }
          >
            Belum ada transaksi.
          </div>
        ) : (
          <div
            className={
              styles.transactionList
            }
          >
            {/* HEADER */}

            <div
              className={
                styles.transactionHeader
              }
            >
              <span>
                ID Transaksi
              </span>

              <span>
                Kasir
              </span>

              <span>
                Pembayaran
              </span>

              <span>
                Total
              </span>

              <span>
                Tanggal
              </span>
            </div>

            {/* DATA */}

            {recentTransactions.map(
              (transaction) => (
                <div
                  className={
                    styles.transactionItem
                  }
                  key={
                    transaction.id
                  }
                >
                  <span
                    className={
                      styles.transactionId
                    }
                  >
                    #
                    {
                      transaction.id
                    }
                  </span>

                  <span
                    className={
                      styles.transactionCashier
                    }
                  >
                    {
                      transaction.cashier ||
                      "-"
                    }
                  </span>

                  <span
                    className={
                      styles.transactionMethod
                    }
                  >
                    {
                      transaction.paymentMethod ||
                      "-"
                    }
                  </span>

                  <span
                    className={
                      styles.transactionTotal
                    }
                  >
                    {formatCurrency(
                      transaction.total
                    )}
                  </span>

                  <span
                    className={
                      styles.transactionDate
                    }
                  >
                    {formatDateTime(
                      transaction.createdAt
                    )}
                  </span>
                </div>
              )
            )}
          </div>
        )}
      </section>
    </main>
  );
}