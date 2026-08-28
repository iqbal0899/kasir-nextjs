"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
    image: null,
  });

  const [currentImage, setCurrentImage] = useState("");
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ========================================
  // GET PRODUCT
  // ========================================

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/v1/products/${id}`
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Gagal mengambil data produk"
          );
        }

        const product = result.data;

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
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // ========================================
  // HANDLE INPUT
  // ========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ========================================
  // HANDLE IMAGE
  // ========================================

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
      Swal.fire({
        title: "Format Tidak Valid",
        text:
          "Format gambar harus JPG, PNG, atau WEBP.",
        icon: "warning",
        confirmButtonText: "OK",
      });

      e.target.value = "";
      return;
    }

    // Validasi ukuran
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({
        title: "File Terlalu Besar",
        text:
          "Ukuran gambar maksimal 2 MB.",
        icon: "warning",
        confirmButtonText: "OK",
      });

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

  // ========================================
  // SUBMIT
  // ========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi nama
    if (!form.name.trim()) {
      Swal.fire({
        title: "Perhatian",
        text: "Nama produk wajib diisi.",
        icon: "warning",
      });

      return;
    }

    // Validasi harga
    if (
      form.price === "" ||
      form.price === null
    ) {
      Swal.fire({
        title: "Perhatian",
        text: "Harga produk wajib diisi.",
        icon: "warning",
      });

      return;
    }

    setSaving(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append(
        "name",
        form.name.trim()
      );

      formData.append(
        "price",
        form.price
      );

      formData.append(
        "stock",
        form.stock
      );

      formData.append(
        "category",
        form.category
      );

      // Hanya kirim file jika
      // user memilih gambar baru
      if (form.image) {
        formData.append(
          "image",
          form.image
        );
      }

      const response = await fetch(
        `/api/v1/products/${id}`,
        {
          method: "PUT",
          body: formData,
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
        text:
          "Produk berhasil diperbarui.",
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
      <main className={styles.container}>
        <div className={styles.card}>
          <p>Memuat data produk...</p>
        </div>
      </main>
    );
  }

  // ========================================
  // ERROR GET PRODUCT
  // ========================================

  if (error && !form.name) {
    return (
      <main className={styles.container}>
        <div className={styles.card}>
          <div className={styles.error}>
            {error}
          </div>

          <button
            type="button"
            className={styles.cancelButton}
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

          <div className={styles.formGroup}>
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
            />
          </div>

          {/* HARGA */}

          <div className={styles.formGroup}>
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
            />
          </div>

          {/* STOCK */}

          <div className={styles.formGroup}>
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
            />
          </div>

          {/* CATEGORY */}

          <div className={styles.formGroup}>
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
            />
          </div>

          {/* IMAGE */}

          <div className={styles.formGroup}>
            <label htmlFor="image">
              Gambar Produk
            </label>

            <input
              id="image"
              type="file"
              name="image"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
            />

            <small>
              Format JPG, PNG, atau WEBP.
              Maksimal 2 MB.
            </small>
          </div>

          {/* GAMBAR LAMA */}

          {currentImage && !preview && (
            <div className={styles.preview}>
              <p>Gambar Saat Ini:</p>

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
            <div className={styles.preview}>
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
            <div className={styles.error}>
              {error}
            </div>
          )}

          {/* BUTTON */}

          <div className={styles.actions}>

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
