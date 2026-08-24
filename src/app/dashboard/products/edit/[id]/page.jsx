"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import Swal from "sweetalert2";

import styles from "@/frontend/css/ProductForm.module.css";

export default function EditProductPage() {
  const router = useRouter();

  const params = useParams();

  const id = params.id;

  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: 0,
    category: "",
    image: "",
  });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  // ========================================
  // GET PRODUCT
  // ========================================

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        const response =
          await fetch(
            `/api/v1/products/${id}`
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Gagal mengambil produk"
          );
        }

        const product =
          result.data;

        setForm({
          name:
            product.name || "",

          price:
            product.price
              ? String(
                  product.price
                )
              : "",

          stock:
            product.stock ?? 0,

          category:
            product.category || "",

          image:
            product.image || "",
        });

      } catch (error) {
        console.error(
          "GET PRODUCT ERROR:",
          error
        );

        setError(
          error.message ||
            "Gagal mengambil produk"
        );

      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // ========================================
  // HANDLE CHANGE
  // ========================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ========================================
  // SUBMIT
  // ========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      const response =
        await fetch(
          `/api/v1/products/${id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              name: form.name,

              price:
                Number(
                  form.price
                ),

              stock:
                Number(
                  form.stock
                ),

              category:
                form.category,

              image:
                form.image,
            }),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Gagal memperbarui produk"
        );
      }

      await Swal.fire({
        title: "Berhasil!",
        text: "Produk berhasil diperbarui.",
        icon: "success",
        confirmButtonText: "OK",
      });

      router.push(
        "/dashboard/products"
      );

      router.refresh();

    } catch (error) {
      console.error(
        "UPDATE PRODUCT ERROR:",
        error
      );

      setError(
        error.message ||
          "Gagal memperbarui produk"
      );

      Swal.fire({
        title: "Gagal!",
        text:
          error.message ||
          "Gagal memperbarui produk.",
        icon: "error",
        confirmButtonText: "OK",
      });

    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <main
        className={
          styles.container
        }
      >
        <div
          className={
            styles.card
          }
        >
          <p>
            Memuat data produk...
          </p>
        </div>
      </main>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error && !form.name) {
    return (
      <main
        className={
          styles.container
        }
      >
        <div
          className={
            styles.card
          }
        >
          <div
            className={
              styles.error
            }
          >
            {error}
          </div>

          <button
            type="button"
            className={
              styles.cancelButton
            }
            onClick={() =>
              router.push(
                "/dashboard/products"
              )
            }
          >
            Kembali
          </button>
        </div>
      </main>
    );
  }

  // ========================================
  // FORM
  // ========================================

  return (
    <main
      className={
        styles.container
      }
    >
      <div
        className={
          styles.card
        }
      >

        <div
          className={
            styles.header
          }
        >
          <h1>
            Edit Produk
          </h1>

          <p>
            Perbarui data produk.
          </p>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
          className={
            styles.form
          }
        >

          {/* NAME */}

          <div
            className={
              styles.formGroup
            }
          >
            <label htmlFor="name">
              Nama Produk
            </label>

            <input
              id="name"
              type="text"
              name="name"
              value={
                form.name
              }
              onChange={
                handleChange
              }
              required
            />
          </div>

          {/* PRICE */}

          <div
            className={
              styles.formGroup
            }
          >
            <label htmlFor="price">
              Harga
            </label>

            <input
              id="price"
              type="number"
              name="price"
              value={
                form.price
              }
              onChange={
                handleChange
              }
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* STOCK */}

          <div
            className={
              styles.formGroup
            }
          >
            <label htmlFor="stock">
              Stock
            </label>

            <input
              id="stock"
              type="number"
              name="stock"
              value={
                form.stock
              }
              onChange={
                handleChange
              }
              min="0"
              step="1"
            />
          </div>

          {/* CATEGORY */}

          <div
            className={
              styles.formGroup
            }
          >
            <label htmlFor="category">
              Kategori
            </label>

            <input
              id="category"
              type="text"
              name="category"
              value={
                form.category
              }
              onChange={
                handleChange
              }
              placeholder="Contoh: Minuman"
            />
          </div>

          {/* IMAGE */}

          <div
            className={
              styles.formGroup
            }
          >
            <label htmlFor="image">
              Gambar Produk
            </label>

            <input
              id="image"
              type="text"
              name="image"
              value={
                form.image
              }
              onChange={
                handleChange
              }
              placeholder="/products/kopi.jpg"
            />
          </div>

          {/* PREVIEW */}

          {form.image && (
            <div
              className={
                styles.preview
              }
            >
              <p>
                Preview:
              </p>

              <img
                src={
                  form.image
                }
                alt={
                  form.name ||
                  "Preview produk"
                }
                onError={(
                  e
                ) => {
                  e.currentTarget.style.display =
                    "none";
                }}
              />
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div
              className={
                styles.error
              }
            >
              {error}
            </div>
          )}

          {/* BUTTON */}

          <div
            className={
              styles.actions
            }
          >

            <button
              type="button"
              className={
                styles.cancelButton
              }
              onClick={() =>
                router.push(
                  "/dashboard/products"
                )
              }
              disabled={
                saving
              }
            >
              Batal
            </button>

            <button
              type="submit"
              className={
                styles.submitButton
              }
              disabled={
                saving
              }
            >
              {saving
                ? "Menyimpan..."
                : "Simpan Perubahan"}
            </button>

          </div>

        </form>
      </div>
    </main>
  );
}