import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChequeIn · Sales OS",
  description:
    "The operating system for ChequeIn's free-payroll sales: target, qualify, activate, earn.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
        <Toaster position="bottom-center" richColors closeButton />
      </body>
    </html>
  );
}
