import "../../css/Dashboard.css";

/**
 * Dashboard admin — ringkasan penjualan.
 *
 * Props:
 * - summary: { todaySales, todayTransactions, totalProducts, lowStockCount }
 */
export default function Dashboard({ summary = {} }) {
  const {
    todaySales = 0,
    todayTransactions = 0,
    totalProducts = 0,
    lowStockCount = 0,
  } = summary;

  const cards = [
    { label: "Penjualan Hari Ini", value: `Rp${todaySales.toLocaleString("id-ID")}` },
    { label: "Transaksi Hari Ini", value: todayTransactions },
    { label: "Total Produk", value: totalProducts },
    { label: "Stok Menipis", value: lowStockCount, warn: lowStockCount > 0 },
  ];

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Dashboard</h2>

      <div className="dashboard-cards">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`dashboard-card ${card.warn ? "dashboard-card--warn" : ""}`}
          >
            <p className="dashboard-card-label">{card.label}</p>
            <p className="dashboard-card-value">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
