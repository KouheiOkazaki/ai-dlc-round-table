import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "備品貸出管理システム",
  description: "備品の貸出・返却・在庫状況を管理するシステム",
};

const navItems = [
  { href: "/dashboard", label: "ダッシュボード" },
  { href: "/items", label: "備品マスタ" },
  { href: "/scan", label: "QRスキャン" },
  { href: "/history", label: "貸出履歴" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${geistSans.variable} h-full antialiased`}>
      <body className="h-full flex flex-col bg-gray-50 text-gray-900">
        {/* ヘッダー */}
        <header className="h-12 flex-shrink-0 bg-slate-800 text-white flex items-center px-4 gap-4 border-b border-slate-700">
          <span className="text-sm font-semibold tracking-wide whitespace-nowrap">
            備品貸出管理システム
          </span>
          <span className="text-slate-500 select-none">|</span>
          <nav className="flex items-center gap-1">
            {navItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 rounded text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
        </header>

        {/* メインコンテンツ */}
        <main className="flex-1 overflow-auto">{children}</main>
      </body>
    </html>
  );
}
