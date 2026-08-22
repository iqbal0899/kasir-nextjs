"use client";

import { useState } from "react";
import styles from "@/frontend/css/Login.module.css";
import Button from "@/frontend/components/ui/Button";
import { loginUser } from "@/frontend/services/authApi";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const result = await loginUser({
        username,
        password,
      });

      console.log("Login berhasil:", result);

      localStorage.setItem("token", result.token);

      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Login gagal:", error);

      setError(
        error.message || "Username atau password salah"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>

        <h1>Selamat Datang</h1>

        <p className={styles.welcome}>
          di <strong>Toko Iqbal</strong>
        </p>

        <p className={styles.description}>
          Silakan masuk untuk melanjutkan ke sistem.
        </p>

        <form onSubmit={handleLogin}>

          <div className={styles.formGroup}>
            <label htmlFor="username">
              Username
            </label>

            <input
              id="username"
              type="text"
              placeholder="Masukkan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className={styles.error}>
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? "Memproses..." : "Login"}
          </Button>

        </form>

        <p className={styles.footer}>
          © 2026 Toko Iqbal
        </p>

      </div>
    </div>
  );
}