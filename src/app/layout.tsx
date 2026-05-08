import type { Metadata, Viewport } from 'next';
import { Fira_Code, Josefin_Sans } from 'next/font/google';
import './globals.css';
import Header from './components/layout/header';
import Footer from './components/layout/footer';
import Background from './components/layout/background';

const josefin = Josefin_Sans({
  subsets: ['latin'],
  variable: '--font-josefin',
  display: 'swap',
});

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '700'],
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
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        suppressHydrationWarning
        className={`h-screen text-foreground bg-background font-sans antialiased flex flex-col ${josefin.variable} ${firaCode.variable}`}
      >
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {children}
        </main>
        <Background />
      </body>
    </html>
  );
}
