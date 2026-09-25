"use client";

import { useState } from "react";
import Link from "next/link";

import {
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  ShoppingCart,
  Package,
  Receipt,
  Users,
  FileText,
  Activity,
  FileClock
} from "lucide-react";

import styles from "../../css/Sidebar.module.css";

export default function Sidebar({ role }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] =
    useState(false);

  // ========================================
  // MENU UTAMA
  // ========================================

  const menuItems = [
    {
      label: "Kasir",
      href: "/",
      icon: ShoppingCart,
    },

    {
      label: "Menu",
      href: "/dashboard",
      icon: Menu,
    },

    {
      label: "Laporan",
      href: "/reports",
      icon: FileText,
    },
  ];

  // ========================================
  // CLOSE SIDEBAR
  // ========================================

  const closeSidebar = () => {
    setIsOpen(false);
  };

  // ========================================
  // TOGGLE MENU
  // ========================================

  const toggleDashboard = () => {
    setDashboardOpen((prev) => !prev);
  };

  return (
    <>
      {/* ========================================
          HAMBURGER
      ======================================== */}

      <button
        type="button"
        className={styles.hamburger}
        onClick={() => setIsOpen(true)}
        aria-label="Buka menu"
      >
        <Menu size={24} />
      </button>

      {/* ========================================
          OVERLAY
      ======================================== */}

      <div
        className={`${styles.overlay} ${
          isOpen
            ? styles.overlayOpen
            : ""
        }`}
        onClick={closeSidebar}
      />

      {/* ========================================
          SIDEBAR
      ======================================== */}

      <aside
        className={`${styles.sidebar} ${
          isOpen
            ? styles.sidebarOpen
            : ""
        }`}
      >
        {/* ========================================
            CLOSE BUTTON
        ======================================== */}

        <button
          type="button"
          className={
            styles.closeButton
          }
          onClick={closeSidebar}
          aria-label="Tutup menu"
        >
          <X size={22} />
        </button>

        {/* ========================================
            MENU
        ======================================== */}

        <nav
          className={
            styles.sidebarNav
          }
        >
          {menuItems.map(
            (item) => {
              const Icon =
                item.icon;

              // ========================================
              // MENU
              // ========================================

              if (
                item.label ===
                "Menu"
              ) {
                return (
                  <div
                    key={
                      item.href
                    }
                    className={
                      styles.dashboardWrapper
                    }
                  >
                    {/* ========================================
                        MENU HEADER
                    ======================================== */}

                    <button
                      type="button"
                      className={
                        styles.sidebarItem
                      }
                      onClick={
                        toggleDashboard
                      }
                    >
                      {/* ICON */}

                      <span
                        className={
                          styles.sidebarIcon
                        }
                      >
                        <Icon
                          size={18}
                        />
                      </span>

                      {/* LABEL */}

                      <span
                        className={
                          styles.sidebarLabel
                        }
                      >
                        Menu
                      </span>

                      {/* CHEVRON */}

                      <ChevronDown
                        size={18}
                        className={
                          dashboardOpen
                            ? styles.chevronOpen
                            : styles.chevron
                        }
                      />
                    </button>

                    {/* ========================================
                        SUBMENU
                    ======================================== */}

                    {dashboardOpen && (
                      <div
                        className={
                          styles.subMenu
                        }
                      >
                        {/* ========================================
                            DASHBOARD
                            SEMUA ROLE BISA MELIHAT
                        ======================================== */}

                        <Link
                          href="/dashboard"
                          className={
                            styles.subMenuItem
                          }
                          onClick={
                            closeSidebar
                          }
                        >
                          <LayoutDashboard
                            size={
                              17
                            }
                          />

                          <span>
                            Dashboard
                          </span>
                        </Link>

{/* ========================================
    MENU KHUSUS ADMIN DAN SUPER ADMIN
======================================== */}

{["admin", "super_admin"].includes(role) && (
  <>
    {/* PRODUK */}

    <Link
      href="/dashboard/products"
      className={styles.subMenuItem}
      onClick={closeSidebar}
    >
      <Package size={17} />

      <span>
        Produk
      </span>
    </Link>

    {/* TRANSAKSI */}

    <Link
      href="/dashboard/transactions"
      className={styles.subMenuItem}
      onClick={closeSidebar}
    >
      <Receipt size={17} />

      <span>
        Transaksi
      </span>
    </Link>

    {/* DAFTAR USER */}

    {/* ========================================
    MONITORING
    HANYA SUPER ADMIN
======================================== */}

{role === "super_admin" && (
  <>
    {/* MONITORING */}

    <Link
      href="/dashboard/monitoring"
      className={styles.sidebarItem}
      onClick={closeSidebar}
    >
      <span className={styles.sidebarIcon}>
        <Activity size={18} />
      </span>

      <span className={styles.sidebarLabel}>
        Monitoring
      </span>
    </Link>

    {/* DAFTAR USER */}

    <Link
      href="/dashboard/users"
      className={styles.sidebarItem}
      onClick={closeSidebar}
    >
      <span className={styles.sidebarIcon}>
        <Users size={18} />
      </span>

      <span className={styles.sidebarLabel}>
        Daftar User
      </span>
    </Link>

    <Link
      href="/dashboard/audit-logs"
      className={styles.sidebarItem}
      onClick={closeSidebar}
    >
      <span className={styles.sidebarIcon}>
        <FileClock size={18} />
      </span>

      <span className={styles.sidebarLabel}>
        Audit Logs
      </span>
    </Link>
  </>
)}
  </>
)}
                      </div>
                    )}
                  </div>
                );
              }

              // ========================================
              // MENU BIASA
              // ========================================

              return (
                <Link
                  key={
                    item.href
                  }
                  href={
                    item.href
                  }
                  className={
                    styles.sidebarItem
                  }
                  onClick={
                    closeSidebar
                  }
                >
                  <span
                    className={
                      styles.sidebarIcon
                    }
                  >
                    <Icon
                      size={18}
                    />
                  </span>

                  <span
                    className={
                      styles.sidebarLabel
                    }
                  >
                    {
                      item.label
                    }
                  </span>
                </Link>
              );
            }
          )}
        </nav>
      </aside>
    </>
  );
}

