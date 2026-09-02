"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

import ReceiptModal from "@/frontend/components/pos/ReceiptModal";

import styles from "@/frontend/css/TransactionDetail.module.css";

export default function TransactionDetailPage() {
  const router = useRouter();
  const params = useParams();

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    if (!params?.id) return;

    const fetchTransaction = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/v1/transactions/${params.id}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const text = await response.text();

        let result;

        try {
          result = text ? JSON.parse(text) : null;
        } catch (jsonError) {
          console.error("JSON ERROR:", jsonError);
          throw new Error(
            "Response API transaksi tidak valid"
          );
        }

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Gagal mengambil detail transaksi"
          );
        }

        if (!result?.data) {
          throw new Error(
            "Data transaksi tidak ditemukan"
          );
        }

        const data = result.data;


        setTransaction({
          id: data.id,

          date: data.createdAt
            ? new Date(data.createdAt).toLocaleString(
                "id-ID"
              )
            : "-",

          cashier:
            data.cashier?.username ||
            data.user?.username ||
            "-",

          items: (
            data.transactionItems ||
            data.items ||
            []
          ).map((item) => ({
            name:
              item.product?.name ||
              item.name ||
              "Produk",

            qty: Number(
              item.quantity ||
                item.qty ||
                0
            ),

            price: Number(
              item.price || 0
            ),
          })),

          total: Number(
            data.total || 0
          ),

          method:
            data.paymentMethod ||
            "cash",

          cashReceived: Number(
            data.cashReceived || 0
          ),

          change: Number(
            data.change || 0
          ),
        });
      } catch (error) {
        console.error(
          "TRANSACTION DETAIL ERROR:",
          error
        );

        setError(
          error.message ||
            "Gagal mengambil detail transaksi"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [params?.id]);


  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          Memuat struk transaksi...
        </div>
      </div>
    );
  }


  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Gagal Memuat Transaksi</h2>

          <p>{error}</p>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard/transactions"
              )
            }
            className={styles.backButton}
          >
            Kembali ke Transaksi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ReceiptModal
        open={true}
        onClose={() =>
          router.push(
            "/dashboard/transactions"
          )
        }
        transaction={transaction}
        onPrint={() => window.print()}
      />
    </div>
  );
}

