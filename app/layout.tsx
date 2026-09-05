import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthContext';
import Navigation from '@/components/Navigation';
import AuthModal from '@/components/AuthModal';
import Footer from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Incuti — AI Conservation Agriculture Platform',
  description: "Isuzuma ry'umurima n'ubutaka ukoresheje AI, amasomo y'ubuhinzi bubungabunga ibidukikije, no kugisha inama Incuti Bot mu Rwanda.",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#145726',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="rw" className={inter.variable}>
      <body className="min-h-screen bg-[#f4f7f4] text-gray-900 antialiased flex flex-col font-sans selection:bg-[#145726] selection:text-white">
        <AuthProvider>
          <Navigation />
          <AuthModal />
          {/* Main Content with bottom padding on mobile for fixed navigation bar */}
          <main className="flex-1 pb-28 md:pb-10 max-w-6xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

