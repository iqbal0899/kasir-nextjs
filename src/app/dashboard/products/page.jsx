"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../../../frontend/css/product.module.css";
import Swal from "sweetalert2";

export default function ProductPage() {
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/v1/products"
        );

        const result =
          await response.json();

        console.log(
          "PRODUCT API:",
          result
        );

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Gagal mengambil data produk"
          );
        }

        setProducts(
          result.data || []
        );

      } catch (error) {
        console.error(
          "FETCH PRODUCTS ERROR:",
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

    fetchProducts();
  }, []);

  const formatPrice = (price) => {
    return Number(price).toLocaleString(
      "id-ID"
    );
  };

  const handleDelete = async (id) => {
  const result = await Swal.fire({
    title: "Hapus produk?",
    text: "Produk yang dihapus tidak dapat dikembalikan.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, Hapus",
    cancelButtonText: "Batal",
    reverseButtons: true,
  });

  if (!result.isConfirmed) {
    return;
  }

  try {
    const response = await fetch(
      `/api/v1/products/${id}`,
      {
        method: "DELETE",
      }
    );

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
          "Gagal menghapus produk"
      );
    }

    setProducts((prev) =>
      prev.filter(
        (product) =>
          product.id !== id
      )
    );

    await Swal.fire({
      title: "Berhasil!",
      text: "Produk berhasil dihapus.",
      icon: "success",
      confirmButtonText: "OK",
    });

  } catch (error) {
    console.error(
      "DELETE PRODUCT ERROR:",
      error
    );

    Swal.fire({
      title: "Gagal!",
      text:
        error.message ||
        "Gagal menghapus produk.",
      icon: "error",
      confirmButtonText: "OK",
    });
  }
};

  return (
    <main className={styles.container}>

      {/* HEADER */}

      <div className={styles.header}>

        <div>
          <h1 className={styles.title}>
            Products
          </h1>

          <p className={styles.subtitle}>
            Kelola semua produk yang tersedia
          </p>
        </div>

        <button
          type="button"
          className={styles.addButton}
          onClick={() =>
            router.push(
              "/dashboard/products/tambah"
            )
          }
        >
          + Tambah Produk
        </button>

      </div>

      {/* LOADING */}

      {loading && (
        <div className={styles.message}>
          Memuat data produk...
        </div>
      )}

      {/* ERROR */}

      {!loading && error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {/* EMPTY */}

      {!loading &&
        !error &&
        products.length === 0 && (
          <div className={styles.message}>
            Belum ada produk.
          </div>
        )}

      {/* PRODUCT GRID */}

      {!loading &&
        !error &&
        products.length > 0 && (
          <div className={styles.productGrid}>

            {products.map((product) => (
              <div
                className={styles.productCard}
                key={product.id}
              >

                {/* IMAGE */}

                <div
                  className={
                    styles.productImage
                  }
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                    />
                  ) : (
                    <div
                      className={
                        styles.noImage
                      }
                    >
                      Tidak ada gambar
                    </div>
                  )}
                </div>

                {/* CONTENT */}

                <div
                  className={
                    styles.productContent
                  }
                >

                  <h3
                    className={
                      styles.productName
                    }
                  >
                    {product.name}
                  </h3>

                  <p
                    className={
                      styles.category
                    }
                  >
                    {product.category ||
                      "Tanpa kategori"}
                  </p>

                  <p
                    className={
                      styles.price
                    }
                  >
                    Rp{" "}
                    {formatPrice(
                      product.price
                    )}
                  </p>

                  <p
                    className={
                      styles.stock
                    }
                  >
                    Stock:{" "}
                    {product.stock}
                  </p>

                  {/* ACTION */}

                  <div
                    className={
                      styles.cardActions
                    }
                  >

<button
  type="button"
  className={styles.editButton}
  onClick={() =>
    router.push(
      `/dashboard/products/edit/${product.id}`
    )
  }
>
  Edit
</button>

<button
  type="button"
  className={styles.deleteButton}
  onClick={() =>
    handleDelete(product.id)
  }
>
  Hapus
</button>

                  </div>

                </div>

              </div>
            ))}

          </div>
        )}

    </main>
  );
}