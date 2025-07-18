import './globals.css';
import type { Metadata } from 'next';
import { Inter, Figtree } from 'next/font/google';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const fig = Figtree({ subsets: ['latin'], variable: '--font-fig' });

export const metadata: Metadata = {
  title: 'G-Clients Admin',
  description: 'Admin panel for G-Clients',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${fig.className}`}>
        <Providers>{children}</Providers>
        <Toaster position='top-right' />
      </body>
    </html>
  );
}