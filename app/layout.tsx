import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Undrstatemnt",
  description: "Book your appointment with Undrstatemnt",
  icons: {
    icon: '/favicon.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ height: 'auto', minHeight: 'auto', overflow: 'visible' }}>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#D97639" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Undrstatemnt" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ height: 'auto', minHeight: 'auto',  overflow: 'visible' }}
      >
        {/* PWA service worker registration via client component */}
        {/* eslint-disable-next-line @typescript-eslint/no-var-requires */}
        {(() => {
          const PwaRegister = require('../components/PwaRegister').default;
          return <PwaRegister />;
        })()}
        {children}
      </body>
    </html>
  );
}
