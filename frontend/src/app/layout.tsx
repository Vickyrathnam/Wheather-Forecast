import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/ui/Providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Weather Forecast — AI-Powered Climate Intelligence',
  description: 'Experience the future of weather intelligence. Real-time AI predictions, cinematic 3D atmospheric simulations, and holographic climate analytics powered by machine learning.',
  keywords: ['weather', 'AI weather', 'climate intelligence', 'weather forecast', 'machine learning weather', '3D weather'],
  authors: [{ name: 'Weather Forecast AI' }],
  openGraph: {
    title: 'Weather Forecast — AI Climate Intelligence Platform',
    description: 'Futuristic AI-powered weather intelligence with real-time 3D simulations',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#02060f',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} antialiased`} style={{ background: 'var(--bg-primary)' }}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
