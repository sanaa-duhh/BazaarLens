import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { HealthCheck } from '@/components/HealthCheck';
import './globals.css';

const geist = localFont({ src: './fonts/GeistVF.woff', variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'BazaarLens — AI Market Intelligence',
  description: 'Point your camera at any product. Your AI intelligence team watches its market forever.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'BazaarLens',
  },
  icons: {
    apple: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${geist.variable}`}>
      <body className="bg-background text-foreground font-sans antialiased min-h-screen">
        <HealthCheck />
        {children}
      </body>
    </html>
  );
}
