"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, Trash2, Send, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import styles from "@/frontend/css/request.module.css";

export default function InventoryRequestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const productId = searchParams.get("productId");

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [items, setItems] = useState([]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!productId || products.length === 0) {
      return;
    }

    const product = products.find(
      (item) => item.id === Number(productId)
    );

    if (product) {
      setSelectedProduct(String(product.id));
    }
  }, [productId, products]);

  async function fetchProducts() {
    try {
      setLoadingProducts(true);
      setMessage("");

      const response = await fetch(
        "/api/v1/products"
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Gagal mengambil data produk"
        );
      }

      setProducts(result.data || []);
    } catch (error) {
      console.error(
        "FETCH PRODUCTS ERROR:",
        error
      );

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gagal mengambil data produk";

      setMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoadingProducts(false);
    }
  }

  function handleAddItem() {
    setMessage("");

    if (!selectedProduct) {
      setMessage(
        "Pilih produk terlebih dahulu"
      );
      return;
    }

    const product = products.find(
      (item) =>
        item.id === Number(selectedProduct)
    );

    if (!product) {
      setMessage(
        "Produk tidak ditemukan"
      );
      return;
    }

    const requestedQuantity =
      Number(quantity);

    if (
      !Number.isInteger(
        requestedQuantity
      ) ||
      requestedQuantity <= 0
    ) {
      setMessage(
        "Jumlah harus lebih dari 0"
      );
      return;
    }

    const existingItem = items.find(
      (item) =>
        item.productId === product.id
    );

    if (existingItem) {
      setItems(
        items.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity:
                  item.quantity +
                  requestedQuantity,
              }
            : item
        )
      );

      toast.success(
        "Jumlah produk berhasil ditambahkan"
      );
    } else {
      setItems([
        ...items,
        {
          productId: product.id,
          productName: product.name,
          productStock: product.stock,
          quantity: requestedQuantity,
        },
      ]);

      toast.success(
        "Produk berhasil ditambahkan"
      );
    }

    setSelectedProduct("");
    setQuantity(1);
  }

  function handleRemoveItem(productId) {
    setItems(
      items.filter(
        (item) =>
          item.productId !== productId
      )
    );
  }

  function handleQuantityChange(
    productId,
    value
  ) {
    const newQuantity = Number(value);

    if (
      !Number.isInteger(newQuantity) ||
      newQuantity < 1
    ) {
      return;
    }

    setItems(
      items.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: newQuantity,
            }
          : item
      )
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");

    if (items.length === 0) {
      setMessage(
        "Minimal satu produk harus ditambahkan"
      );
      return;
    }

    for (const item of items) {
      if (
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        setMessage(
          `Jumlah ${item.productName} tidak valid`
        );
        return;
      }
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/v1/inventory/request",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            items: items.map((item) => ({
              productId:
                item.productId,
              quantity:
                item.quantity,
            })),
            note: note.trim() || null,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Gagal membuat permintaan stok"
        );
      }

      toast.success(
        result.message ||
          "Permintaan stok berhasil dibuat"
      );

      setItems([]);
      setNote("");
      setSelectedProduct("");
      setQuantity(1);

      setTimeout(() => {
        router.push(
          "/dashboard/products"
        );
      }, 1000);
    } catch (error) {
      console.error(
        "CREATE REQUEST ERROR:",
        error
      );

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gagal membuat permintaan stok";

      setMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    router.back();
  }

  return (
    <main className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <div>
            <button
              type="button"
              onClick={handleBack}
              className={styles.backButton}
            >
              <ArrowLeft size={18} />
              Kembali
            </button>

            <h1 className={styles.title}>
              Permintaan Stok
            </h1>

            <p className={styles.subtitle}>
              Ajukan permintaan stok produk
              ke inventory
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className={styles.form}
        >
          <div className={styles.formRow}>
            <div className={styles.field}>
              <label
                htmlFor="product"
                className={styles.label}
              >
                Produk
              </label>

              <select
                id="product"
                value={selectedProduct}
                onChange={(event) =>
                  setSelectedProduct(
                    event.target.value
                  )
                }
                disabled={loadingProducts}
                className={styles.select}
              >
                <option value="">
                  {loadingProducts
                    ? "Memuat produk..."
                    : "Pilih produk"}
                </option>

                {products.map(
                  (product) => (
                    <option
                      key={product.id}
                      value={product.id}
                    >
                      {product.name}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className={styles.field}>
              <label
                htmlFor="quantity"
                className={styles.label}
              >
                Jumlah
              </label>

              <input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(event) =>
                  setQuantity(
                    Number(
                      event.target.value
                    )
                  )
                }
                className={styles.input}
              />
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              disabled={loadingProducts}
              className={styles.addButton}
            >
              <Plus size={18} />
              Tambah
            </button>
          </div>

          {message && (
            <div className={styles.message}>
              {message}
            </div>
          )}

          <div
            className={
              styles.tableWrapper
            }
          >
            <table
              className={styles.table}
            >
              <thead
                className={
                  styles.tableHead
                }
              >
                <tr>
                  <th
                    className={
                      styles.tableHeader
                    }
                  >
                    Produk
                  </th>

                  <th
                    className={
                      styles.tableHeaderCenter
                    }
                  >
                    Stok Saat Ini
                  </th>

                  <th
                    className={
                      styles.tableHeaderCenter
                    }
                  >
                    Jumlah Request
                  </th>

                  <th
                    className={
                      styles.tableHeaderCenter
                    }
                  >
                    Aksi
                  </th>
                </tr>
              </thead>

              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className={
                        styles.empty
                      }
                    >
                      Belum ada produk
                      yang diminta
                    </td>
                  </tr>
                ) : (
                  items.map(
                    (item) => (
                      <tr
                        key={
                          item.productId
                        }
                        className={
                          styles.tableRow
                        }
                      >
                        <td
                          className={
                            styles.tableCell
                          }
                        >
                          <div
                            className={
                              styles.productInfo
                            }
                          >
                            <span
                              className={
                                styles.productName
                              }
                            >
                              {
                                item.productName
                              }
                            </span>
                          </div>
                        </td>

                        <td
                          className={
                            styles.tableCellCenter
                          }
                        >
                          {item.productStock}
                        </td>

                        <td
                          className={
                            styles.tableCellCenter
                          }
                        >
                          <input
                            type="number"
                            min="1"
                            value={
                              item.quantity
                            }
                            onChange={(
                              event
                            ) =>
                              handleQuantityChange(
                                item.productId,
                                event
                                  .target
                                  .value
                              )
                            }
                            className={
                              styles.quantityInput
                            }
                          />
                        </td>

                        <td
                          className={
                            styles.tableCellCenter
                          }
                        >
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveItem(
                                item.productId
                              )
                            }
                            className={
                              styles.deleteButton
                            }
                            title="Hapus produk"
                          >
                            <Trash2
                              size={18}
                            />
                          </button>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>

          <div
            className={
              styles.noteSection
            }
          >
            <label
              htmlFor="note"
              className={styles.label}
            >
              Catatan
            </label>

            <textarea
              id="note"
              value={note}
              onChange={(event) =>
                setNote(
                  event.target.value
                )
              }
              rows={4}
              placeholder="Tambahkan catatan permintaan..."
              className={
                styles.textarea
              }
            />
          </div>

          <div
            className={
              styles.summary
            }
          >
            <div
              className={
                styles.summaryItem
              }
            >
              <span>
                Total Produk
              </span>

              <strong>
                {items.length}
              </strong>
            </div>

            <div
              className={
                styles.summaryItem
              }
            >
              <span>
                Total Jumlah
              </span>

              <strong>
                {items.reduce(
                  (total, item) =>
                    total +
                    item.quantity,
                  0
                )}
              </strong>
            </div>
          </div>

          <div
            className={
              styles.submitSection
            }
          >
            <button
              type="button"
              onClick={handleBack}
              className={
                styles.cancelButton
              }
              disabled={loading}
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                items.length === 0
              }
              className={
                styles.submitButton
              }
            >
              <Send size={18} />

              {loading
                ? "Mengirim..."
                : "Kirim Permintaan"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}