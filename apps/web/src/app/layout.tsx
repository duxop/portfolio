import './globals.css';

import type { Metadata } from 'next';

import { Barlow_Condensed, Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-barlow',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: "Shivam's Portfolio",
  description: "Shivam Sangwan's Portfolio",
};

// Runs before the first paint, so a visitor never sees the wrong theme flash. It's a string, so
// TypeScript and ESLint can't check it: test it in the browser.
const themeScript = `
  try {
    const saved = localStorage.getItem('theme');
    const theme =
      saved === 'light' || saved === 'dark'
        ? saved
        : matchMedia('(prefers-color-scheme: light)').matches
          ? 'light'
          : 'dark';
    document.documentElement.dataset.theme = theme;
  } catch {}
`;

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${barlowCondensed.variable} ${jetBrainsMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-background text-foreground">{children}</body>
    </html>
  );
}
