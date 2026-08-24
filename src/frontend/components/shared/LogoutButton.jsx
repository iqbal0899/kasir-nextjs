"use client";

import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import styles from "../../css/LogoutButton.module.css";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Logout?",
      text: "Apakah Anda yakin ingin keluar?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Logout",
      cancelButtonText: "Tidak",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      localStorage.removeItem("token");

      await Swal.fire({
        title: "Logout Berhasil",
        text: "Anda telah keluar dari akun.",
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
      });

      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);

      Swal.fire({
        title: "Logout Gagal",
        text: "Terjadi kesalahan saat logout.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <button
      type="button"
      className={styles.button}
      onClick={handleLogout}
    >
      Logout
    </button>
  );
}