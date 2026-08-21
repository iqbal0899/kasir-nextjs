import styles from "../../../frontend/css/product.module.css";
import { products } from "../../../frontend/data/products";

export default function ProductPage() {
  return (
    <main className={styles.container}>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            Products
          </h1>

          <p className={styles.subtitle}>
            Kelola semua produk yang tersedia
          </p>
        </div>

        <button className={styles.addButton}>
          + Tambah Produk
        </button>
      </div>

      <div className={styles.productGrid}>

        {products.map((product) => (
          <div
            className={styles.productCard}
            key={product.id}
          >
            <div className={styles.productContent}>

              <h3 className={styles.productName}>
                {product.name}
              </h3>

              <p className={styles.category}>
                {product.category}
              </p>

              <p className={styles.price}>
                Rp {product.price.toLocaleString("id-ID")}
              </p>

              <p className={styles.stock}>
                Stock: {product.stock}
              </p>

              <div className={styles.cardActions}>
                <button className={styles.editButton}>
                  Edit
                </button>

                <button className={styles.deleteButton}>
                  Hapus
                </button>
              </div>

            </div>
          </div>
        ))}

      </div>

    </main>
  );
}