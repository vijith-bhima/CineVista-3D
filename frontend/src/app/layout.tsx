import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'CineVista — Cinema in 3D',
  description: 'Choose your seat in real-time 3D and see the screen from your exact perspective before booking.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#fafafa] dark:bg-[#07080B] text-slate-900 dark:text-slate-100 antialiased transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <AuthModal />
            <main className="relative min-h-[calc(100vh-3.5rem)] scroll-smooth">{children}</main>
            <footer className="border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0e14] py-8 text-xs text-slate-500 dark:text-slate-400 transition-colors">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-slate-500 dark:text-slate-400">
                  © {new Date().getFullYear()} CineVista. All tickets issued with verified entrance barcodes.
                </p>
                <p className="text-slate-400 dark:text-slate-500">
                  Dolby Atmos • Christie 4K Laser • Real-time WebGL
                </p>
              </div>
            </footer>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
