"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";

import "../../css/PaymentModal.css";

export default function PaymentModal({
  open,
  onClose,
  total = 0,
  items = [],
  onConfirm,
}) {
  const [method, setMethod] = useState("cash");
  const [cashReceived, setCashReceived] = useState("");
  const [loading, setLoading] = useState(false);

  // =====================================================
  // RESET FORM KETIKA MODAL DITUTUP
  // =====================================================

  useEffect(() => {
    if (!open && !loading) {
      setMethod("cash");
      setCashReceived("");
    }
  }, [open, loading]);

  const receivedAmount =
    Number(cashReceived) || 0;

  const change =
    receivedAmount - total;

  const canConfirm =
    !loading &&
    (
      method === "qris" ||
      receivedAmount >= total
    );

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  function handleClose() {
    // Jangan izinkan modal ditutup ketika
    // transaksi masih diproses
    if (loading) {
      return;
    }

    setMethod("cash");
    setCashReceived("");

    onClose?.();
  }

  // =====================================================
  // CONFIRM PAYMENT
  // =====================================================

  async function handleConfirm() {
    // Cegah double submit
    if (loading) {
      return;
    }

    // Validasi pembayaran
    if (!canConfirm) {
      if (method === "cash") {
        toast.warning(
          "Uang yang diterima belum mencukupi."
        );
      }

      return;
    }

    // Validasi keranjang
    if (!items.length) {
      toast.warning(
        "Keranjang masih kosong."
      );

      return;
    }

    setLoading(true);

    try {
      // =================================================
      // IDEMPOTENCY KEY
      // =================================================

      const idempotencyKey =
        crypto.randomUUID();

      const paymentData = {
        method,

        cashReceived:
          method === "cash"
            ? receivedAmount
            : 0,

        change:
          method === "cash"
            ? Math.max(change, 0)
            : 0,

        idempotencyKey,
      };

      console.log(
        "PAYMENT DATA:",
        paymentData
      );

      // =================================================
      // KIRIM KE BACKEND
      // =================================================

      await onConfirm?.(
        paymentData
      );

      // =================================================
      // RESET SETELAH BERHASIL
      // =================================================

      setCashReceived("");
      setMethod("cash");

    } catch (error) {
      console.error(
        "PAYMENT ERROR:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memproses pembayaran.";

      toast.error(message);

    } finally {
      // Loading selalu berhenti setelah
      // request selesai / error
      setLoading(false);
    }
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Metode Pembayaran"
      width="sm"
    >
      {/* =================================================
          TOTAL
      ================================================= */}

      <div className="payment-total">
        <span>
          Total Tagihan
        </span>

        <strong>
          Rp{" "}
          {total.toLocaleString("id-ID")}
        </strong>
      </div>

      {/* =================================================
          PAYMENT METHOD
      ================================================= */}

      <div className="payment-methods">

        <button
          type="button"
          disabled={loading}
          className={`payment-method ${
            method === "cash"
              ? "payment-method--active"
              : ""
          }`}
          onClick={() => {
            if (loading) return;

            setMethod("cash");
          }}
        >
          Tunai
        </button>

        <button
          type="button"
          disabled={loading}
          className={`payment-method ${
            method === "qris"
              ? "payment-method--active"
              : ""
          }`}
          onClick={() => {
            if (loading) return;

            setMethod("qris");
            setCashReceived("");
          }}
        >
          QRIS
        </button>

      </div>

      {/* =================================================
          CASH
      ================================================= */}

      {method === "cash" ? (

        <div className="payment-cash">

          <Input
            label="Uang Diterima"
            type="number"
            placeholder="0"
            value={cashReceived}
            disabled={loading}
            onChange={(e) =>
              setCashReceived(
                e.target.value
              )
            }
          />

          <div className="payment-change-row">

            <span>
              Kembalian
            </span>

            <strong>
              Rp{" "}
              {(
                change > 0
                  ? change
                  : 0
              ).toLocaleString(
                "id-ID"
              )}
            </strong>

          </div>

          {/* Uang kurang */}

          {receivedAmount > 0 &&
            receivedAmount < total && (
              <p
                style={{
                  color: "#dc2626",
                  fontSize: "13px",
                  marginTop: "8px",
                }}
              >
                Uang kurang Rp{" "}
                {(
                  total -
                  receivedAmount
                ).toLocaleString(
                  "id-ID"
                )}
              </p>
            )}

        </div>

      ) : (

        /* =================================================
           QRIS
        ================================================= */

        <div className="payment-qris">

          <div className="payment-qris-box">
            QR Code Placeholder
          </div>

          <p>
            Scan kode QR di atas
            untuk menyelesaikan
            pembayaran.
          </p>

        </div>

      )}

      {/* =================================================
          CONFIRM BUTTON
      ================================================= */}

      <Button
        fullWidth
        size="lg"
        disabled={!canConfirm}
        onClick={handleConfirm}
      >
        {loading ? (
          <>
            <span className="payment-loading-spinner" />
            Memproses Pembayaran...
          </>
        ) : (
          "Konfirmasi Pembayaran"
        )}
      </Button>

    </Modal>
  );
}