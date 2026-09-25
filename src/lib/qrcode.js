import QRCode from "qrcode";

export async function generatePaymentQR({
  transactionId,
  amount,
}) {
  const paymentData = JSON.stringify({
    type: "DUMMY_PAYMENT",
    transactionId,
    amount,
    currency: "IDR",
    status: "PENDING",
  });

  return await QRCode.toDataURL(paymentData, {
    width: 300,
    margin: 2,
    errorCorrectionLevel: "M",
  });
}