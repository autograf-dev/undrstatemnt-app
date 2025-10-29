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
    <html lang="en" style={{ height: 'auto', overflow: 'visible' }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ height: 'auto', minHeight: '100vh', overflow: 'visible' }}
      >
        {children}
      </body>
    </html>
  );
}
