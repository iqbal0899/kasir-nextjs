"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { createProduct } from "@/frontend/services/productApi";
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

    // Validasi format
    if (!file.type.startsWith("image/")) {
      toast.warning("File harus berupa gambar.");

      e.target.value = "";
      return;
    }

    // Validasi ukuran 2 MB
    if (file.size > 2 * 1024 * 1024) {
      toast.warning("Ukuran gambar maksimal 2 MB.");

      e.target.value = "";
      return;
    }

    setForm((prev) => ({
      ...prev,
      image: file,
    }));

    // Preview gambar
    const imageUrl = URL.createObjectURL(file);

    setPreview(imageUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi nama
    if (!form.name.trim()) {
      toast.warning("Nama produk wajib diisi.");
      return;
    }

    // Validasi harga
    if (!form.price) {
      toast.warning("Harga produk wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("stock", form.stock);
      formData.append("category", form.category);

      if (form.image) {
        formData.append("image", form.image);
      }

      await createProduct(formData);

      toast.success("Produk berhasil ditambahkan.");

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
        router.push("/dashboard/products");
        router.refresh();
      }, 500);
    } catch (error) {
      console.error("PRODUCT ERROR:", error);

      toast.error(
        error.message || "Terjadi kesalahan saat menambahkan produk."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1>Tambah Produk</h1>

          <p>
            Tambahkan produk baru ke dalam sistem kasir.
          </p>
        </div>

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
              placeholder="Contoh: 18000"
              min="0"
              step="0.01"
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
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageChange}
            />

            <small>
              Format JPG, PNG, atau WEBP.
              Maksimal 2 MB.
            </small>
          </div>

          {/* PREVIEW */}

          {preview && (
            <div className={styles.preview}>
              <p>Preview Gambar:</p>

              <img
                src={preview}
                alt={
                  form.name ||
                  "Preview produk"
                }
              />
            </div>
          )}

          {/* BUTTON */}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() =>
                router.push("/dashboard/products")
              }
              disabled={loading}
            >
              Batal
            </button>

            <button
              type="submit"
              className={styles.submitButton}
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

