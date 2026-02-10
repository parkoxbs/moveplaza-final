import { ImageResponse } from 'next/og'

// 이미지 크기 설정 (권장 사이즈)
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

// 이미지 생성 함수
export default function Image() {
  return new ImageResponse(
    (
      // 👇 여기가 이미지가 그려지는 부분입니다 (HTML/CSS와 비슷)
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          // 배경색: 진한 파랑 -> 검정 그라데이션
          background: 'linear-gradient(to bottom right, #1e3a8a, #0f172a)',
          color: 'white',
          fontFamily: 'sans-serif',
          padding: '40px',
          textAlign: 'center',
        }}
      >
        {/* 로고 아이콘 (M) */}
        <div
          style={{
            width: '100px',
            height: '100px',
            backgroundColor: '#2563eb', // blue-600
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '60px',
            fontWeight: '900',
            marginBottom: '30px',
            boxShadow: '0 0 30px rgba(37,99,235,0.6)',
          }}
        >
          M
        </div>
        
        {/* 메인 타이틀 */}
        <div
          style={{
            fontSize: '70px',
            fontWeight: '900',
            marginBottom: '10px',
            letterSpacing: '-0.02em',
            textShadow: '0 4px 8px rgba(0,0,0,0.3)',
          }}
        >
          MOVEPLAZA
        </div>

        {/* 서브 타이틀 */}
        <div
          style={{
            fontSize: '32px',
            fontWeight: '700',
            opacity: '0.8',
          }}
        >
          Athlete Performance System
        </div>

        {/* 하단 문구 */}
        <div
          style={{
             marginTop: '60px',
             padding: '15px 30px',
             backgroundColor: 'rgba(255,255,255,0.1)',
             borderRadius: '50px',
             fontSize: '24px',
             fontWeight: 'bold'
          }}
        >
            물리치료학과 학생이 만든 선수 관리 앱 🏥
        </div>
      </div>
    ),
    // 옵션
    {
      ...size,
    }
  )
}