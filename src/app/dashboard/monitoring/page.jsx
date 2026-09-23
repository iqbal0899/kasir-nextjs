"use client";

import { useEffect, useState } from "react";
import styles from "@/frontend/css/monitoring.module.css";
import Button from "@/frontend/components/ui/Button";

export default function MonitoringPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadMonitoring = async () => {
      try {
        const response = await fetch("/api/v1/dashboard/monitoring", {
          cache: "no-store",
          credentials: "include",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Gagal mengambil data monitoring"
          );
        }

        if (!cancelled) {
          setData(result);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Monitoring fetch error:", error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadMonitoring();

    // Refresh otomatis setiap 1 jam
    const interval = setInterval(
      loadMonitoring,
      60 * 60 * 1000
    );

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      const response = await fetch("/api/v1/dashboard/monitoring", {
        cache: "no-store",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Gagal mengambil data monitoring"
        );
      }

      setData(result);
    } catch (error) {
      console.error("Monitoring refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        Loading Monitoring...
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.empty}>
        Monitoring tidak tersedia
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            Application Monitoring
          </h1>

          <p className={styles.lastUpdate}>
            Last update:{" "}
            {new Date(data.timestamp).toLocaleString("id-ID")}
          </p>
        </div>

        <Button
  type="button"
  className={styles.refreshButton}
  onClick={handleRefresh}
  disabled={refreshing}
>
  {refreshing ? "Refreshing..." : "↻ Refresh"}
</Button>
      </div>

      {/* MONITOR CARDS */}
      <div className={styles.cardGrid}>
        <div className={styles.card}>
          <h3>Application</h3>

          <strong
            className={
              data.status === "healthy"
                ? styles.healthy
                : styles.unhealthy
            }
          >
            {data.status}
          </strong>
        </div>

        <div className={styles.card}>
          <h3>Server</h3>

          <strong>
            {data.server.responseTime}
          </strong>
        </div>

        <div className={styles.card}>
          <h3>Database</h3>

          <strong>
            {data.database.responseTime}
          </strong>
        </div>

        <div className={styles.card}>
          <h3>Products</h3>

          <strong>
            {data.application.products}
          </strong>
        </div>
      </div>

      {/* SYSTEM HEALTH */}
      <div className={styles.healthSection}>
        <h2>System Health</h2>

        <div className={styles.healthItem}>
          <span>Application</span>

          <span
            className={
              data.status === "healthy"
                ? styles.healthy
                : styles.unhealthy
            }
          >
            {data.status === "healthy"
              ? "🟢 Healthy"
              : "🔴 Unhealthy"}
          </span>
        </div>

        <div className={styles.healthItem}>
          <span>Database</span>

          <span
            className={
              data.database.status === "healthy"
                ? styles.healthy
                : styles.unhealthy
            }
          >
            {data.database.status === "healthy"
              ? "🟢 Connected"
              : "🔴 Disconnected"}
          </span>
        </div>

        <div className={styles.healthItem}>
          <span>Server response</span>

          <strong>
            {data.server.responseTime}
          </strong>
        </div>

        <div className={styles.healthItem}>
          <span>Database response</span>

          <strong>
            {data.database.responseTime}
          </strong>
        </div>

        <div className={styles.healthItem}>
          <span>Total Transactions</span>

          <strong>
            {data.application.transactions}
          </strong>
        </div>
      </div>
    </div>
  );
}