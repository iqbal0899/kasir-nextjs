import styles from "../../../frontend/css/transactions.module.css";

export default function TransactionsPage() {
  return (
    <main className={styles.container}>

      <div className={styles.header}>
        <h1 className={styles.title}>
          Transaksi
        </h1>

        <p className={styles.subtitle}>
          Riwayat transaksi Toko Iqal.
        </p>
      </div>

      <div className={styles.summary}>

        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>
            Total Transaksi
          </p>

          <p className={styles.summaryValue}>
            2
          </p>
        </div>

        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>
            Transaksi Selesai
          </p>

          <p className={styles.summaryValue}>
            2
          </p>
        </div>

        <div className={styles.summaryCard}>
          <p className={styles.summaryLabel}>
            Total Pendapatan
          </p>

          <p className={styles.summaryValue}>
            Rp 200.000
          </p>
        </div>

      </div>

      <div className={styles.tableContainer}>

        <table className={styles.table}>

          <thead>
            <tr>
              <th>ID</th>
              <th>Tanggal</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            <tr>
              <td className={styles.transactionId}>
                TRX001
              </td>

              <td>
                21 Agustus 2026
              </td>

              <td className={styles.total}>
                Rp 75.000
              </td>

              <td>
                <span className={styles.status}>
                  Selesai
                </span>
              </td>
            </tr>

            <tr>
              <td className={styles.transactionId}>
                TRX002
              </td>

              <td>
                21 Agustus 2026
              </td>

              <td className={styles.total}>
                Rp 125.000
              </td>

              <td>
                <span className={styles.status}>
                  Selesai
                </span>
              </td>
            </tr>

          </tbody>

        </table>

      </div>

    </main>
  );
}