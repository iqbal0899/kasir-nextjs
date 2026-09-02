"use client";

import { useState } from "react";
import Swal from "sweetalert2";

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

  const handleCheckout = () => {
    if (cart.length === 0) {
      Swal.fire({
        title: "Keranjang Kosong",
        text: "Silakan pilih produk terlebih dahulu.",
        icon: "warning",
      });

      return;
    }

    setPaymentModalOpen(true);
  };

  const handlePayment = async ({
    method,
    cashReceived,
  }) => {
    try {
      setLoading(true);

      if (cart.length === 0) {
        throw new Error(
          "Keranjang transaksi kosong"
        );
      }

      const items = cart.map((item) => ({
        productId: Number(item.id),
        quantity: Number(item.qty),
      }));

      console.log("TRANSACTION ITEMS:", items);

      const response = await fetch(
        "/api/v1/transactions",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

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

      await Swal.fire({
        title: "Pembayaran Berhasil!",
        text:
          "Transaksi berhasil disimpan ke database.",
        icon: "success",
        confirmButtonText: "OK",
      });


      setCart([]);

      setPaymentModalOpen(false);

    } catch (error) {
      console.error(
        "PAYMENT ERROR:",
        error
      );

      Swal.fire({
        title: "Pembayaran Gagal",
        text:
          error.message ||
          "Gagal menyimpan transaksi.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

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
      />

    </div>
  );
}