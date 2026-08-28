export function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString(
    "id-ID",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}