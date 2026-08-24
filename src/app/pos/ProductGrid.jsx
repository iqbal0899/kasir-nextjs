"use client";

export default function ProductGrid({
  products,
  onAddToCart,
}) {
  return (
    <div className="product-grid">

      {products.map((product) => (
        <div
          className="product-card"
          key={product.id}
        >

          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="product-image"
            />
          ) : (
            <div className="product-image-placeholder">
              Tidak ada gambar
            </div>
          )}

          <div className="product-info">

            <h3>
              {product.name}
            </h3>

            <p>
              {product.category || "Tanpa kategori"}
            </p>

            <strong>
              Rp{" "}
              {Number(
                product.price
              ).toLocaleString("id-ID")}
            </strong>

            <span>
              Stock: {product.stock}
            </span>

            <button
              type="button"
              disabled={product.stock <= 0}
              onClick={() =>
                onAddToCart(product)
              }
            >
              {product.stock <= 0
                ? "Stok Habis"
                : "Tambah"}
            </button>

          </div>

        </div>
      ))}

    </div>
  );
}