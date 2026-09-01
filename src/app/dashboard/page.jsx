"use client";

import { useEffect, useState } from "react";
import styles from "../../frontend/css/dashboard.module.css";

export default function DashboardPage() {
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // AMBIL DATA PRODUCT
  // =========================

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const productResponse = await fetch(
          "/api/v1/products"
        );

        const productResult = await productResponse.json();

        if (!productResponse.ok) {
          throw new Error(
            productResult.message ||
              "Gagal mengambil data produk"
          );
        }

        const transactionResponse = await fetch(
          "/api/v1/transactions"
        );

        const transactionResult = await transactionResponse.json();

        if (!transactionResponse.ok) {
          throw new Error(
            transactionResult.message ||
            "Gagal Mengambil Data Transaksi"
          );
        }

        setProducts(productResult.data || []);
        setTransactions(transactionResult.data || []);

      } catch (error) {
        console.error(
          "FETCH DASHBOARD PRODUCTS ERROR:",
          error
        );

        setError(
          error.message ||
            "Gagal mengambil data produk"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // =========================
  // TOTAL PRODUCT
  // =========================

  const totalProducts = products.length;

  // =========================
  // TOTAL STOCK
  // =========================

  const totalStock = products.reduce(
    (total, product) =>
      total + Number(product.stock || 0),
    0
  );

  const totalTransactions = transactions.length;

  const totalRevenue = 
  transactions.reduce( (total, transaction) => 
    total + Number(transaction.total || 0), 0 );

  // =========================
  // FORMAT HARGA
  // =========================

  const formatPrice = (price) => {
    return Number(price || 0).toLocaleString(
      "id-ID"
    );
  };

  return (
    <main className={styles.container}>

      {/* =========================
          HEADER
      ========================= */}

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

      {/* =========================
          LOADING
      ========================= */}

      {loading && (
        <div className={styles.message}>
          Memuat data dashboard...
        </div>
      )}

      {/* =========================
          ERROR
      ========================= */}

      {!loading && error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {/* =========================
          CARDS
      ========================= */}

      {!loading && !error && (
        <div className={styles.cards}>

          {/* TOTAL PRODUK */}

          <div className={styles.card}>
            <p>Total Produk</p>

            <h2>
              {totalProducts}
            </h2>
          </div>

          {/* TOTAL STOCK */}

          <div className={styles.card}>
            <p>Total Stock</p>

            <h2>
              {totalStock}
            </h2>
          </div>

          {/* TOTAL TRANSAKSI */}

          <div className={styles.card}>
            <p>Total Transaksi</p>

            <h2>
              {totalTransactions}
            </h2>
          </div>

          {/* PENDAPATAN */}

          <div className={styles.card}>
            <p>Pendapatan</p>

            <h2>
              Rp{""}
              {formatPrice(totalRevenue)}
              
            </h2>
          </div>

        </div>
      )}

      {/* =========================
          PRODUCT SECTION
      ========================= */}

      {!loading && !error && (
        <section
          className={
            styles.productSection
          }
        >

          <div
            className={
              styles.sectionHeader
            }
          >
            <h2>
              Daftar Produk
            </h2>
          </div>

          {/* BELUM ADA PRODUK */}

          {products.length === 0 && (
            <div
              className={
                styles.message
              }
            >
              Belum ada produk.
            </div>
          )}

          {/* PRODUCT LIST */}

          {products.length > 0 && (
            <div
              className={
                styles.productList
              }
            >

              {products.map(
                (product) => (
                  <div
                    className={
                      styles.productItem
                    }
                    key={product.id}
                  >

                    <div>
                      <h3>
                        {product.name}
                      </h3>

                      <span>
                        {product.category ||
                          "Tanpa kategori"}
                      </span>
                    </div>

                    <strong>
                      Rp{" "}
                      {formatPrice(
                        product.price
                      )}
                    </strong>

                    <span>
                      Stock:{" "}
                      {product.stock}
                    </span>

                  </div>
                )
              )}

            </div>
          )}

        </section>
      )}

    </main>
  );
}