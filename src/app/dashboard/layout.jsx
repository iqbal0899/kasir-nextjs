import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import Navbar from "../../frontend/components/shared/Navbar";
import Sidebar from "../../frontend/components/shared/Sidebar";

export default async function DashboardLayout({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  let user = null;

  if (token) {
    try {
      user = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (error) {
      console.error("JWT ERROR:", error);
    }
  }

  const isAdmin = user?.role === "admin";

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

    // Hanya admin
    ...(isAdmin
      ? [
          {
            label: "Daftar User",
            href: "/dashboard/users",
          },
          {
            label: "Transaksi",
            href: "/dashboard/transactions",
          },
        ]
      : []),
  ];

  return (
    <div className="app-shell">

      <Sidebar menuItems={MENU_ITEMS} />

      <div className="app-main">

        <Navbar
          storeName="Toko Iqbal"
          userName={user?.username || "User"}
          userRole={user?.role || "cashier"}
        />

        <main className="app-content">
          {children}
        </main>

      </div>

    </div>
  );
}