import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI民政局 - 与AI伴侣深度绑定',
  description: '一款支持与AI伴侣进行深度绑定的RAG应用，包含仪式感强烈的"AI民政局"首页和沉浸式聊天界面',
  keywords: ['AI', '伴侣', '聊天', 'RAG', '知识库', '人工智能'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
