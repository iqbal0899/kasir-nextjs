const API_URL =
  "/api/v1/dashboard/analytics";

export async function getDashboardAnalytics() {
  const response = await fetch(
    API_URL,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    }
  );

  const result =
    await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Gagal mengambil analytics dashboard"
    );
  }

  return result.data;
}