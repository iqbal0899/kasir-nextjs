"use client";

import Navbar from "../../frontend/components/shared/Navbar";
import Sidebar from "../../frontend/components/shared/Sidebar";

const MENU_ITEMS = [
  {
    label: "Kasir",
    href: "/",
  },
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Produk",
    href: "/dashboard/products",
  },
  {
    label: "Transaksi",
    href: "/dashboard/transactions",
  },
];

export default function DashboardLayout({ children }) {
  return (
    <div className="app-shell">

      <Sidebar menuItems={MENU_ITEMS} />

      <div className="app-main">

        <Navbar
          storeName="Toko Iqbal"
          userName="Admin"
          onLogout={() => ("Logout")}
        />

        <main className="app-content">
          {children}
        </main>

      </div>

    </div>
  );
}