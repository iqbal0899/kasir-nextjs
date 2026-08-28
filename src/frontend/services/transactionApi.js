const API_URL = "/api/v1/transactions";

export async function getTransactions() {
  try {
    const response = await fetch(API_URL, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Gagal mengambil data transaksi"
      );
    }

    return data.data;
  } catch (error) {
    console.error(
      "FETCH TRANSACTIONS ERROR:",
      error
    );

    throw error;
  }
}

export async function createTransaction({
  items,
  paymentMethod,
  cashReceived,
}) {
  console.log(
    "ITEM CART SEBELUM DIKIRIM:",
    items
  );

  const formattedItems = items.map((item) => ({
    productId: Number(
      item.productId ?? item.id
    ),

    quantity: Number(
      item.quantity ?? item.qty
    ),

    price: Number(item.price),
  }));

  console.log(
    "ITEM TRANSAKSI YANG DIKIRIM:",
    formattedItems
  );

  const response = await fetch(
    API_URL,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      credentials: "include",

      body: JSON.stringify({
        items: formattedItems,

        paymentMethod,

        cashReceived:
          Number(cashReceived) || 0,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Gagal menyimpan transaksi"
    );
  }

  return data;
}

export async function deleteTransaction(id) {
  const response = await fetch(
    `/api/v1/transactions/${id}`,
    {
      method: "DELETE",
    }
  );

  const contentType =
    response.headers.get("content-type");

  let data;

  if (
    contentType &&
    contentType.includes("application/json")
  ) {
    data = await response.json();
  } else {
    const text = await response.text();

    console.error(
      "DELETE RESPONSE BUKAN JSON:",
      text
    );

    throw new Error(
      `Server mengembalikan response bukan JSON (${response.status})`
    );
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Gagal menghapus transaksi"
    );
  }

  return data;
}