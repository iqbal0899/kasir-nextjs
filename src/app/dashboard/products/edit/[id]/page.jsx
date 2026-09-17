"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

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
    image: null,
  });

  const [currentImage, setCurrentImage] = useState("");
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // GET PRODUCT
  // =====================================================

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/v1/products/${id}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const text = await response.text();

        let result;

        try {
          result = text ? JSON.parse(text) : {};
        } catch {
          throw new Error(
            `Response server tidak valid. Status: ${response.status}`
          );
        }

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Gagal mengambil data produk"
          );
        }

        const product = result.data;

        if (!product) {
          throw new Error(
            "Data produk tidak ditemukan"
          );
        }

        setForm({
          name: product.name || "",
          price:
            product.price !== null &&
            product.price !== undefined
              ? String(product.price)
              : "",
          stock: product.stock ?? 0,
          category: product.category || "",
          image: null,
        });

        setCurrentImage(
          product.image || ""
        );
      } catch (error) {
        console.error(
          "GET PRODUCT ERROR:",
          error
        );

        setError(
          error.message ||
            "Gagal mengambil data produk"
        );

        toast.error(
          error.message ||
            "Gagal mengambil data produk"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // =====================================================
  // HANDLE CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // HANDLE IMAGE
  // =====================================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setForm((prev) => ({
        ...prev,
        image: null,
      }));

      setPreview("");

      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    // Validasi format
    if (!allowedTypes.includes(file.type)) {
      toast.warning(
        "Format gambar harus JPG, PNG, atau WEBP."
      );

      e.target.value = "";
      return;
    }

    // Validasi ukuran
    if (file.size > 2 * 1024 * 1024) {
      toast.warning(
        "Ukuran gambar maksimal 2 MB."
      );

      e.target.value = "";
      return;
    }

    setForm((prev) => ({
      ...prev,
      image: file,
    }));

    const imageUrl =
      URL.createObjectURL(file);

    setPreview(imageUrl);
  };

  // =====================================================
  // DELETE PRODUCT
  // =====================================================

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Hapus produk?",
      text: `Produk "${form.name}" akan dihapus.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `/api/v1/products/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const text = await response.text();

      let result = {};

      if (text) {
        try {
          result = JSON.parse(text);
        } catch {
          throw new Error(
            `Response server bukan JSON. HTTP ${response.status}`
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          result.message ||
            `Gagal menghapus produk. HTTP ${response.status}`
        );
      }

      toast.success(
        "Produk berhasil dihapus."
      );

      setTimeout(() => {
        router.push(
          "/dashboard/products"
        );

        router.refresh();
      }, 500);

    } catch (error) {
      console.error(
        "DELETE PRODUCT ERROR:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Gagal menghapus produk.";

      setError(message);

      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ===================================================
    // VALIDASI NAMA
    // ===================================================

    if (!form.name.trim()) {
      toast.warning(
        "Nama produk wajib diisi."
      );

      return;
    }

    // ===================================================
    // VALIDASI HARGA
    // ===================================================

    if (
      form.price === "" ||
      form.price === null ||
      Number.isNaN(Number(form.price)) ||
      Number(form.price) < 0
    ) {
      toast.warning(
        "Harga produk tidak valid."
      );

      return;
    }

    // ===================================================
    // VALIDASI STOCK
    // ===================================================

    if (
      form.stock === "" ||
      form.stock === null ||
      Number.isNaN(Number(form.stock)) ||
      Number(form.stock) < 0
    ) {
      toast.warning(
        "Stock produk tidak valid."
      );

      return;
    }

    setSaving(true);
    setError("");

    try {
      // =================================================
      // FORM DATA
      // =================================================

      const formData = new FormData();

      formData.append(
        "name",
        form.name.trim()
      );

      formData.append(
        "price",
        String(form.price)
      );

      formData.append(
        "stock",
        String(form.stock)
      );

      formData.append(
        "category",
        form.category?.trim() || ""
      );

      // =================================================
      // IMAGE
      // =================================================

      if (
        form.image &&
        form.image instanceof File
      ) {
        formData.append(
          "image",
          form.image
        );
      }

      // =================================================
      // PATCH REQUEST
      // =================================================

      const response = await fetch(
        `/api/v1/products/${id}`,
        {
          method: "PATCH",
          credentials: "include",
          body: formData,
        }
      );

      // =================================================
      // BACA RESPONSE
      // =================================================

      const text = await response.text();

      console.log(
        "UPDATE STATUS:",
        response.status
      );

      console.log(
        "UPDATE RESPONSE:",
        text
      );

      let result = {};

      if (text) {
        try {
          result = JSON.parse(text);
        } catch (parseError) {
          console.error(
            "JSON PARSE ERROR:",
            parseError
          );

          throw new Error(
            `Response server bukan JSON. HTTP ${response.status}`
          );
        }
      }

      // =================================================
      // RESPONSE ERROR
      // =================================================

      if (!response.ok) {
        throw new Error(
          result.message ||
            `Gagal memperbarui produk. HTTP ${response.status}`
        );
      }

      // =================================================
      // SUCCESS
      // =================================================

      toast.success(
        "Produk berhasil diperbarui."
      );

      // Beri waktu agar toast terlihat
      setTimeout(() => {
        router.push(
          "/dashboard/products"
        );

        router.refresh();
      }, 500);

    } catch (error) {
      console.error(
        "UPDATE PRODUCT ERROR:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Gagal memperbarui produk.";

      setError(message);

      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className={styles.container}>
        <div className={styles.card}>
          <p>
            Memuat data produk...
          </p>
        </div>
      </main>
    );
  }

  // =====================================================
  // ERROR GET PRODUCT
  // =====================================================

  if (error && !form.name) {
    return (
      <main className={styles.container}>
        <div className={styles.card}>
          <div className={styles.error}>
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

  // =====================================================
  // FORM
  // =====================================================

  return (
    <main className={styles.container}>
      <div className={styles.card}>

        {/* HEADER */}

        <div className={styles.header}>
          <h1>Edit Produk</h1>

          <p>
            Perbarui data produk.
          </p>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className={styles.form}
        >

          {/* NAMA */}

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
              value={form.name}
              onChange={handleChange}
              placeholder="Contoh: Kopi Susu"
              required
              disabled={saving}
            />
          </div>

          {/* HARGA */}

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
              value={form.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="Contoh: 18000"
              required
              disabled={saving}
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
              value={form.stock}
              onChange={handleChange}
              min="0"
              step="1"
              disabled={saving}
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
              value={form.category}
              onChange={handleChange}
              placeholder="Contoh: Minuman"
              disabled={saving}
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
              type="file"
              name="image"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              disabled={saving}
            />

            <small>
              Format JPG, PNG, atau WEBP.
              Maksimal 2 MB.
            </small>
          </div>

          {/* GAMBAR LAMA */}

          {currentImage &&
            !preview && (
              <div
                className={
                  styles.preview
                }
              >
                <p>
                  Gambar Saat Ini:
                </p>

                <img
                  src={currentImage}
                  alt={
                    form.name ||
                    "Gambar produk"
                  }
                  onError={(e) => {
                    e.currentTarget.style.display =
                      "none";
                  }}
                />
              </div>
            )}

          {/* GAMBAR BARU */}

          {preview && (
            <div
              className={
                styles.preview
              }
            >
              <p>
                Preview Gambar Baru:
              </p>

              <img
                src={preview}
                alt={
                  form.name ||
                  "Preview produk"
                }
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
              disabled={saving}
            >
              Batal
            </button>

            <button
              type="button"
              className={
                styles.deleteButton
              }
              onClick={handleDelete}
              disabled={saving}
            >
              {saving
                ? "Memproses..."
                : "Hapus"}
            </button>

            <button
              type="submit"
              className={
                styles.submitButton
              }
              disabled={saving}
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