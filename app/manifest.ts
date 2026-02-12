import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Moveplaza - 선수들을 위한 기록 앱',
    short_name: 'Moveplaza',
    description: '부상 없이 득근하자! 운동 기록 & 통증 관리 시스템',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1e3a8a',
    icons: [
      {
        // 👇 여기를 바꿨습니다! (app-icon -> final-icon)
        src: '/final-icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        // 👇 여기도요!
        src: '/final-icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}