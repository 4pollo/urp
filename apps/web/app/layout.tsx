import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '../components/providers/theme-provider';

export const metadata: Metadata = {
  title: 'URP',
  description: 'URP full-stack application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
