"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

import { formatCurrency } from "@/shared/utils/formatCurrency";
import { formatDate } from "@/shared/utils/formatDate";

import styles from "@/frontend/css/transactions.module.css";

export default function TransactionPage() {
  const router = useRouter();

  const [transactions, setTransactions] = useState([]);

  // Loading halaman hanya untuk pertama kali
  const [loading, setLoading] = useState(true);

  // Loading khusus tabel
  const [tableLoading, setTableLoading] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [limit, setLimit] = useState(10);

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
  });

  const [startDateTransaction, setStartDateTransaction] = useState("");
  const [endDateTransaction, setEndDateTransaction] = useState("");

  // Untuk membedakan request pertama dengan request berikutnya
  const firstRender = useRef(true);

  // =====================================================
  // FETCH TRANSACTIONS
  // =====================================================

  const fetchTransactions = async ({
    initial = false,
    currentPage = page,
    currentStartDateTransaction = startDateTransaction,
    currentEndDateTransaction = endDateTransaction,
  } = {}) => {
    try {
      if (initial) {
        setLoading(true);
      } else {
        setTableLoading(true);
      }

      setError("");

      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(limit),
      });

      if (currentStartDateTransaction) {
        params.append("startDateTransaction", currentStartDateTransaction);
      }

      if (currentEndDateTransaction) {
        params.append("endDateTransaction", currentEndDateTransaction);
      }

      const response = await fetch(
        `/api/v1/transactions?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Gagal mengambil data transaksi"
        );
      }

      setTransactions(result.data || []);

      setPagination(
        result.pagination || {
          page: currentPage,
          limit,
          total: 0,
          totalPages: 0,
        }
      );
    } catch (error) {
      console.error(
        "FETCH TRANSACTIONS ERROR:",
        error
      );

      setError(
        error.message ||
          "Gagal mengambil data transaksi"
      );
    } finally {
      if (initial) {
        setLoading(false);
      } else {
        setTableLoading(false);
      }
    }
  };

  // =====================================================
  // INITIAL FETCH + PAGINATION
  // =====================================================

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;

      fetchTransactions({
        initial: true,
      });

      return;
    }

    // Perubahan page hanya refresh table
    fetchTransactions({
      initial: false,
    });
  }, [page]);

  // =====================================================
  // FILTER
  // =====================================================

  const handleFilter = () => {
    // Kalau sedang di halaman selain 1,
    // kembalikan ke halaman 1.
    //
    // useEffect [page] akan melakukan fetch.
    if (page !== 1) {
      setPage(1);
      return;
    }

    // Kalau sudah halaman 1,
    // langsung refresh table.
    fetchTransactions({
      initial: false,
      currentPage: 1,
      currentStartDateTransaction: startDateTransaction,
      currentEndDateTransaction: endDateTransaction,
    });
  };

  // =====================================================
  // RESET FILTER
  // =====================================================

  const handleResetFilter = () => {
    setStartDateTransaction("");
    setEndDateTransaction("");

    if (page !== 1) {
      setPage(1);
      return;
    }

    // Karena state masih belum tentu berubah saat fungsi ini
    // dijalankan, kirim value kosong secara langsung.
    fetchTransactions({
      initial: false,
      currentPage: 1,
      currentStartDateTransaction: "",
      currentEndDateTransaction: "",
    });
  };

  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = () => {
    fetchTransactions({
      initial: false,
    });
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredTransactions = transactions.filter(
    (transaction) => {
      const keyword = search
        .toLowerCase()
        .trim();

      if (!keyword) {
        return true;
      }

      const id = String(
        transaction.id || ""
      ).toLowerCase();

      const username = String(
        transaction.cashier?.username || ""
      ).toLowerCase();

      const paymentMethod = String(
        transaction.paymentMethod || ""
      ).toLowerCase();

      return (
        id.includes(keyword) ||
        username.includes(keyword) ||
        paymentMethod.includes(keyword)
      );
    }
  );

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (id) => {
    const confirmation =
      await Swal.fire({
        title: "Hapus transaksi?",
        text:
          "Transaksi yang dihapus tidak dapat dikembalikan.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya, Hapus",
        cancelButtonText: "Batal",
        reverseButtons: true,
      });

    if (!confirmation.isConfirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/v1/transactions/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Gagal menghapus transaksi"
        );
      }

      setTransactions((prev) =>
        prev.filter(
          (transaction) =>
            transaction.id !== id
        )
      );

      await Swal.fire({
        title: "Berhasil!",
        text:
          "Transaksi berhasil dihapus.",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error(
        "DELETE TRANSACTION ERROR:",
        error
      );

      Swal.fire({
        title: "Gagal!",
        text:
          error.message ||
          "Gagal menghapus transaksi.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  // =====================================================
  // SUMMARY
  // =====================================================

  const totalTransaction =
    transactions.length;

  const totalSales =
    transactions.reduce(
      (total, transaction) =>
        total +
        Number(
          transaction.total || 0
        ),
      0
    );

  // =====================================================
  // INITIAL LOADING
  // =====================================================

  if (loading) {
    return (
      <main className={styles.container}>
        <div className={styles.message}>
          Memuat data transaksi...
        </div>
      </main>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className={styles.container}>

      {/* HEADER */}

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            Transaksi
          </h1>

          <p className={styles.subtitle}>
            Kelola seluruh transaksi
            penjualan.
          </p>
        </div>

        <button
          type="button"
          className={styles.refreshButton}
          onClick={handleRefresh}
          disabled={tableLoading}
        >
          {tableLoading
            ? "Memuat..."
            : "Refresh"}
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {/* SUMMARY */}

      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <span>
            Total Transaksi
          </span>

          <strong>
            {totalTransaction}
          </strong>
        </div>

        <div className={styles.summaryCard}>
          <span>
            Total Penjualan
          </span>

          <strong>
            Rp {formatCurrency(totalSales)}
          </strong>
        </div>
      </div>

      {/* TOOLBAR */}

      <div className={styles.toolbar}>

        <div className={styles.filterContainer}>

          <div className={styles.filterGroup}>
            <label htmlFor="startDate">
              Dari tanggal
            </label>

            <input
              id="startDate"
              type="date"
              value={startDateTransaction}
              onChange={(e) =>
                setStartDateTransaction(e.target.value)
              }
            />
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="endDate">
              Sampai tanggal
            </label>

            <input
              id="endDate"
              type="date"
              value={endDateTransaction}
              onChange={(e) =>
                setEndDateTransaction(e.target.value)
              }
            />
          </div>

          <button
            type="button"
            className={styles.filterButton}
            onClick={handleFilter}
            disabled={tableLoading}
          >
            {tableLoading
              ? "Memuat..."
              : "Filter"}
          </button>

          <button
            type="button"
            className={styles.resetButton}
            onClick={handleResetFilter}
            disabled={tableLoading}
          >
            Reset
          </button>

        </div>

        <input
          type="text"
          className={styles.searchInput}
          placeholder="Cari transaksi..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>

      {/* TABLE AREA */}

      <div className={styles.tableWrapper}>

        {tableLoading ? (

          <div className={styles.message}>
            Memuat transaksi...
          </div>

        ) : error ? (

          <div className={styles.message}>
            Gagal memuat transaksi.
          </div>

        ) : filteredTransactions.length === 0 ? (

          <div className={styles.message}>
            {search
              ? "Transaksi tidak ditemukan."
              : "Belum ada transaksi."}
          </div>

        ) : (

          <table className={styles.table}>

            <thead>
              <tr>
                <th>No.</th>
                <th>ID</th>
                <th>Tanggal</th>
                <th>Kasir</th>
                <th>Total</th>
                <th>Pembayaran</th>
                <th>Diterima</th>
                <th>Kembalian</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>

              {filteredTransactions.map(
                (transaction, index) => (

                  <tr
                    key={transaction.id}
                  >

                    <td>
                      {index + 1}
                    </td>

                    <td>
                      #{transaction.id}
                    </td>

                    <td>
                      {formatDate(
                        transaction.createdAt
                      )}
                    </td>

                    <td>
                      {transaction.cashier
                        ?.username || "-"}
                    </td>

                    <td
                      className={
                        styles.total
                      }
                    >
                      Rp{" "}
                      {formatCurrency(
                        transaction.totalAmount
                      )}
                    </td>

                    <td>
                      <span
                        className={
                          styles.paymentBadge
                        }
                      >
                        {transaction.paymentMethod ||
                          "-"}
                      </span>
                    </td>

                    <td>
                      Rp{" "}
                      {formatCurrency(
                        transaction.cashReceived
                      )}
                    </td>

                    <td>
                      Rp{" "}
                      {formatCurrency(
                        transaction.change
                      )}
                    </td>

                    <td>
                      <div
                        className={
                          styles.actions
                        }
                      >

                        <button
                          type="button"
                          className={
                            styles.detailButton
                          }
                          onClick={() =>
                            router.push(
                              `/dashboard/transactions/${transaction.id}`
                            )
                          }
                        >
                          Detail
                        </button>

                        <button
                          type="button"
                          className={
                            styles.deleteButton
                          }
                          onClick={() =>
                            handleDelete(
                              transaction.id
                            )
                          }
                        >
                          Hapus
                        </button>

                      </div>
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        )}

      </div>

      {/* PAGINATION */}

      <div className={styles.pagination}>

        <button
          type="button"
          onClick={() =>
            setPage((prev) => prev - 1)
          }
          disabled={
            page === 1 || tableLoading
          }
        >
          Previous
        </button>

        <span>
          Halaman {page} dari{" "}
          {pagination.totalPages}
        </span>

        <button
          type="button"
          onClick={() =>
            setPage((prev) => prev + 1)
          }
          disabled={
            page === pagination.totalPages ||
            pagination.totalPages === 0 ||
            tableLoading
          }
        >
          Next
        </button>

      </div>

    </main>
  );
}