import './globals.css';

import type { Metadata } from 'next';

import { Barlow_Condensed, Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const barlow_condensed = Barlow_Condensed({
  subsets: ['latin'],
  display: 'swap',
  weight: ['600', '700'],
  variable: '--font-barlow',
});

const jetBrains_mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Shivam's Portfolio",
  description: "Shivam Sangwan's Portfolio",
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${barlow_condensed.variable} ${jetBrains_mono.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
