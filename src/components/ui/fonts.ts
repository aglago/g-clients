import { Inter, Figtree } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap',
  fallback: ['system-ui', 'arial']
});

const fig = Figtree({ 
  subsets: ['latin'], 
  variable: '--font-figtree',
  display: 'swap',
  fallback: ['system-ui', 'arial']
});

export { inter, fig };