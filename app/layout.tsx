import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

// 👇 메타데이터 (SEO + PWA + 썸네일 설정) - 한글 '무브플라자' 검색 최적화 완료!
export const metadata: Metadata = {
  title: {
    template: '%s | 무브플라자 (Moveplaza)',
    default: '무브플라자 (Moveplaza) | 선수 퍼포먼스 관리 시스템',
  },
  description: '물리치료학과 학생이 만든 축구 전술 및 선수 부상 관리 앱 무브플라자(Moveplaza). 부상 없이 득근하세요!',
  generator: 'Next.js',
  applicationName: '무브플라자 (Moveplaza)',
  referrer: 'origin-when-cross-origin',
  keywords: ['무브플라자', 'MOVEPLAZA', '축구 전술판', '운동기록', '재활', '물리치료', '부상방지', '선수관리', '오운완', '축구'],
  authors: [{ name: 'Moveplaza Dev' }],
  creator: 'Moveplaza Dev',
  publisher: 'Moveplaza Dev',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // 👇 PWA 매니페스트 파일 연결
  manifest: '/manifest.webmanifest',
  
  // 👇 카톡/슬랙/디스코드 공유 미리보기 설정
  openGraph: {
    title: '무브플라자 (Moveplaza) | 선수 퍼포먼스 관리 시스템',
    description: '부상 없이 득근하자! 📉 축구 전술부터 AI 부상 리포트까지 무브플라자.',
    url: 'https://moveplaza-final.vercel.app', 
    siteName: '무브플라자 (Moveplaza)',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '무브플라자 (Moveplaza) | 선수 퍼포먼스 관리 시스템',
    description: '부상 없이 득근하자! 📉 축구 전술부터 AI 부상 리포트까지 무브플라자.',
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
  
  // 🔥👇 구글 & 네이버 서치어드바이저 인증 코드 통합 👇🔥
  verification: {
    google: 'ezk3LP2egWHd7QFyMc-y7sISEnLJcU5XGVGXZdmcoys',
    other: {
      'naver-site-verification': 'bad037c6762a0d5e1b0ec2d5c7df618eaf53b96f',
    },
  },
}

// 👇 뷰포트 설정 (모바일 앱처럼 보이게 하기 + 상단바 색상)
export const viewport: Viewport = {
  // 앱 배경색(slate-950)과 완벽하게 일치시킴
  themeColor: '#020617', 
  // 시스템 강제 다크모드 무시 마법!
  colorScheme: 'dark', 
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