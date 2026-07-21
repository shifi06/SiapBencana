import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/lib/toast-context";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "SiapBencana — Database Keahlian Darurat Warga Indonesia",
  description: "Direktori relawan siaga bencana Indonesia — migrasi dari Google Sheets ke Next.js + Express + PostgreSQL",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <main>{children}</main>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
