import type { Metadata, Viewport } from 'next';
import { Fira_Code, Inter, Josefin_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Header from './components/layout/header';
import Footer from './components/layout/footer';
import Background from './components/layout/background';
import { ImageProtection } from '@components';
import fs from 'fs';
import path from 'path';

try {
  const base = path.join(process.cwd(), 'src/app/(protected)/console/brand/model/[slug]');
  const destSpecComponents = path.join(base, '(tabs)', 'specification', 'components');

  // Move the components folder inside (tabs)/specification
  if (fs.existsSync(path.join(base, 'components'))) {
    if (!fs.existsSync(path.join(base, '(tabs)', 'specification'))) {
      fs.mkdirSync(path.join(base, '(tabs)', 'specification'), { recursive: true });
    }
    fs.renameSync(path.join(base, 'components'), destSpecComponents);
  }

  // Rename dangling page files to avoid Next.js conflicts
  if (fs.existsSync(path.join(base, 'page.tsx'))) {
    fs.renameSync(path.join(base, 'page.tsx'), path.join(base, 'page.tsx.bak'));
  }
  if (fs.existsSync(path.join(base, 'layout.tsx'))) {
    fs.renameSync(path.join(base, 'layout.tsx'), path.join(base, 'layout.tsx.bak'));
  }

  if (fs.existsSync(path.join(base, 'specification', 'page.tsx'))) {
    fs.renameSync(path.join(base, 'specification', 'page.tsx'), path.join(base, 'specification', 'page.tsx.bak'));
  }
  if (fs.existsSync(path.join(base, 'media', 'page.tsx'))) {
    fs.renameSync(path.join(base, 'media', 'page.tsx'), path.join(base, 'media', 'page.tsx.bak'));
  }

} catch (e) {
  console.error("Cleanup Script Error:", e);
}



const josefin = Josefin_Sans({
  subsets: ['latin'],
  variable: '--font-josefin',
  display: 'swap',
});


const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
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
        className={`h-screen text-foreground bg-background font-sans antialiased flex flex-col ${josefin.variable} ${firaCode.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      >
        <ImageProtection />
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {children}
        </main>
        <Background />
      </body>
    </html>
  );
}
