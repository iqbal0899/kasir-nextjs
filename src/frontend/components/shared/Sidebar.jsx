"use client";

import { useState } from "react";
import Link from "next/link";

import {
  Menu,
  X,
  LayoutDashboard,
  ShoppingCart,
  Package,
  Receipt,
  Users,
} from "lucide-react";

import styles from "../../css/Sidebar.module.css";

export default function Sidebar({ role }) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      label: "Kasir",
      href: "/",
      icon: ShoppingCart,
    },
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Laporan",
      href: "/reports",
      icon: Package,
    },
  ];

  // ========================================
  // MENU KHUSUS ADMIN
  // ========================================

  if (role === "admin") {
    menuItems.push(
      {
        label: "Transaksi",
        href: "/dashboard/transactions",
        icon: Receipt,
      },
      {
        label: "Daftar User",
        href: "/dashboard/users",
        icon: Users,
      }
    );
  }

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* HAMBURGER */}

      <button
        type="button"
        className={styles.hamburger}
        onClick={() => setIsOpen(true)}
        aria-label="Buka menu"
      >
        <Menu size={24} />
      </button>


      {/* OVERLAY */}

      <div
        className={`${styles.overlay} ${
          isOpen ? styles.overlayOpen : ""
        }`}
        onClick={closeSidebar}
      />


      {/* SIDEBAR */}

      <aside
        className={`${styles.sidebar} ${
          isOpen ? styles.sidebarOpen : ""
        }`}
      >

        {/* CLOSE */}

        <button
          type="button"
          className={styles.closeButton}
          onClick={closeSidebar}
          aria-label="Tutup menu"
        >
          <X size={22} />
        </button>


        {/* MENU */}

        <nav className={styles.sidebarNav}>

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={styles.sidebarItem}
                onClick={closeSidebar}
              >
                <span className={styles.sidebarIcon}>
                  <Icon size={18} />
                </span>

                <span className={styles.sidebarLabel}>
                  {item.label}
                </span>
              </Link>
            );
          })}

        </nav>

      </aside>
    </>
  );
}