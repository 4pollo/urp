import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '../components/providers/theme-provider';
import { Toaster } from '../components/ui/sonner';

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
        <ThemeProvider>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
