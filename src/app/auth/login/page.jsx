"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/frontend/services/authApi";
import styles from "@/frontend/css/Login.module.css";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.username || !form.password) {
      setError(
        "Username dan password wajib diisi"
      );

      return;
    }

    setLoading(true);

    try {
      console.log("LOGIN FORM:", {
        username: form.username,
        passwordAda: !!form.password,
      });

      const result = await loginUser(
        form.username,
        form.password
      );

      console.log(
        "LOGIN BERHASIL:",
        result
      );

      router.push("/");

    } catch (error) {
      console.error(
        "Login gagal:",
        error
      );

      setError(
        error.message ||
          "Username atau password salah"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.container}>

      <div className={styles.card}>

        <div className={styles.header}>
          <h1>Login</h1>

          <p>
            Masuk ke sistem kasir
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className={styles.form}
        >

          <div className={styles.formGroup}>
            <label htmlFor="username">
              Username
            </label>

            <input
              id="username"
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Masukkan username"
              autoComplete="username"
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
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Masukkan password"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className={styles.button}
            disabled={loading}
          >
            {loading
              ? "Login..."
              : "Login"}
          </button>

        </form>

      </div>

    </main>
  );
}