import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

// 👇 1. 메타데이터에 PWA 매니페스트 연결
export const metadata: Metadata = {
  title: 'Moveplaza',
  description: '데이터 기반 재활 및 운동 관리',
  manifest: '/manifest.webmanifest',
}

// 👇 2. 뷰포트 설정 추가 (모바일에서 확대/축소 막고 앱처럼 보이게 함)
export const viewport: Viewport = {
  themeColor: "#1e3a8a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      {/* 👇 기존에 있던 overflow-x-hidden 유지 */}
      <body className={`${inter.className} overflow-x-hidden`}>
        {children}
      </body>
    </html>
  )
}