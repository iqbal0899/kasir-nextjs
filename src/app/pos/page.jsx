"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import CartSidebar from "@/frontend/components/pos/CartSidebar";
import PaymentModal from "@/frontend/components/pos/PaymentModal";

export default function POSPage() {
  const [cart, setCart] = useState([]);

  const [paymentModalOpen, setPaymentModalOpen] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const cartTotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
        Number(item.qty || 0),
    0
  );

  // =====================================================
  // CHECKOUT
  // =====================================================

  const handleCheckout = () => {
    if (cart.length === 0) {
      Swal.fire({
        title: "Keranjang Kosong",
        text: "Silakan pilih produk terlebih dahulu.",
        icon: "warning",
        confirmButtonText: "OK",
      });

      return;
    }

    setPaymentModalOpen(true);
  };

  // =====================================================
  // PAYMENT
  // =====================================================

  const handlePayment = async ({
    method,
    cashReceived,
  }) => {
    try {
      setLoading(true);

      if (cart.length === 0) {
        toast.warning(
          "Keranjang transaksi kosong."
        );

        return;
      }

      const items = cart.map((item) => ({
        productId: Number(item.id),
        quantity: Number(item.qty),
      }));

      console.log(
        "TRANSACTION ITEMS:",
        items
      );

      const response = await fetch(
        "/api/v1/transactions",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            items,

            paymentMethod: method,

            cashReceived:
              method === "cash"
                ? Number(cashReceived || 0)
                : 0,
          }),
        }
      );

      const result =
        await response.json();

      console.log(
        "TRANSACTION RESPONSE:",
        result
      );

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Gagal menyimpan transaksi"
        );
      }

      // =================================================
      // SUCCESS
      // =================================================

      toast.success(
        "Pembayaran berhasil! Transaksi telah disimpan."
      );

      // Kosongkan keranjang
      setCart([]);

      // Tutup payment modal
      setPaymentModalOpen(false);

    } catch (error) {
      console.error(
        "PAYMENT ERROR:",
        error
      );

      // =================================================
      // ERROR
      // =================================================

      const message =
        error instanceof Error
          ? error.message
          : "Gagal menyimpan transaksi.";

      toast.error(message);

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="pos-layout">

      <section>
        <h1>Kasir</h1>
      </section>

      <CartSidebar
        items={cart}

        onIncrease={(id) => {
          setCart((prev) =>
            prev.map((item) =>
              item.id === id
                ? {
                    ...item,
                    qty: item.qty + 1,
                  }
                : item
            )
          );
        }}

        onDecrease={(id) => {
          setCart((prev) =>
            prev
              .map((item) =>
                item.id === id
                  ? {
                      ...item,
                      qty: item.qty - 1,
                    }
                  : item
              )
              .filter(
                (item) => item.qty > 0
              )
          );
        }}

        onRemove={(id) => {
          setCart((prev) =>
            prev.filter(
              (item) => item.id !== id
            )
          );
        }}

        onCheckout={handleCheckout}
      />

      <PaymentModal
        open={paymentModalOpen}

        onClose={() =>
          setPaymentModalOpen(false)
        }

        total={cartTotal}

        onConfirm={handlePayment}

        loading={loading}
      />

    </div>
  );
}