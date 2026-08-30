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
  const response = await fetch(
    "/api/v1/users/logout",
    {
      method: "POST",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Logout gagal"
    );
  }

  // Hapus data user dari localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  await Swal.fire({
    title: "Logout Berhasil",
    text: "Anda telah keluar dari akun.",
    icon: "success",
    timer: 1200,
    showConfirmButton: false,
  });

  router.replace("/auth/login");
} catch (error) {
  console.error("Logout error:", error);

  Swal.fire({
    title: "Logout Gagal",
    text:
      error.message ||
      "Terjadi kesalahan saat logout.",
    icon: "error",
    confirmButtonText: "OK",
  });
}

};

return ( <button
   type="button"
   className={styles.button}
   onClick={handleLogout}
 >
Logout </button>
);
}
