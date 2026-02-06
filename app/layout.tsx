import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Moveplaza",
  description: "Athlete Performance Log",
  manifest: "/manifest.json", // 👈 여기가 핵심!
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <meta name="theme-color" content="#1e3a8a" />
        <link rel="apple-touch-icon" href="https://cdn-icons-png.flaticon.com/512/1946/1946429.png" />
      </head>
      <body className={inter.className}>
        <Toaster position="top-center" />
        {children}
      </body>
    </html>
  );
}