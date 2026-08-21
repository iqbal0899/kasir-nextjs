import { useMemo, useState } from "react";
import Input from "../ui/Input";
import "../../css/ProductGrid.css";

/**
 * Grid katalog produk & pencarian.
 *
 * Props:
 * - products: [{ id, name, price, stock, image, category }]
 * - onAddToCart: (product) => void
 */
export default function ProductGrid({ products = [], onAddToCart }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");

  const categories = useMemo(() => {
    const unique = new Set(products.map((p) => p.category).filter(Boolean));
    return ["Semua", ...unique];
  }, [products]);

  const filtered = products.filter((p) => {
    const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === "Semua" || p.category === category;
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="product-grid-wrap">
      <div className="product-grid-toolbar">
        <Input
          placeholder="Cari produk..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="product-grid-categories">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-chip ${category === cat ? "category-chip--active" : ""}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="product-grid">
        {filtered.length === 0 && (
          <p className="product-grid-empty">Produk tidak ditemukan.</p>
        )}

        {filtered.map((product) => {
          const outOfStock = product.stock <= 0;
          return (
            <button
              key={product.id}
              className="product-card"
              disabled={outOfStock}
              onClick={() => onAddToCart?.(product)}
            >
              <div className="product-card-image">
                {product.image ? (
                  <img src={product.image} alt={product.name} />
                ) : (
                  <span className="product-card-placeholder">
                    {product.name.charAt(0)}
                  </span>
                )}
              </div>
              <p className="product-card-name">{product.name}</p>
              <p className="product-card-price">
                Rp{product.price.toLocaleString("id-ID")}
              </p>
              <span className="product-card-stock">
                {outOfStock ? "Stok habis" : `Stok: ${product.stock}`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
