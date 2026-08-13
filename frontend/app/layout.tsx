import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Route53 Clone',
  description: 'AWS Route53-inspired console UI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
