"use client";

import { useRouter } from "next/navigation";
import styles from "../../css/Navbar.module.css";
import LogoutButton from "./LogoutButton";

export default function Navbar({
  storeName,
  userName,
  userRole,
}) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/v1/users/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout gagal");
      }

      // Navigasi Next.js
      router.push("/auth/login");

      // Refresh agar cookie/session benar-benar diperbarui
      router.refresh();

    } catch (error) {
      console.error("LOGOUT ERROR:", error);
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.storeName}>
        {storeName}
      </div>

      <div className={styles.userInfo}>

        <div className={styles.userProfile}>
          <span className={styles.userName}>
            {userName}
          </span>

          <span className={styles.userRole}>
            {userRole === "admin" ? "Admin" : "Kasir"}
          </span>
        </div>

        <LogoutButton />

      </div>
    </nav>
  );
}