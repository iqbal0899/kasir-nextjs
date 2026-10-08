const INVENTORY_API_URL = process.env.INVENTORY_API_URL;

export async function createInventoryRequest(data) {
  const response = await fetch(
    `${INVENTORY_API_URL}/api/v1/requests`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message || "Gagal membuat request inventory"
    );
  }

  return result;
}