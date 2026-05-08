import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "Clara Trademarks",
  description: "Sistema de gestión y seguimiento de registros de marcas — Clara",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-900">
        <SessionProvider>
          {children}
        </SessionProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1a1b4e",
              color: "#fff",
            },
            success: {
              style: { background: "#166534" },
            },
            error: {
              style: { background: "#991b1b" },
            },
          }}
        />
      </body>
    </html>
  );
}
