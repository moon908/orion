import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Orion - Solar System Simulation (NASA Eyes Inspired)',
  description: 'An interactive, scientifically-inspired 3D Solar System Simulation modeled on NASA Eyes. Explore orbits, planetary scales, time travel telemetry, and physical properties in real-time.',
  keywords: ['solar system', '3d simulation', 'nasa eyes', 'astronomy', 'space exploration', 'keplerian orbits', 'interactive planets'],
  authors: [{ name: 'Orion Space Technologies' }],
  openGraph: {
    title: 'Orion - Solar System Simulation',
    description: 'An interactive, scientifically-inspired 3D Solar System Simulation modeled on NASA Eyes.',
    type: 'website',
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} font-sans h-full w-full overflow-hidden select-none antialiased`}>
      <body className="h-full w-full overflow-hidden bg-[#09090B] text-white">
        {children}
      </body>
    </html>
  );
}
