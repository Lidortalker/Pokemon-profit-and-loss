import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PokeProfit | ניהול השקעות פוקימון",
  description: "אפליקציית פרימיום לניהול ומעקב אחר השקעות קלפי פוקימון",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body>
        {children}
      </body>
    </html>
  );
}
