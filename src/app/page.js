"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import {
  createTransaction,
} from "@/frontend/services/transactionApi";

import Navbar from "../frontend/components/shared/Navbar";
import Sidebar from "../frontend/components/shared/Sidebar";
import Header from "../frontend/components/shared/Header";
import ProductGrid from "../frontend/components/pos/ProductGrid";
import CartSidebar from "../frontend/components/pos/CartSidebar";
import PaymentModal from "../frontend/components/pos/PaymentModal";
import ReceiptModal from "../frontend/components/pos/ReceiptModal";
import Loading from "@/frontend/components/ui/Loading";

export default function Home() {
  const router = useRouter();

  const [cart, setCart] = useState([]);

  const [paymentOpen, setPaymentOpen] =
    useState(false);

  const [receiptOpen, setReceiptOpen] =
    useState(false);

  const [lastTransaction, setLastTransaction] =
    useState(null);

  const [user, setUser] = useState(null);

  const [products, setProducts] =
    useState([]);

  const [loadingProducts, setLoadingProducts] =
    useState(true);

  const [productError, setProductError] =
    useState("");

  // ========================================
  // FETCH PRODUCTS
  // ========================================

  const fetchProducts = useCallback(
    async () => {
      try {
        setLoadingProducts(true);
        setProductError("");

        const response =
          await fetch(
            "/api/v1/products",
            {
              method: "GET",
              cache: "no-store",
              credentials: "include",
            }
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
              "Gagal mengambil produk"
          );
        }

        const activeProducts =
          (result.data || []).filter(
            (product) =>
              product.isActive === true
          );

        setProducts(
          activeProducts
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

        setProductError(
          message
        );

        toast.error(message);
      } finally {
        setLoadingProducts(
          false
        );
      }
    },
    []
  );

  // ========================================
  // AMBIL PRODUCTS SAAT HALAMAN DIBUKA
  // ========================================

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ========================================
  // AMBIL USER LOGIN
  // ========================================

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser =
          JSON.parse(
            storedUser
          );

        console.log(
          "USER LOGIN:",
          parsedUser
        );

        setUser(parsedUser);
      } catch (error) {
        console.error(
          "USER DATA ERROR:",
          error
        );

        localStorage.removeItem(
          "user"
        );

        toast.error(
          "Data pengguna tidak valid. Silakan login kembali."
        );
      }
    }
  }, []);

  // ========================================
  // TOTAL
  // ========================================

  const total = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) *
        Number(item.qty || 0),
    0
  );

  // ========================================
  // ADD TO CART
  // ========================================

  function handleAddToCart(product) {
    /*
     * Jangan izinkan menambahkan produk
     * yang stoknya 0.
     */

    if (
      Number(product.stock) <= 0
    ) {
      toast.warning(
        `${product.name} sedang habis.`
      );

      return;
    }

    setCart((prev) => {
      const existing =
        prev.find(
          (item) =>
            item.id === product.id
        );

      /*
       * Jika produk sudah ada di cart,
       * jangan melebihi stok.
       */

      if (existing) {
        if (
          existing.qty >=
          Number(product.stock)
        ) {
          toast.warning(
            `Stok ${product.name} hanya ${product.stock}.`
          );

          return prev;
        }

        return prev.map(
          (item) =>
            item.id === product.id
              ? {
                  ...item,
                  qty:
                    item.qty + 1,
                }
              : item
        );
      }

      return [
        ...prev,
        {
          ...product,
          qty: 1,
        },
      ];
    });

    toast.success(
      `${product.name} ditambahkan ke keranjang.`
    );
  }

  // ========================================
  // INCREASE
  // ========================================

  function handleIncrease(id) {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== id) {
          return item;
        }

        /*
         * Cari stok terbaru dari state products.
         */

        const product =
          products.find(
            (p) => p.id === id
          );

        const stock =
          Number(
            product?.stock ??
              item.stock ??
              0
          );

        if (
          item.qty >= stock
        ) {
          toast.warning(
            `Stok ${item.name} hanya ${stock}.`
          );

          return item;
        }

        return {
          ...item,
          qty: item.qty + 1,
        };
      })
    );
  }

  // ========================================
  // DECREASE
  // ========================================

  function handleDecrease(id) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? {
                ...item,
                qty:
                  item.qty - 1,
              }
            : item
        )
        .filter(
          (item) =>
            item.qty > 0
        )
    );
  }

  // ========================================
  // REMOVE
  // ========================================

  function handleRemove(id) {
    const product =
      cart.find(
        (item) =>
          item.id === id
      );

    setCart((prev) =>
      prev.filter(
        (item) =>
          item.id !== id
      )
    );

    if (product) {
      toast.info(
        `${product.name} dihapus dari keranjang.`
      );
    }
  }

  // ========================================
  // CHECKOUT
  // ========================================

  function handleCheckout() {
    if (cart.length === 0) {
      toast.warning(
        "Keranjang masih kosong. Silakan pilih produk terlebih dahulu."
      );

      return;
    }

    setPaymentOpen(true);
  }

  // ========================================
  // PAYMENT BERHASIL
  // ========================================

  async function handleConfirmPayment({
    method,
    cashReceived,
    change,
    idempotencyKey,
  }) {
    try {
      if (cart.length === 0) {
        toast.warning(
          "Keranjang masih kosong."
        );

        throw new Error(
          "Keranjang masih kosong."
        );
      }

      console.log(
        "CART BEFORE PAYMENT:",
        cart
      );

      console.log(
        "IDEMPOTENCY KEY:",
        idempotencyKey
      );

      // ====================================
      // KIRIM TRANSAKSI
      // ====================================

      const result =
        await createTransaction({
          items: cart,

          paymentMethod:
            method,

          cashReceived:
            method === "cash"
              ? Number(
                  cashReceived
                )
              : 0,

          idempotencyKey,
        });

      console.log(
        "TRANSACTION SUCCESS:",
        result
      );

      // ====================================
      // VALIDASI RESPONSE
      // ====================================

      if (!result?.success) {
        throw new Error(
          result?.message ||
            "Transaksi gagal diproses."
        );
      }

      const transaction =
        result.data;

      // ====================================
      // SIMPAN DATA STRUK
      // ====================================

      setLastTransaction({
        ...transaction,

        items: cart,

        method,

        total,

        cashReceived,

        change,

        date:
          new Date().toLocaleString(
            "id-ID"
          ),

        cashier:
          user?.username ||
          "Admin",
      });

      // ====================================
      // RESET CART
      // ====================================

      setCart([]);

      // ====================================
      // UPDATE STOK DI KASIR
      // ====================================

      await fetchProducts();

      // ====================================
      // TUTUP PAYMENT
      // BUKA RECEIPT
      // ====================================

      setPaymentOpen(false);

      setReceiptOpen(true);

      toast.success(
        "Pembayaran berhasil! Transaksi telah disimpan."
      );

      return result;
    } catch (error) {
      console.error(
        "PAYMENT ERROR:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Pembayaran gagal";

      toast.error(message);

      throw error;
    }
  }

  // ========================================
  // LOGOUT
  // ========================================

  function handleLogout() {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    toast.info(
      "Anda telah logout."
    );

    router.push(
      "/auth/login"
    );
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="app-shell">
      <Sidebar
        role={
          user?.role ||
          "cashier"
        }
      />

      <div className="app-main">
        <Navbar
          storeName="Toko Iqbal"
          userName={
            user?.username ||
            "User"
          }
          userRole={
            user?.role ||
            "cashier"
          }
          onLogout={
            handleLogout
          }
        />

        <div className="app-content">
          <Header
            title="Kasir"
            subtitle="Pilih produk di bawah untuk mulai transaksi"
          />

          <div className="pos-layout">
            <div>
              {/* ====================================
                  LOADING PRODUCTS
              ==================================== */}

              {loadingProducts && (
                <Loading
                  text="Memuat produk..."
                  size="medium"
                />
              )}

              {/* ====================================
                  PRODUCT ERROR
              ==================================== */}

              {productError && (
                <p
                  style={{
                    color: "red",
                  }}
                >
                  {productError}
                </p>
              )}

              {/* ====================================
                  EMPTY PRODUCTS
              ==================================== */}

              {!loadingProducts &&
                !productError &&
                products.length ===
                  0 && (
                  <p>
                    Belum ada produk.
                  </p>
                )}

              {/* ====================================
                  PRODUCT GRID
              ==================================== */}

              {!loadingProducts &&
                !productError &&
                products.length >
                  0 && (
                  <ProductGrid
                    products={
                      products
                    }
                    onAddToCart={
                      handleAddToCart
                    }
                  />
                )}
            </div>

            <CartSidebar
              items={cart}
              onIncrease={
                handleIncrease
              }
              onDecrease={
                handleDecrease
              }
              onRemove={
                handleRemove
              }
              onCheckout={
                handleCheckout
              }
            />
          </div>
        </div>
      </div>

      <PaymentModal
        open={paymentOpen}
        onClose={() =>
          setPaymentOpen(
            false
          )
        }
        total={total}
        items={cart}
        onConfirm={
          handleConfirmPayment
        }
      />

      <ReceiptModal
        open={receiptOpen}
        onClose={() =>
          setReceiptOpen(
            false
          )
        }
        transaction={
          lastTransaction
        }
        onPrint={() =>
          window.print()
        }
      />
    </div>
  );
}