"use client";

import styles from "../../css/Loading.module.css";

export default function Loading({
  text = "Loading...",
  size = "medium",
}) {
  return (
    <div
      className={`${styles.container} ${styles[size]}`}
      role="status"
      aria-live="polite"
    >
      <span
        className={styles.spinner}
        aria-hidden="true"
      />

      {text && (
        <span className={styles.text}>
          {text}
        </span>
      )}
    </div>
  );
}