import type { Metadata, Viewport } from 'next';
import { Fira_Code } from 'next/font/google';
import './globals.css';
import AnimatedBackground from '@/components/Background';

/* Exact font setup from github/esona/web/app/theme/fonts/fonts.ts */
const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Sawari Sadhan | Vehicle Intelligence',
  description: 'AI-Powered Knowledge Graph for the Vehicle Domain in Nepal',
  icons: { icon: '/favicon.ico' },
};

export const viewport: Viewport = {
  themeColor: [{ media: '(prefers-color-scheme: dark)', color: '#121218' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /* Exact body structure from github/esona/web/app/layout.tsx */
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        suppressHydrationWarning
        className={`h-screen text-foreground bg-background font-sans antialiased flex flex-col ${firaCode.variable} ${firaCode.className}`}
      >
        <div className="flex flex-col h-screen">
          {/* Topbar */}
          <header className="w-full border-b border-white/15 bg-[#1a1a22]/90 backdrop-blur-md relative overflow-hidden z-50">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-cyan-500/5" />
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 md:px-8 relative z-10">
              <div className="flex items-center justify-center h-14 sm:h-16">
                <div className="text-gray-400 text-xs sm:text-sm md:text-base font-normal text-center">
                  <span className="font-semibold text-white">Sawari Sadhan</span>
                  <span className="mx-1.5 text-white/40">|</span>
                  <span className="font-light">Vehicle Intelligence Agent</span>
                </div>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {children}
          </main>

          {/* Footer — exact copy of github/esona/web footer */}
          <footer className="w-full border-t border-white/15 bg-[#1a1a22]/90 backdrop-blur-md relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5" />
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 md:px-8 relative z-10">
              <div className="flex items-center justify-center h-12 sm:h-14 md:h-16">
                <div className="text-xs sm:text-sm md:text-[13px] text-gray-400 text-center">
                  Sawari Sadhan by Sawari Sadhan Team | Vehicle Knowledge Graph v1.0
                </div>
              </div>
            </div>
          </footer>
        </div>

        {/* AnimatedBackground sits behind everything */}
        <AnimatedBackground />
      </body>
    </html>
  );
}
