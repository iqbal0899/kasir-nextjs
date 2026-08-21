"use client";

import { useState } from "react";
import Navbar from "../frontend/components/shared/Navbar";
import Sidebar from "../frontend/components/shared/Sidebar";
import Header from "../frontend/components/shared/Header";
import ProductGrid from "../frontend/components/pos/ProductGrid";
import CartSidebar from "../frontend/components/pos/CartSidebar";
import PaymentModal from "../frontend/components/pos/PaymentModal";
import ReceiptModal from "../frontend/components/pos/ReceiptModal";

// Data contoh — nanti ganti dengan data dari database/API
const DUMMY_PRODUCTS = [
  { id: 1, name: "Kopi Susu", price: 18000, stock: 20, category: "Minuman" },
  { id: 2, name: "Es Teh", price: 8000, stock: 30, category: "Minuman" },
  { id: 3, name: "Nasi Goreng", price: 25000, stock: 15, category: "Makanan" },
  { id: 4, name: "Mie Ayam", price: 20000, stock: 12, category: "Makanan" },
  { id: 5, name: "Roti Bakar", price: 15000, stock: 10, category: "Snack" },
  { id: 6, name: "Kentang Goreng", price: 12000, stock: 100, category: "Snack" },
];

const MENU_ITEMS = [
  {
    label: "Kasir",
    href: "/pos",
    active: true,
  },
  {
    label: "Produk",
    href: "/dashboard",
  },
  {
    label: "Laporan",
    href: "/transactions",
  },
];

let transactionCounter = 1;

export default function Home() {
  const [cart, setCart] = useState([]);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  function handleAddToCart(product) {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  }

  function handleIncrease(id) {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty: item.qty + 1 } : item))
    );
  }

  function handleDecrease(id) {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: item.qty - 1 } : item))
        .filter((item) => item.qty > 0)
    );
  }

  function handleRemove(id) {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }

  function handleCheckout() {
    if (cart.length === 0) return;
    setPaymentOpen(true);
  }

  function handleConfirmPayment({ method, cashReceived, change }) {
    const transaction = {
      id: `TRX-${String(transactionCounter++).padStart(4, "0")}`,
      date: new Date().toLocaleString("id-ID"),
      cashier: "Admin",
      items: cart,
      total,
      method,
      cashReceived,
      change,
    };

    setLastTransaction(transaction);
    setPaymentOpen(false);
    setReceiptOpen(true);
    setCart([]);
  }

  return (
    <div className="app-shell">
      <Sidebar menuItems={MENU_ITEMS} />

      <div className="app-main">
        <Navbar
          storeName="Toko Iqbal"
          userName="Admin"
          onLogout={() => alert("Logout")}
        />

        <div className="app-content">
          <Header
            title="Kasir"
            subtitle="Pilih produk di bawah untuk mulai transaksi"
          />

          <div className="pos-layout">
            <ProductGrid products={DUMMY_PRODUCTS} onAddToCart={handleAddToCart} />

            <CartSidebar
              items={cart}
              onIncrease={handleIncrease}
              onDecrease={handleDecrease}
              onRemove={handleRemove}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      </div>

      <PaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        total={total}
        onConfirm={handleConfirmPayment}
      />

      <ReceiptModal
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        transaction={lastTransaction}
        onPrint={() => window.print()}
      />
    </div>
  );
}
