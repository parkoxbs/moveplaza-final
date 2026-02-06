import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

// 폰트 설정 (기존 코드 유지)
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// ✅ 여기를 수정하세요! (아이콘 설정 추가)
export const metadata: Metadata = {
  title: "Moveplaza",
  description: "엘리트 선수를 위한 데이터 플랫폼",
  manifest: "/manifest.json", // 안드로이드용
  icons: {
    icon: "/logo.png", // 브라우저 탭 아이콘 (파비콘)
    apple: "/logo.png", // 아이폰 바탕화면 아이콘
  },
};

// ✅ 뷰포트 설정 (모바일에서 더 앱처럼 보이게)
export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // 확대/축소 막기 (진짜 앱처럼)
};

// ... 아래 RootLayout 함수는 그대로 두세요 ...