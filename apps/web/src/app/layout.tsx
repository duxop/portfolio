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

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${barlowCondensed.variable} ${jetBrainsMono.variable} antialiased`}
    >
      <body className="bg-basalt-950 text-stone-100">{children}</body>
    </html>
  );
}
