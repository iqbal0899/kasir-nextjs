import { useEffect } from "react";
import "../../css/Modal.css";

/**
 * Modal dasar dengan overlay. Dipakai sebagai basis untuk
 * PaymentModal, ReceiptModal, dan modal lainnya.
 *
 * Props:
 * - open: boolean
 * - onClose: function
 * - title: string (opsional)
 * - children
 * - width: "sm" | "md" | "lg"
 */
export default function Modal({ open, onClose, title, children, width = "md" }) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-card modal-card--${width}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          {title && <h3 className="modal-title">{title}</h3>}
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Tutup"
          >
            &times;
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
