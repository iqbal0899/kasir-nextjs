
"use client";

import { useState } from "react";
import Swal from "sweetalert2";

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
  const [method, setMethod] =
    useState("cash");

  const [cashReceived, setCashReceived] =
    useState("");

  const receivedAmount =
    Number(cashReceived) || 0;

  const change =
    receivedAmount - total;

  const canConfirm =
    method === "qris" ||
    receivedAmount >= total;

async function handleConfirm() {
  if (!canConfirm) {
    return;
  }

  try {
    if (!items.length) {
      throw new Error("Keranjang masih kosong");
    }

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
    };

    await onConfirm?.(paymentData);

  } catch (error) {
    console.error("PAYMENT ERROR:", error);

    Swal.fire({
      icon: "error",
      title: "Pembayaran Gagal",
      text:
        error?.message ||
        "Terjadi kesalahan saat memproses pembayaran.",
      confirmButtonText: "OK",
    });
  }
}

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Metode Pembayaran"
      width="sm"
    >
      <div className="payment-total">
        <span>
          Total Tagihan
        </span>

        <strong>
          Rp
          {total.toLocaleString(
            "id-ID"
          )}
        </strong>
      </div>

      <div className="payment-methods">
        <button
          type="button"
          className={`payment-method ${
            method === "cash"
              ? "payment-method--active"
              : ""
          }`}
          onClick={() =>
            setMethod("cash")
          }
        >
          Tunai
        </button>

        <button
          type="button"
          className={`payment-method ${
            method === "qris"
              ? "payment-method--active"
              : ""
          }`}
          onClick={() =>
            setMethod("qris")
          }
        >
          QRIS
        </button>
      </div>

      {method === "cash" ? (
        <div className="payment-cash">

          <Input
            label="Uang Diterima"
            type="number"
            placeholder="0"
            value={cashReceived}
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
              Rp
              {(
                change > 0
                  ? change
                  : 0
              ).toLocaleString(
                "id-ID"
              )}
            </strong>
          </div>

        </div>
      ) : (
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

      <Button
        fullWidth
        size="lg"
        disabled={!canConfirm}
        onClick={handleConfirm}
      >
        Konfirmasi Pembayaran
      </Button>
    </Modal>
  );
}

