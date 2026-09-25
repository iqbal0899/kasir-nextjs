"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import Loading from "@/frontend/components/ui/Loading";
import styles from "../../../frontend/css/product.module.css";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

export default function ProductPage() {
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // GET PRODUCTS
  // =====================================================

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/v1/products"
        );

        const result = await response.json();

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

        const message =
          error instanceof Error
            ? error.message
            : "Gagal mengambil data produk";

        setError(message);

        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // =====================================================
  // DELETE PRODUCT
  // =====================================================

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

      // =================================================
      // UPDATE STATE
      // =================================================

      setProducts((prev) =>
        prev.filter(
          (product) =>
            product.id !== id
        )
      );

      toast.success(
        "Produk berhasil dihapus."
      );
    } catch (error) {
      console.error(
        "DELETE PRODUCT ERROR:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Gagal menghapus produk.";

      toast.error(message);
    }
  };

  // =====================================================
  // TOGGLE STATUS PRODUCT
  // =====================================================

  const handleToggleStatus = async (
    id,
    isActive
  ) => {
    try {
      const response = await fetch(
        `/api/v1/products/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            isActive,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Gagal mengubah status produk"
        );
      }

      // =================================================
      // UPDATE STATE
      // =================================================

      setProducts((prev) =>
        prev.map((product) =>
          product.id === id
            ? {
                ...product,
                isActive,
              }
            : product
        )
      );

      // =================================================
      // TOAST
      // =================================================

      if (isActive) {
        toast.success(
          "Produk berhasil diaktifkan."
        );
      } else {
        toast.warning(
          "Produk berhasil dinonaktifkan."
        );
      }
    } catch (error) {
      console.error(
        "TOGGLE STATUS ERROR:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Gagal mengubah status produk.";

      toast.error(message);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className={styles.container}>

      {/* =================================================
          HEADER
      ================================================= */}

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
          disabled={loading}
        >
          + Tambah Produk
        </button>
      </div>

      {/* =================================================
          LOADING
      ================================================= */}

      {loading && (
        <div className={styles.message}>
          <Loading
            text="Memuat data produk..."
            size="medium"
          />
        </div>
      )}

      {/* =================================================
          ERROR
      ================================================= */}

      {!loading && error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {/* =================================================
          EMPTY
      ================================================= */}

      {!loading &&
        !error &&
        products.length === 0 && (
          <div className={styles.message}>
            Belum ada produk.
          </div>
        )}

      {/* =================================================
          PRODUCT GRID
      ================================================= */}

      {!loading &&
        !error &&
        products.length > 0 && (
          <div
            className={
              styles.productGrid
            }
          >
            {products.map(
              (product) => (
                <div
                  className={
                    styles.productCard
                  }
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
                        src={
                          product.image
                        }
                        alt={
                          product.name
                        }
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

                  {/* STATUS */}

                  <div
                    className={
                      styles.productStatus
                    }
                  >
                    <label>
                      <input
                        type="checkbox"
                        checked={
                          product.isActive
                        }
                        onChange={(e) =>
                          handleToggleStatus(
                            product.id,
                            e.target.checked
                          )
                        }
                      />

                      <span>
                        {product.isActive
                          ? "Aktif"
                          : "Nonaktif"}
                      </span>
                    </label>
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
                      {formatCurrency(
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
                        className={
                          styles.editButton
                        }
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
                        className={
                          styles.deleteButton
                        }
                        onClick={() =>
                          handleDelete(
                            product.id
                          )
                        }
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
    </main>
  );
}