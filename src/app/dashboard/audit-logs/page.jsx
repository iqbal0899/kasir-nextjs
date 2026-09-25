"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import styles from "@/frontend/css/auditLogs.module.css";
import {
  Search,
  RefreshCw,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

import { formatDate } from "@/shared/utils/formatDate";
import Loading from "@/frontend/components/ui/Loading";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [page, setPage] = useState(1);
  const limit = 10;

  // =====================================================
  // FETCH AUDIT LOGS
  // =====================================================

  const fetchAuditLogs = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(
        "/api/v1/audit-logs",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Gagal mengambil data audit logs"
        );
      }

      setLogs(
        Array.isArray(result.data)
          ? result.data
          : []
      );
    } catch (error) {
      console.error(
        "FETCH AUDIT LOGS ERROR:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal mengambil data audit logs"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =====================================================
  // INITIAL FETCH
  // =====================================================

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  // =====================================================
  // ACTION OPTIONS
  // =====================================================

  const actionOptions = useMemo(() => {
    const actions = logs
      .map((log) =>
        String(log.action || "").trim()
      )
      .filter(Boolean);

    return [...new Set(actions)].sort(
      (a, b) => a.localeCompare(b)
    );
  }, [logs]);

  // =====================================================
  // ROLE OPTIONS
  // =====================================================

  const roleOptions = useMemo(() => {
    const roles = logs
      .map((log) =>
        String(log.role || "").trim()
      )
      .filter(Boolean);

    return [...new Set(roles)].sort(
      (a, b) => a.localeCompare(b)
    );
  }, [logs]);

  // =====================================================
  // FILTER
  // =====================================================

  const filteredLogs = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    const selectedAction =
      actionFilter
        .trim()
        .toUpperCase();

    const selectedRole =
      roleFilter
        .trim()
        .toLowerCase();

    return logs.filter((log) => {
      // -----------------------------------------------
      // SEARCH
      // -----------------------------------------------

      const matchesSearch =
        !keyword ||
        String(log.username || "")
          .toLowerCase()
          .includes(keyword) ||
        String(log.action || "")
          .toLowerCase()
          .includes(keyword) ||
        String(log.description || "")
          .toLowerCase()
          .includes(keyword) ||
        String(log.ipAddress || "")
          .toLowerCase()
          .includes(keyword);

      // -----------------------------------------------
      // ACTION
      // -----------------------------------------------

      const matchesAction =
        !selectedAction ||
        String(log.action || "")
          .trim()
          .toUpperCase() ===
          selectedAction;

      // -----------------------------------------------
      // ROLE
      // -----------------------------------------------

      const matchesRole =
        !selectedRole ||
        String(log.role || "")
          .trim()
          .toLowerCase() ===
          selectedRole;

      // -----------------------------------------------
      // DATE
      // -----------------------------------------------

      let matchesDate = true;

      if (startDate || endDate) {
        if (!log.createdAt) {
          matchesDate = false;
        } else {
          const logDate = new Date(
            log.createdAt
          );

          // Tanggal awal
          if (startDate) {
            const start = new Date(
              `${startDate}T00:00:00`
            );

            if (logDate < start) {
              matchesDate = false;
            }
          }

          // Tanggal akhir
          if (endDate) {
            const end = new Date(
              `${endDate}T23:59:59.999`
            );

            if (logDate > end) {
              matchesDate = false;
            }
          }
        }
      }

      return (
        matchesSearch &&
        matchesAction &&
        matchesRole &&
        matchesDate
      );
    });
  }, [
    logs,
    search,
    actionFilter,
    roleFilter,
    startDate,
    endDate,
  ]);

  // =====================================================
  // RESET PAGE WHEN FILTER CHANGES
  // =====================================================

  useEffect(() => {
    setPage(1);
  }, [
    search,
    actionFilter,
    roleFilter,
    startDate,
    endDate,
  ]);

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredLogs.length / limit
    )
  );

  const currentPage = Math.min(
    page,
    totalPages
  );

  const paginatedLogs = useMemo(() => {
    const startIndex =
      (currentPage - 1) * limit;

    return filteredLogs.slice(
      startIndex,
      startIndex + limit
    );
  }, [
    filteredLogs,
    currentPage,
  ]);

  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = async () => {
    await fetchAuditLogs(true);
  };

  // =====================================================
  // RESET FILTER
  // =====================================================

  const handleReset = () => {
    setSearch("");
    setActionFilter("");
    setRoleFilter("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  // =====================================================
  // ACTION CLASS
  // =====================================================

  const getActionClass = (value) => {
    const normalized = String(
      value || ""
    )
      .trim()
      .toUpperCase();

    switch (normalized) {
      case "CREATE":
      case "CREATE_PRODUCT":
      case "CREATE_TRANSACTION":
        return `${styles["audit-action"]} ${styles["audit-action--create"]}`;

      case "UPDATE":
      case "UPDATE_PRODUCT":
      case "UPDATE_TRANSACTION":
      case "UPDATE_USER":
        return `${styles["audit-action"]} ${styles["audit-action--update"]}`;

      case "DELETE":
      case "DELETE_PRODUCT":
      case "DELETE_TRANSACTION":
      case "DELETE_USER":
        return `${styles["audit-action"]} ${styles["audit-action--delete"]}`;

      case "LOGIN":
        return `${styles["audit-action"]} ${styles["audit-action--login"]}`;

      case "LOGOUT":
        return `${styles["audit-action"]} ${styles["audit-action--logout"]}`;

      default:
        return styles["audit-action"];
    }
  };

  // =====================================================
  // ROLE CLASS
  // =====================================================

  const getRoleClass = (role) => {
    const normalized = String(
      role || ""
    )
      .trim()
      .toLowerCase();

    if (normalized === "super_admin") {
      return `${styles["audit-role"]} ${styles["audit-role--super-admin"]}`;
    }

    if (normalized === "admin") {
      return `${styles["audit-role"]} ${styles["audit-role--admin"]}`;
    }

    if (normalized === "cashier") {
      return `${styles["audit-role"]} ${styles["audit-role--cashier"]}`;
    }

    return styles["audit-role"];
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className={styles["audit-page"]}>
      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className={
          styles["audit-header"]
        }
      >
        <div
          className={
            styles["audit-title"]
          }
        >
          <div>
            <h1>Audit Logs</h1>

            <p>
              Riwayat aktivitas pengguna
              dalam sistem
            </p>
          </div>
        </div>

        <button
          type="button"
          className={
            styles[
              "audit-refresh-button"
            ]
          }
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw
            size={16}
            className={
              refreshing
                ? styles["audit-spin"]
                : ""
            }
          />

          {refreshing
            ? "Memuat..."
            : "Refresh"}
        </button>
      </div>

      {/* =================================================
          FILTER
      ================================================= */}

      <div
        className={
          styles["audit-filter"]
        }
      >
        {/* SEARCH */}

        <div
          className={
            styles["audit-search"]
          }
        >
          <Search size={18} />

          <input
            type="text"
            placeholder="Cari username, action, deskripsi, IP..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />
        </div>

        {/* ACTION */}

        <select
          value={actionFilter}
          onChange={(event) =>
            setActionFilter(
              event.target.value
            )
          }
        >
          <option value="">
            Semua Action
          </option>

          {actionOptions.map(
            (action) => (
              <option
                key={action}
                value={action}
              >
                {action}
              </option>
            )
          )}
        </select>

        {/* ROLE */}

        <select
          value={roleFilter}
          onChange={(event) =>
            setRoleFilter(
              event.target.value
            )
          }
        >
          <option value="">
            Semua Role
          </option>

          {roleOptions.map(
            (role) => (
              <option
                key={role}
                value={role}
              >
                {role}
              </option>
            )
          )}
        </select>

        {/* START DATE */}

        <div
          className={
            styles[
              "audit-date-filter"
            ]
          }
        >
          <input
            type="date"
            value={startDate}
            onChange={(event) =>
              setStartDate(
                event.target.value
              )
            }
            aria-label="Tanggal mulai"
            title="Tanggal mulai"
          />
        </div>

        {/* END DATE */}

        <div
          className={
            styles[
              "audit-date-filter"
            ]
          }
        >
          <input
            type="date"
            value={endDate}
            min={
              startDate ||
              undefined
            }
            onChange={(event) =>
              setEndDate(
                event.target.value
              )
            }
            aria-label="Tanggal akhir"
            title="Tanggal akhir"
          />
        </div>

        {/* RESET */}

        <button
          type="button"
          className={
            styles[
              "audit-reset-button"
            ]
          }
          onClick={handleReset}
        >
          Reset
        </button>
      </div>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div
        className={
          styles["audit-summary"]
        }
      >
        <div>
          <ShieldCheck size={18} />

          <span>
            Total aktivitas:{" "}
            <strong>
              {filteredLogs.length}
            </strong>
          </span>
        </div>
      </div>

      {/* =================================================
          TABLE
      ================================================= */}

      <div
        className={
          styles[
            "audit-table-wrapper"
          ]
        }
      >
        {loading ? (
          <Loading
            text="Memuat audit logs..."
            size="medium"
          />
        ) : paginatedLogs.length ===
          0 ? (
          <div
            className={
              styles["audit-empty"]
            }
          >
            <ShieldCheck size={40} />

            <h3>
              Tidak ada audit log
            </h3>

            <p>
              Belum ada aktivitas yang
              sesuai dengan filter.
            </p>
          </div>
        ) : (
          <table
            className={
              styles["audit-table"]
            }
          >
            <thead>
              <tr>
                <th>No</th>
                <th>Username</th>
                <th>Role</th>
                <th>Action</th>
                <th>Deskripsi</th>
                <th>IP Address</th>
                <th>Waktu</th>
                <th>Detail</th>
              </tr>
            </thead>

            <tbody>
              {paginatedLogs.map(
                (log, index) => (
                  <tr key={log.id}>
                    <td>
                      {(currentPage - 1) *
                        limit +
                        index +
                        1}
                    </td>

                    <td>
                      <strong>
                        {log.username ||
                          "-"}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={getRoleClass(
                          log.role
                        )}
                      >
                        {log.role || "-"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={getActionClass(
                          log.action
                        )}
                      >
                        {log.action || "-"}
                      </span>
                    </td>

                    <td>
                      {log.description ||
                        "-"}
                    </td>

                    <td>
                      {log.ipAddress ||
                        "-"}
                    </td>

                    <td>
                      {formatDate(
                        log.createdAt
                      )}
                    </td>

                    <td>
                      <button
                        type="button"
                        className={
                          styles[
                            "audit-detail-button"
                          ]
                        }
                        onClick={() =>
                          setSelectedLog(
                            log
                          )
                        }
                        title="Lihat detail"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* =================================================
          PAGINATION
      ================================================= */}

      {!loading &&
        filteredLogs.length > 0 && (
          <div
            className={
              styles[
                "audit-pagination"
              ]
            }
          >
            <button
              type="button"
              onClick={() =>
                setPage((prev) =>
                  Math.max(
                    prev - 1,
                    1
                  )
                )
              }
              disabled={
                currentPage === 1
              }
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft
                size={18}
              />
            </button>

            <span>
              Halaman {currentPage} dari{" "}
              {totalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                setPage((prev) =>
                  Math.min(
                    prev + 1,
                    totalPages
                  )
                )
              }
              disabled={
                currentPage ===
                totalPages
              }
              aria-label="Halaman berikutnya"
            >
              <ChevronRight
                size={18}
              />
            </button>
          </div>
        )}

      {/* =================================================
          DETAIL MODAL
      ================================================= */}

      {selectedLog && (
        <div
          className={
            styles[
              "audit-modal-overlay"
            ]
          }
          onClick={() =>
            setSelectedLog(null)
          }
        >
          <div
            className={
              styles["audit-modal"]
            }
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* MODAL HEADER */}

            <div
              className={
                styles[
                  "audit-modal-header"
                ]
              }
            >
              <div>
                <h2>
                  Detail Audit Log
                </h2>

                <p>
                  Informasi lengkap
                  aktivitas pengguna
                </p>
              </div>

              <button
                type="button"
                className={
                  styles[
                    "audit-close-button"
                  ]
                }
                onClick={() =>
                  setSelectedLog(null)
                }
                aria-label="Tutup"
              >
                <X size={20} />
              </button>
            </div>

            {/* MODAL CONTENT */}

            <div
              className={
                styles[
                  "audit-detail-content"
                ]
              }
            >
              <div
                className={
                  styles[
                    "audit-detail-grid"
                  ]
                }
              >
                <div>
                  <span>ID</span>

                  <strong>
                    {selectedLog.id ||
                      "-"}
                  </strong>
                </div>

                <div>
                  <span>
                    Username
                  </span>

                  <strong>
                    {selectedLog.username ||
                      "-"}
                  </strong>
                </div>

                <div>
                  <span>Role</span>

                  <strong>
                    {selectedLog.role ||
                      "-"}
                  </strong>
                </div>

                <div>
                  <span>
                    Action
                  </span>

                  <strong
                    className={getActionClass(
                      selectedLog.action
                    )}
                  >
                    {selectedLog.action ||
                      "-"}
                  </strong>
                </div>

                <div>
                  <span>
                    IP Address
                  </span>

                  <strong>
                    {selectedLog.ipAddress ||
                      "-"}
                  </strong>
                </div>

                <div>
                  <span>
                    Waktu
                  </span>

                  <strong>
                    {formatDate(
                      selectedLog.createdAt
                    )}
                  </strong>
                </div>
              </div>

              {/* DESKRIPSI */}

              <div>
                <span>
                  Deskripsi
                </span>

                <p>
                  {selectedLog.description ||
                    "-"}
                </p>
              </div>

              {/* USER AGENT */}

              {selectedLog.userAgent && (
                <div
                  className={
                    styles[
                      "audit-user-agent"
                    ]
                  }
                >
                  <span>
                    User Agent
                  </span>

                  <p>
                    {
                      selectedLog.userAgent
                    }
                  </p>
                </div>
              )}

              {/* METADATA */}

              {selectedLog.metadata && (
                <div>
                  <span>
                    Metadata
                  </span>

                  <pre>
                    {typeof selectedLog.metadata ===
                    "string"
                      ? selectedLog.metadata
                      : JSON.stringify(
                          selectedLog.metadata,
                          null,
                          2
                        )}
                  </pre>
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}

            <div
              className={
                styles[
                  "audit-modal-footer"
                ]
              }
            >
              <button
                type="button"
                onClick={() =>
                  setSelectedLog(null)
                }
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}