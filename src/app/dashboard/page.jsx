import styles from "../../frontend/css/dashboard.module.css";
import { products } from "../../frontend/data/products";

export default function DashboardPage() {

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (total, product) => total + product.stock,
    0
  );

  return (
    <main className={styles.container}>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            Dashboard
          </h1>

          <p className={styles.subtitle}>
            Selamat datang di Toko Iqbal
          </p>
        </div>
      </div>

      <div className={styles.cards}>

        <div className={styles.card}>
          <p>Total Produk</p>
          <h2>{totalProducts}</h2>
        </div>

        <div className={styles.card}>
          <p>Total Stock</p>
          <h2>{totalStock}</h2>
        </div>

        <div className={styles.card}>
          <p>Total Transaksi</p>
          <h2>2</h2>
        </div>

        <div className={styles.card}>
          <p>Pendapatan</p>
          <h2>Rp 200.000</h2>
        </div>

      </div>

      <section className={styles.productSection}>

        <div className={styles.sectionHeader}>
          <h2>Daftar Produk</h2>
        </div>

        <div className={styles.productList}>

          {products.map((product) => (
            <div
              className={styles.productItem}
              key={product.id}
            >
              <div>
                <h3>{product.name}</h3>
                <span>{product.category}</span>
              </div>

              <strong>
                Rp {product.price.toLocaleString("id-ID")}
              </strong>

              <span>
                Stock: {product.stock}
              </span>
            </div>
          ))}

        </div>

      </section>

    </main>
  );
}