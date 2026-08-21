import Button from "../ui/Button";
import "../../css/CartSidebar.css";

/**
 * Panel keranjang belanja & item.
 *
 * Props:
 * - items: [{ id, name, price, qty }]
 * - onIncrease, onDecrease, onRemove: (id) => void
 * - onCheckout: () => void
 */
export default function CartSidebar({
  items = [],
  onIncrease,
  onDecrease,
  onRemove,
  onCheckout,
}) {
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <aside className="cart-sidebar">
      <div className="cart-header">
        <h3>Keranjang</h3>
        <span className="cart-count">{totalItems} item</span>
      </div>

      <div className="cart-items">
        {items.length === 0 && (
          <p className="cart-empty">Belum ada produk di keranjang.</p>
        )}

        {items.map((item) => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-info">
              <p className="cart-item-name">{item.name}</p>
              <p className="cart-item-price">
                Rp{item.price.toLocaleString("id-ID")}
              </p>
            </div>

            <div className="cart-item-actions">
              <button
                className="qty-btn"
                onClick={() => onDecrease?.(item.id)}
                aria-label="Kurangi"
              >
                −
              </button>
              <span className="qty-value">{item.qty}</span>
              <button
                className="qty-btn"
                onClick={() => onIncrease?.(item.id)}
                aria-label="Tambah"
              >
                +
              </button>
              <button
                className="cart-item-remove"
                onClick={() => onRemove?.(item.id)}
                aria-label="Hapus"
              >
                &times;
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-footer">
        <div className="cart-total-row">
          <span>Total</span>
          <span className="cart-total-value">
            Rp{total.toLocaleString("id-ID")}
          </span>
        </div>
        <Button
          fullWidth
          size="lg"
          disabled={items.length === 0}
          onClick={onCheckout}
        >
          Bayar
        </Button>
      </div>
    </aside>
  );
}
