
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Clock,
  ExternalLink,
  LoaderCircle,
  X,
} from "lucide-react";

import styles from "../../css/Navbar.module.css";
import LogoutButton from "./LogoutButton";

const NOTIFICATION_API = "/api/v1/notifications";

export default function Navbar({ storeName, userName, userRole }) {
  const router = useRouter();
  const panelRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [markingId, setMarkingId] = useState(null);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const fetchNotifications = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(NOTIFICATION_API, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil riwayat notifikasi.");
      }

      const result = await response.json();

      const data = Array.isArray(result)
        ? result
        : result.data?.notifications ??
          result.notifications ??
          result.data ??
          [];

      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat mengambil notifikasi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleMarkAsRead = async (notification) => {
    if (notification.isRead) return;

    setMarkingId(notification.id);

    try {
      const response = await fetch(
        `${NOTIFICATION_API}/${notification.id}/read`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Gagal memperbarui status notifikasi.");
      }

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? { ...item, isRead: true }
            : item
        )
      );
    } catch (err) {
      setError(err.message || "Gagal memperbarui notifikasi.");
    } finally {
      setMarkingId(null);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification);
    }

    if (notification.href) {
      setIsOpen(false);
      router.push(notification.href);
    }
  };

  const handleMarkAllAsRead = async () => {
    setError("");

    try {
      const response = await fetch(`${NOTIFICATION_API}/read-all`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Gagal menandai semua notifikasi.");
      }

      setNotifications((current) =>
        current.map((item) => ({ ...item, isRead: true }))
      );
    } catch (err) {
      setError(err.message || "Gagal memperbarui notifikasi.");
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "-";

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(parsedDate);
  };

  const roleLabel =
    userRole === "super_admin"
      ? "Super Admin"
      : userRole === "admin"
        ? "Admin"
        : "Kasir";

  return (
    <nav className={styles.navbar}>
      <div className={styles.storeName}>{storeName}</div>

      <div className={styles.userInfo}>
        <div className={styles.notificationWrapper} ref={panelRef}>
          <button
            type="button"
            className={styles.notificationButton}
            onClick={() => setIsOpen((current) => !current)}
            aria-label="Buka riwayat notifikasi"
            aria-expanded={isOpen}
          >
            <Bell size={21} />

            {unreadCount > 0 && (
              <span className={styles.notificationBadge}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {isOpen && (
            <div className={styles.notificationPanel}>
              <div className={styles.notificationHeader}>
                <div>
                  <h3>Notifikasi</h3>
                  <p>
                    {unreadCount > 0
                      ? `${unreadCount} belum dibaca`
                      : "Semua sudah dibaca"}
                  </p>
                </div>

                <button
                  type="button"
                  className={styles.closeNotificationButton}
                  onClick={() => setIsOpen(false)}
                  aria-label="Tutup notifikasi"
                >
                  <X size={18} />
                </button>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  className={styles.markAllButton}
                  onClick={handleMarkAllAsRead}
                >
                  <CheckCheck size={15} />
                  Tandai semua dibaca
                </button>
              )}

              <div className={styles.notificationList}>
                {loading ? (
                  <div className={styles.notificationState}>
                    <LoaderCircle className={styles.spinner} size={24} />
                    <p>Memuat notifikasi...</p>
                  </div>
                ) : error ? (
                  <div className={styles.notificationState}>
                    <p>{error}</p>
                    <button
                      type="button"
                      onClick={fetchNotifications}
                    >
                      Coba lagi
                    </button>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className={styles.notificationState}>
                    <Bell size={30} />
                    <p>Belum ada notifikasi</p>
                    <span>Notifikasi terbaru akan muncul di sini.</span>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <button
                      type="button"
                      key={notification.id}
                      className={`${styles.notificationItem} ${
                        !notification.isRead
                          ? styles.unreadNotification
                          : ""
                      }`}
                      onClick={() =>
                        handleNotificationClick(notification)
                      }
                      disabled={markingId === notification.id}
                    >
                      <span className={styles.notificationIcon}>
                        <Bell size={17} />
                      </span>

                      <span className={styles.notificationContent}>
                        <span className={styles.notificationTitle}>
                          {notification.title || "Notifikasi"}
                          {!notification.isRead && (
                            <span className={styles.unreadDot} />
                          )}
                        </span>

                        <span className={styles.notificationMessage}>
                          {notification.message || notification.body || ""}
                        </span>

                        <span className={styles.notificationDate}>
                          <Clock size={12} />
                          {formatDate(
                            notification.createdAt ||
                              notification.created_at
                          )}
                        </span>
                      </span>

                      {notification.href && (
                        <ExternalLink
                          className={styles.notificationLinkIcon}
                          size={15}
                        />
                      )}
                    </button>
                  ))
                )}
              </div>

              <button
                type="button"
                className={styles.notificationFooter}
                onClick={() => {
                  setIsOpen(false);
                  router.push("/notifications");
                }}
              >
                Lihat riwayat notifikasi
                <ExternalLink size={15} />
              </button>
            </div>
          )}
        </div>

        <div className={styles.userProfile}>
          <span className={styles.userName}>{userName}</span>
          <span className={styles.userRole}>{roleLabel}</span>
        </div>

        <LogoutButton />
      </div>
    </nav>
  );
}
