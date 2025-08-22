
'use client';

import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { useTheme } from '@/hooks/use-theme';
import { useEffect } from 'react';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

// Metadata would traditionally be in a server component, 
// but for this client-side layout, we'll manage the title directly.
// export const metadata: Metadata = {
//   title: 'Farhetkoun - Find Event Services',
//   description: 'Your one-stop marketplace to find and book services for your next event.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { theme } = useTheme();

  useEffect(() => {
    document.title = 'Farhetkoun - Find Event Services';
  }, []);

  return (
    <html lang="en" className={theme} style={{ colorScheme: theme }}>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
