import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google"; // ✅ 파일 필요 없는 구글 폰트 사용
import "./globals.css";

// ✅ 폰트 설정 (이게 자동으로 폰트를 가져옵니다)
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Moveplaza",
  description: "엘리트 선수를 위한 데이터 플랫폼",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      {/* ✅ body 태그에 폰트 적용 */}
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}