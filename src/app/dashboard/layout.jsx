import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import Sidebar from "@/frontend/components/shared/Sidebar";
import Navbar from "@/frontend/components/shared/Navbar";

export default async function DashboardLayout({ children }) {
  const cookieStore = await cookies();

  const token = cookieStore.get("token")?.value;

  let user = null;

  // ========================================
  // CEK TOKEN
  // ========================================

  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      user = decoded;

      console.log("USER:", user);
      console.log("ROLE:", user.role);

    } catch (error) {
      console.error("JWT ERROR:", error.message);
    }
  }

  return (
    <div className="app-shell">

      {/* SIDEBAR */}

      <Sidebar
        role={user?.role}
      />


      {/* MAIN */}

      <main className="app-main">

        {/* NAVBAR */}

        <Navbar
          storeName="Toko Iqbal"
          userName={user?.username || "User"}
          userRole={user?.role || "cashier"}
        />


        {/* CONTENT */}

        <div className="app-content">
          {children}
        </div>

      </main>

    </div>
  );
}