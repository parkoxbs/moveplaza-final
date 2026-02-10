import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

// 👇 메타데이터 (SEO + PWA + 썸네일 설정)
export const metadata: Metadata = {
  title: {
    template: '%s | Moveplaza',
    default: 'Moveplaza | 선수 퍼포먼스 관리 시스템',
  },
  description: '물리치료학과 학생이 만든 운동 선수 부상 관리 및 기록 분석 플랫폼. 부상 없이 득근하세요!',
  generator: 'Next.js',
  applicationName: 'Moveplaza',
  referrer: 'origin-when-cross-origin',
  keywords: ['운동기록', '재활', '물리치료', '부상방지', '선수관리', '오운완', '축구'],
  authors: [{ name: 'Moveplaza Dev' }],
  creator: 'Moveplaza Dev',
  publisher: 'Moveplaza Dev',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // 👇 PWA 매니페스트 파일 연결 (기존 설정 유지)
  manifest: '/manifest.webmanifest',
  
  // 👇 카톡/슬랙/디스코드 공유 미리보기 설정
  openGraph: {
    title: 'Moveplaza | 선수 퍼포먼스 관리 시스템',
    description: '부상 없이 득근하자! 📉 컨디션 분석부터 AI 부상 리포트까지.',
    url: 'moveplaza-final.vercel.app', // ⚠️ 실제 배포 주소로 꼭 수정하세요!
    siteName: 'Moveplaza',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Moveplaza | 선수 퍼포먼스 관리 시스템',
    description: '부상 없이 득근하자! 📉 컨디션 분석부터 AI 부상 리포트까지.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

// 👇 뷰포트 설정 (모바일 앱처럼 보이게 하기 + 상단바 색상)
export const viewport: Viewport = {
  // 앱 배경색과 맞춤 (더 자연스러움)
  themeColor: '#0f172a', 
  width: 'device-width',
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
      <body className={`${inter.className} overflow-x-hidden`}>
        {children}
      </body>
    </html>
  )
}