import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "A股每日复盘 - 涨停股票 · 题材板块 · 财经资讯",
  description: "每日A股市场复盘分析：涨停股票按题材归类、板块涨幅排名连榜追踪、财经重点资讯",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-50 text-gray-900 min-h-screen">{children}</body>
    </html>
  );
}
