import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ReadLess — 少读一点，也能度过考试周和工作日',
  description:
    'AI 文件阅读总结工具。上传 PDF、Word、Markdown 等文件，AI 自动生成总结、考试重点、背诵卡片、速读版。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="min-h-screen bg-[#111111] text-[#f5f5f5] antialiased">
        {/* Subtle background gradient */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#f6d878] opacity-[0.015] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#f6d878] opacity-[0.01] rounded-full blur-[100px]" />
        </div>

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
