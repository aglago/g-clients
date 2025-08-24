import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'G-Clients Admin',
  description: 'Admin panel for G-Clients',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}