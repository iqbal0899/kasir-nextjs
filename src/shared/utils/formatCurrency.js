export function formatCurrency(value) {
  const number = Number(value || 0);

  if (Number.isNaN(number)) {
    return "Rp 0";
  }

  return `Rp ${number.toLocaleString("id-ID")}`;
}

export default formatCurrency;

