export async function getProducts() {
  const response = await fetch("/api/v1/products");

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil produk");
  }

  return result;
}