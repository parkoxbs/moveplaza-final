"use client"

import React, { useState } from 'react'

interface BodyMapProps {
  selectedParts: string[]
  togglePart: (part: string) => void
  type: 'workout' | 'rehab'
}

export default function BodyMap({ selectedParts, togglePart, type }: BodyMapProps) {
  // 앞면(front) / 뒷면(back) 상태 관리
  const [view, setView] = useState<'front' | 'back'>('front')

  const activeColor = type === 'workout' ? '#3b82f6' : '#ef4444' 
  const activeFill = type === 'workout' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(239, 68, 68, 0.5)'
  const defaultFill = '#1e293b'
  const strokeColor = '#475569'

  // 공통 경로 (머리, 목 등)
  const commonPaths = {
    head: "M150 20 Q130 20 130 45 Q130 65 150 65 Q170 65 170 45 Q170 20 150 20 Z",
    neck: "M145 65 Q145 80 140 85 L135 90 L165 90 L160 85 Q155 80 155 65 Z",
    traps: "M135 90 L110 100 L120 110 L140 105 Z M165 90 L190 100 L180 110 L160 105 Z",
    shoulders: "M110 100 Q100 105 95 120 L115 125 L125 110 Z M190 100 Q200 105 205 120 L185 125 L175 110 Z",
    armUpper: "M95 120 L90 160 L110 165 L115 125 Z M205 120 L210 160 L190 165 L185 125 Z",
    armLower: "M90 160 L85 200 L105 205 L110 165 Z M210 160 L215 200 L195 205 L190 165 Z",
    hand: "M85 200 L82 210 L75 230 L95 235 L102 215 L105 205 Z M215 200 L218 210 L225 230 L205 235 L198 215 L195 205 Z",
    torsoUpper: "M125 110 L115 125 L120 150 L180 150 L185 125 L175 110 Z", // 가슴 or 등 상부
    torsoLower: "M120 150 L125 190 L135 200 L165 200 L175 190 L180 150 Z", // 복근 or 허리
    hips: "M120 190 L110 240 L190 240 L180 190 Z", // 골반 or 엉덩이
    thigh: "M110 240 L105 320 L140 320 L145 240 Z M190 240 L195 320 L160 320 L155 240 Z",
    legLower: "M105 320 L108 410 L132 410 L140 320 Z M195 320 L192 410 L168 410 L160 320 Z",
    foot: "M108 410 L105 430 L135 430 L132 410 Z M192 410 L195 430 L165 430 L168 410 Z"
  }

  // 뷰에 따라 매핑할 부위 정의
  const getParts = () => {
    const common = [
      { id: '머리', path: commonPaths.head, isDeco: true },
      { id: '목', path: commonPaths.neck },
      { id: '승모근', path: commonPaths.traps },
      { id: '어깨', path: commonPaths.shoulders },
      { id: '전완근', path: commonPaths.armLower },
      { id: '손목', path: commonPaths.hand }, // 손/손목 통합 영역 클릭
      { id: '손', path: commonPaths.hand }, 
      { id: '발목', path: commonPaths.foot },
      { id: '발', path: commonPaths.foot }
    ]

    if (view === 'front') {
      return [
        ...common,
        { id: '이두', path: commonPaths.armUpper }, // 앞면 팔 = 이두
        { id: '가슴', path: commonPaths.torsoUpper },
        { id: '복근', path: commonPaths.torsoLower },
        { id: '고관절', path: commonPaths.hips },
        { id: '허벅지(앞)', path: commonPaths.thigh },
        { id: '무릎', path: commonPaths.legLower } // 무릎~정강이 영역
      ]
    } else {
      return [
        ...common,
        { id: '삼두', path: commonPaths.armUpper }, // 뒷면 팔 = 삼두
        { id: '등', path: commonPaths.torsoUpper },
        { id: '허리', path: commonPaths.torsoLower },
        { id: '엉덩이', path: commonPaths.hips },
        { id: '허벅지(뒤)', path: commonPaths.thigh },
        { id: '종아리', path: commonPaths.legLower }
      ]
    }
  }

  return (
    <div className="relative w-full h-[450px] flex items-center justify-center bg-slate-900/50 rounded-3xl border border-white/5 shadow-inner overflow-hidden group">
      
      {/* 🔄 회전 버튼 */}
      <button 
        onClick={() => setView(view === 'front' ? 'back' : 'front')}
        className="absolute top-4 right-4 z-10 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-2 rounded-full border border-white/10 shadow-lg flex items-center gap-2 transition-all active:scale-95"
      >
        <span className="text-lg">🔄</span> {view === 'front' ? '뒷면 보기' : '앞면 보기'}
      </button>

      {/* 안내 문구 */}
      <div className="absolute top-4 left-4 text-xs font-bold text-slate-500">
        {view === 'front' ? 'FRONT VIEW' : 'BACK VIEW'}
      </div>

      <svg viewBox="0 0 300 500" className="h-full w-auto drop-shadow-2xl transition-all duration-500">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {getParts().map((part: any, index) => {
          const isSelected = selectedParts.includes(part.id)
          // 손/발/손목/발목 등 중복 경로 클릭 처리를 위해 ID가 달라도 경로가 같으면 같이 하이라이트
          
          return (
            <path
              key={`${part.id}-${view}-${index}`} // 뷰 바뀔 때 리렌더링
              d={part.path}
              fill={isSelected ? activeFill : defaultFill}
              stroke={isSelected ? activeColor : strokeColor}
              strokeWidth={isSelected ? 2 : 1}
              filter={isSelected ? "url(#glow)" : ""}
              onClick={() => !part.isDeco && togglePart(part.id)}
              className={!part.isDeco ? "cursor-pointer transition-all duration-300 hover:opacity-80" : ""}
              style={{ 
                fill: isSelected ? activeFill : defaultFill,
                transition: 'all 0.3s ease'
              }}
            />
          )
        })}
      </svg>

      {/* 하단 팁 */}
      <div className="absolute bottom-4 text-center w-full text-[10px] text-slate-600 font-bold animate-pulse">
        부위를 터치하여 선택하세요
      </div>
    </div>
  )
}