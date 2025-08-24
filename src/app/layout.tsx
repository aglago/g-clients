import './globals.css';
import type { Metadata } from 'next';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/sonner';
import { fig, inter } from '@/components/ui/fonts';


export const metadata: Metadata = {
  title: 'G-Clients',
  description: 'Learn new skills with expert-led courses',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${fig.className} antialiased`}>
        <Providers>{children}</Providers>
        <Toaster position='top-right' />
      </body>
    </html>
  );
}