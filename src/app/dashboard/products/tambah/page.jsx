"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { createProduct } from "@/frontend/services/productApi";
import Loading from "@/frontend/components/ui/Loading";
import styles from "@/frontend/css/ProductForm.module.css";

export default function ProductsPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: 0,
    category: "",
    image: null,
  });

  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

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

    // ===================================================
    // VALIDASI FORMAT
    // ===================================================

    if (!file.type.startsWith("image/")) {
      toast.warning(
        "File harus berupa gambar."
      );

      e.target.value = "";

      return;
    }

    // ===================================================
    // VALIDASI UKURAN
    // ===================================================

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

    // ===================================================
    // PREVIEW GAMBAR
    // ===================================================

    const imageUrl =
      URL.createObjectURL(file);

    setPreview(imageUrl);
  };

  // =====================================================
  // HANDLE SUBMIT
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

    setLoading(true);

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

      if (form.image) {
        formData.append(
          "image",
          form.image
        );
      }

      // =================================================
      // CREATE PRODUCT
      // =================================================

      await createProduct(formData);

      // =================================================
      // SUCCESS
      // =================================================

      toast.success(
        "Produk berhasil ditambahkan."
      );

      setForm({
        name: "",
        price: "",
        stock: 0,
        category: "",
        image: null,
      });

      setPreview("");

      // Beri waktu agar toast terlihat
      setTimeout(() => {
        router.push(
          "/dashboard/products"
        );

        router.refresh();
      }, 500);
    } catch (error) {
      console.error(
        "PRODUCT ERROR:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menambahkan produk.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className={styles.container}>
      <div className={styles.card}>

        {/* HEADER */}

        <div className={styles.header}>
          <h1>
            Tambah Produk
          </h1>

          <p>
            Tambahkan produk baru ke dalam sistem kasir.
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
              disabled={loading}
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
              placeholder="Contoh: 18000"
              min="0"
              step="0.01"
              required
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageChange}
              disabled={loading}
            />

            <small>
              Format JPG, PNG, atau WEBP.
              Maksimal 2 MB.
            </small>
          </div>

          {/* PREVIEW */}

          {preview && (
            <div
              className={
                styles.preview
              }
            >
              <p>
                Preview Gambar:
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

          {/* LOADING */}

          {loading && (
            <Loading
              text="Menyimpan produk..."
              size="small"
            />
          )}

          {/* BUTTON */}

          <div
            className={
              styles.actions
            }
          >

            {/* BATAL */}

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
              disabled={loading}
            >
              Batal
            </button>

            {/* SIMPAN */}

            <button
              type="submit"
              className={
                styles.submitButton
              }
              disabled={loading}
            >
              {loading
                ? "Menyimpan..."
                : "Simpan Produk"}
            </button>

          </div>
        </form>
      </div>
    </main>
  );
}