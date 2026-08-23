import "./globals.css";
import ToastProvider from "@/frontend/components/shared/ToastProvider";

export const metadata = {
  title: "POS App — Kasir",
  description: "Aplikasi kasir (Point of Sale) sederhana",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        {children}

        <ToastProvider />
      </body>
    </html>
  );
}
