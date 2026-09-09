"use client";

import { useEffect, useState } from "react";
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

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
  const fetchDashboard = async () => {
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

      const contentType =
        response.headers.get("content-type");

      const responseText =
        await response.text();

      console.log(
        "DASHBOARD STATUS:",
        response.status
      );

      console.log(
        "DASHBOARD CONTENT TYPE:",
        contentType
      );

      console.log(
        "DASHBOARD RESPONSE:",
        responseText
      );

      if (!response.ok) {
        throw new Error(
          `Dashboard API error: ${response.status}`
        );
      }

      if (!responseText) {
        throw new Error(
          "Dashboard API mengembalikan response kosong"
        );
      }

      const result =
        JSON.parse(responseText);

      setDashboard(result.data);
    } catch (error) {
      console.error(
        "FETCH DASHBOARD ANALYTICS ERROR:",
        error
      );

      setError(
        error.message ||
          "Gagal mengambil data dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  fetchDashboard();
}, []);

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString("id-ID");
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "short",
      }
    );
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString(
      "id-ID",
      {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

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
          Memuat data dashboard...
        </div>
      </main>
    );
  }

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

  return (
    <main className={styles.container}>
      {/* HEADER */}

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

      {/* SUMMARY CARDS */}

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
            Rp {formatPrice(summary.totalRevenue)}
          </h2>
        </div>
      </div>

      {/* ANALYTICS */}

      <div className={styles.analyticsGrid}>
        {/* SALES CHART */}

        <section className={styles.analyticsCard}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>
                Penjualan 7 Hari Terakhir
              </h2>

              <p>
                Total pendapatan berdasarkan tanggal
              </p>
            </div>
          </div>

          <div className={styles.chart}>
            <ResponsiveContainer
              width="100%"
              height={300}
            >
              <LineChart data={salesChart}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                />

                <YAxis
                  tickFormatter={(value) =>
                    `Rp${formatPrice(value)}`
                  }
                />

                <Tooltip
                  formatter={(value) =>
                    `Rp ${formatPrice(value)}`
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

        <section className={styles.analyticsCard}>
          <div className={styles.sectionHeader}>
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
            <div className={styles.message}>
              Belum ada data penjualan.
            </div>
          ) : (
            <div className={styles.topProducts}>
              {topProducts.map(
                (product, index) => (
                  <div
                    className={styles.topProductItem}
                    key={product.productId}
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
                        {product.quantity} terjual
                      </span>
                    </div>

                    <strong>
                      Rp{" "}
                      {formatPrice(
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

      {/* SECOND ANALYTICS ROW */}

      <div className={styles.analyticsGrid}>
        {/* PAYMENT METHODS */}

        <section className={styles.analyticsCard}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>
                Metode Pembayaran
              </h2>

              <p>
                Ringkasan transaksi berdasarkan pembayaran
              </p>
            </div>
          </div>

          {paymentMethods.length === 0 ? (
            <div className={styles.message}>
              Belum ada transaksi.
            </div>
          ) : (
            <div className={styles.paymentList}>
              {paymentMethods.map(
                (payment) => (
                  <div
                    className={styles.paymentItem}
                    key={payment.method}
                  >
                    <div>
                      <strong>
                        {payment.method === "cash"
                          ? "Tunai"
                          : payment.method === "qris"
                          ? "QRIS"
                          : payment.method}
                      </strong>

                      <span>
                        {payment.count} transaksi
                      </span>
                    </div>

                    <strong>
                      Rp{" "}
                      {formatPrice(
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

        <section className={styles.analyticsCard}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>
                Stok Menipis
              </h2>

              <p>
                Produk dengan stok ≤ 5
              </p>
            </div>
          </div>

          <div className={styles.lowStock}>
            <div className={styles.lowStockNumber}>
              {summary.lowStock}
            </div>

            <span>
              produk membutuhkan perhatian
            </span>
          </div>
        </section>
      </div>

      {/* RECENT TRANSACTIONS */}

      <section className={styles.analyticsCard}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>
              Transaksi Terbaru
            </h2>

            <p>
              5 transaksi terakhir
            </p>
          </div>
        </div>

        {recentTransactions.length === 0 ? (
          <div className={styles.message}>
            Belum ada transaksi.
          </div>
        ) : (
          <div className={styles.transactionList}>
            {recentTransactions.map(
              (transaction) => (
                <div
                  className={
                    styles.transactionItem
                  }
                  key={transaction.id}
                >
                  <div>
                    <strong>
                      Transaksi #{transaction.id}
                    </strong>

                    <span>
                      {formatDateTime(
                        transaction.createdAt
                      )}
                    </span>
                  </div>

                  <div>
                    <span>
                      {transaction.paymentMethod ===
                      "cash"
                        ? "Tunai"
                        : transaction.paymentMethod ===
                          "qris"
                        ? "QRIS"
                        : transaction.paymentMethod}
                    </span>

                    <strong>
                      Rp{" "}
                      {formatPrice(
                        transaction.total
                      )}
                    </strong>
                  </div>

                  <span>
                    Kasir:{" "}
                    {transaction.cashier || "-"}
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