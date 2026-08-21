"use client";

import { useState } from "react";
import styles from "../../../frontend/css/Login.css";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    console.log("Username:", username);
    console.log("Password:", password);

    window.location.href = "/dashboard";
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>

        <div className={styles.logo}>
          TB
        </div>

        <h1>Selamat Datang</h1>

        <p className={styles.welcome}>
          di <strong>Toko Berkah</strong>
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

          <button type="submit">
            Login
          </button>

        </form>

        <p className={styles.footer}>
          © 2026 Toko Berkah
        </p>

      </div>
    </div>
  );
}