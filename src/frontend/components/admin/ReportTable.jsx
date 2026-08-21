import "../../css/ReportTable.css";

/**
 * Tabel laporan transaksi untuk admin.
 *
 * Props:
 * - transactions: [{ id, date, cashier, itemCount, total, method }]
 */
export default function ReportTable({ transactions = [] }) {
  return (
    <div className="report-table-wrap">
      <table className="report-table">
        <thead>
          <tr>
            <th>No. Transaksi</th>
            <th>Tanggal</th>
            <th>Kasir</th>
            <th>Jumlah Item</th>
            <th>Metode</th>
            <th className="report-table-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 && (
            <tr>
              <td colSpan={6} className="report-table-empty">
                Belum ada data transaksi.
              </td>
            </tr>
          )}

          {transactions.map((trx) => (
            <tr key={trx.id}>
              <td>{trx.id}</td>
              <td>{trx.date}</td>
              <td>{trx.cashier}</td>
              <td>{trx.itemCount}</td>
              <td>
                <span className={`method-badge method-badge--${trx.method}`}>
                  {trx.method === "cash" ? "Tunai" : "QRIS"}
                </span>
              </td>
              <td className="report-table-right">
                Rp{trx.total.toLocaleString("id-ID")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
