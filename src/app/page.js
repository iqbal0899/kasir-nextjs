"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

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
  // AMBIL PRODUCTS
  // ========================================

// ========================================
// AMBIL PRODUCTS AKTIF UNTUK KASIR
// ========================================

useEffect(() => {
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      setProductError("");

      const response = await fetch(
        "/api/v1/products",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const result = await response.json();

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

      // Hanya tampilkan produk yang aktif
      const activeProducts = (
        result.data || []
      ).filter(
        (product) =>
          product.isActive === true
      );

      setProducts(activeProducts);

    } catch (error) {
      console.error(
        "FETCH PRODUCTS ERROR:",
        error
      );

      setProductError(
        error.message ||
          "Gagal mengambil data produk"
      );
    } finally {
      setLoadingProducts(false);
    }
  };

  fetchProducts();
}, []);

  // ========================================
  // AMBIL USER LOGIN
  // ========================================

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser =
          JSON.parse(storedUser);

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

        localStorage.removeItem("user");
      }
    }
  }, []);

  // ========================================
  // ADD TO CART
  // ========================================

  function handleAddToCart(product) {
    setCart((prev) => {
      const existing =
        prev.find(
          (item) =>
            item.id === product.id
        );

      if (existing) {
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
  }

  // ========================================
  // INCREASE
  // ========================================

  function handleIncrease(id) {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              qty:
                item.qty + 1,
            }
          : item
      )
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
    setCart((prev) =>
      prev.filter(
        (item) =>
          item.id !== id
      )
    );
  }

  // ========================================
  // CHECKOUT
  // ========================================

  function handleCheckout() {
    if (cart.length === 0) {
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
  }) {
    try {
      if (cart.length === 0) {
        throw new Error(
          "Keranjang masih kosong"
        );
      }

      console.log(
        "CART BEFORE PAYMENT:",
        cart
      );

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
        });

      console.log(
        "TRANSACTION SUCCESS:",
        result
      );

      await Swal.fire({
        icon: "success",
        title:
          "Pembayaran Berhasil!",
        text:
          "Transaksi berhasil disimpan.",
        confirmButtonText:
          "OK",
      });

      const transaction =
        result.data;

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

      setPaymentOpen(false);

      setReceiptOpen(true);

      setCart([]);
    } catch (error) {
      console.error(
        "PAYMENT ERROR:",
        error
      );

      alert(
        error.message ||
          "Pembayaran gagal"
      );
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

    router.push(
      "/auth/login"
    );
  }

  return (
    <div className="app-shell">

      {/* ========================================
          SIDEBAR
      ======================================== */}

      <Sidebar
        role={
          user?.role ||
          "cashier"
        }
      />

      {/* ========================================
          MAIN
      ======================================== */}

      <div className="app-main">

        {/* ========================================
            NAVBAR
        ======================================== */}

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

        {/* ========================================
            CONTENT
        ======================================== */}

        <div className="app-content">

          <Header
            title="Kasir"
            subtitle="Pilih produk di bawah untuk mulai transaksi"
          />

          {/* ========================================
              PRODUCT + CART
          ======================================== */}

          <div className="pos-layout">

            {/* ========================================
                PRODUCT GRID
            ======================================== */}

            <div>

              {loadingProducts && (
                <p>
                  Memuat produk...
                </p>
              )}

              {productError && (
                <p
                  style={{
                    color: "red",
                  }}
                >
                  {productError}
                </p>
              )}

              {!loadingProducts &&
                !productError &&
                products.length ===
                  0 && (
                  <p>
                    Belum ada produk.
                  </p>
                )}

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

            {/* ========================================
                CART
            ======================================== */}

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

      {/* ========================================
          PAYMENT MODAL
      ======================================== */}

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

      {/* ========================================
          RECEIPT MODAL
      ======================================== */}

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

