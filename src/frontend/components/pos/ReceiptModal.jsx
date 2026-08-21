import Modal from "../ui/Modal";
import Button from "../ui/Button";
import "../../css/ReceiptModal.css";

/**
 * Modal pratinjau & cetak struk.
 *
 * Props:
 * - open, onClose
 * - transaction: {
 *     id, date, cashier, items: [{ name, qty, price }],
 *     total, method, cashReceived, change
 *   }
 * - onPrint: () => void
 */
export default function ReceiptModal({ open, onClose, transaction, onPrint }) {
  if (!transaction) return null;

  const { id, date, cashier, items = [], total, method, cashReceived, change } =
    transaction;

  return (
    <Modal open={open} onClose={onClose} title="Struk Transaksi" width="sm">
      <div className="receipt">
        <div className="receipt-meta">
          <p>No. Transaksi: {id}</p>
          <p>Tanggal: {date}</p>
          {cashier && <p>Kasir: {cashier}</p>}
        </div>

        <div className="receipt-items">
          {items.map((item, i) => (
            <div key={i} className="receipt-item">
              <span>
                {item.qty}x {item.name}
              </span>
              <span>
                Rp{(item.qty * item.price).toLocaleString("id-ID")}
              </span>
            </div>
          ))}
        </div>

        <div className="receipt-total-row">
          <span>Total</span>
          <strong>Rp{total.toLocaleString("id-ID")}</strong>
        </div>

        <div className="receipt-payment-row">
          <span>Metode</span>
          <span>{method === "cash" ? "Tunai" : "QRIS"}</span>
        </div>

        {method === "cash" && (
          <>
            <div className="receipt-payment-row">
              <span>Diterima</span>
              <span>Rp{cashReceived?.toLocaleString("id-ID")}</span>
            </div>
            <div className="receipt-payment-row">
              <span>Kembalian</span>
              <span>Rp{change?.toLocaleString("id-ID")}</span>
            </div>
          </>
        )}

        <p className="receipt-thanks">Terima kasih telah berbelanja!</p>
      </div>

      <Button fullWidth onClick={onPrint}>
        Cetak Struk
      </Button>
    </Modal>
  );
}
