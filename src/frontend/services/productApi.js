export async function createProduct(formData) {
  const response = await fetch(
    "/api/v1/products",
    {
      method: "POST",
      body: formData,
    }
  );

  const result =
    await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Gagal menambahkan produk"
    );
  }

  return result;
}