"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import { formatDate } from "@/shared/utils/formatDate";

import styles from "@/frontend/css/transactions.module.css";

export default function TransactionPage() {
  const router = useRouter();

  const [transactions, setTransactions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");


  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/v1/transactions",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Gagal mengambil data transaksi"
        );
      }

      setTransactions(
        result.data || []
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
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchTransactions();
  }, []);


  const formatCurrency = (value) => {
    return Number(
      value || 0
    ).toLocaleString("id-ID");
  };

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    return new Date(
      value
    ).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const filteredTransactions =
    transactions.filter(
      (transaction) => {

        const keyword =
          search
            .toLowerCase()
            .trim();

        if (!keyword) {
          return true;
        }

        const id =
          String(
            transaction.id || ""
          ).toLowerCase();

        const username =
          String(
            transaction.cashier
              ?.username || ""
          ).toLowerCase();

        const paymentMethod =
          String(
            transaction.paymentMethod ||
              ""
          ).toLowerCase();

        return (
          id.includes(keyword) ||
          username.includes(keyword) ||
          paymentMethod.includes(keyword)
        );
      }
    );

  const handleDelete = async (id) => {

    const confirmation =
      await Swal.fire({
        title: "Hapus transaksi?",
        text:
          "Transaksi yang dihapus tidak dapat dikembalikan.",
        icon: "warning",

        showCancelButton: true,

        confirmButtonText:
          "Ya, Hapus",

        cancelButtonText:
          "Batal",

        reverseButtons: true,
      });


    if (!confirmation.isConfirmed) {
      return;
    }


    try {

      const response =
        await fetch(
          `/api/v1/transactions/${id}`,
          {
            method: "DELETE",
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


      setTransactions(
        (prev) =>
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


  if (loading) {
    return (
      <main className={styles.container}>

        <div className={styles.message}>
          Memuat data transaksi...
        </div>

      </main>
    );
  }

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
          onClick={fetchTransactions}
        >
          Refresh
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


      {/* SEARCH */}

      <div className={styles.toolbar}>

        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Cari transaksi..."
          className={styles.searchInput}
        />

      </div>


      {/* EMPTY */}

      {!error &&
        filteredTransactions.length === 0 && (
          <div className={styles.message}>

            {search
              ? "Transaksi tidak ditemukan."
              : "Belum ada transaksi."}

          </div>
        )}


      {/* TABLE */}

      {!error &&
        filteredTransactions.length > 0 && (

          <div
            className={
              styles.tableWrapper
            }
          >

            <table className={styles.table}>

              <thead>

                <tr>

                  <th>
                    ID
                  </th>

                  <th>
                    Tanggal
                  </th>

                  <th>
                    Kasir
                  </th>

                  <th>
                    Total
                  </th>

                  <th>
                    Pembayaran
                  </th>

                  <th>
                    Diterima
                  </th>

                  <th>
                    Kembalian
                  </th>

                  <th>
                    Aksi
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredTransactions.map(
                  (transaction) => (

                    <tr
                      key={
                        transaction.id
                      }
                    >

                      <td>
                        #
                        {
                          transaction.id
                        }
                      </td>


                      <td>
                        {formatDate(
                          transaction.createdAt
                        )}
                      </td>


                      <td>
                        {
                          transaction
                            .cashier
                            ?.username ||
                          "-"
                        }
                      </td>


                      <td
                        className={
                          styles.total
                        }
                      >
                        Rp{" "}
                        {formatCurrency(
                          transaction.total
                        )}
                      </td>


                      <td>
                        <span
                          className={
                            styles.paymentBadge
                          }
                        >
                          {
                            transaction
                              .paymentMethod ||
                            "-"
                          }
                        </span>
                      </td>


                      <td>
                        Rp{" "}
                        {formatCurrency(
                          transaction
                            .cashReceived
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

          </div>

        )}

    </main>
  );
}

