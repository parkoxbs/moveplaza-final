"use client"
import React, { useState } from 'react'

interface BodyMapProps {
  selectedParts: string[];
  togglePart: (part: string) => void;
  type?: 'workout' | 'rehab' | 'match';
}

// 부위별 데이터 (해부학 이미지의 정확한 위치 좌표 적용)
const nodes = [
  // 중앙 부위
  { id: "목", label: "목 (Neck)", y: 70, view: 'both' },
  { id: "승모근", label: "승모근 (Trapezius)", y: 88, view: 'both' },
  { id: "가슴", label: "가슴 ( 대흉근 )", y: 135, view: 'front' },
  { id: "등", label: "등 ( 광배근 )", y: 135, view: 'back' },
  { id: "복근", label: "복근 ( 전복근 )", y: 205, view: 'front' },
  { id: "허리", label: "허리 ( 하배근 )", y: 205, view: 'back' },
  { id: "고관절", label: "고관절", y: 285, view: 'front' },
  { id: "엉덩이", label: "엉덩이 ( 대둔근 )", y: 285, view: 'back' },
  
  // 양쪽 부위 (bilateral: true)
  { id: "어깨", label: "어깨 ( 삼각근 )", y: 110, view: 'both', bilateral: true, rx: 65 },
  { id: "이두", label: "이두 ( 이두근 )", y: 165, view: 'front', bilateral: true, rx: 78 },
  { id: "삼두", label: "삼두 ( 삼두근 )", y: 165, view: 'back', bilateral: true, rx: 78 },
  { id: "전완근", label: "전완근 ( Forearm )", y: 235, view: 'both', bilateral: true, rx: 88 },
  { id: "손목", label: "손목", y: 280, view: 'both', bilateral: true, rx: 95 },
  { id: "손", label: "손", y: 310, view: 'both', bilateral: true, rx: 100 },
  { id: "허벅지(앞)", label: "앞벅지 ( 대퇴근 )", y: 345, view: 'front', bilateral: true, rx: 45 },
  { id: "허벅지(뒤)(햄스트링)", label: "햄스트링 ( 대퇴이두근 )", y: 345, view: 'back', bilateral: true, rx: 45 },
  { id: "무릎", label: "무릎", y: 415, view: 'front', bilateral: true, rx: 40 },
  { id: "종아리", label: "종아리", y: 455, view: 'both', bilateral: true, rx: 45 },
  { id: "발목", label: "발목", y: 490, view: 'both', bilateral: true, rx: 35 },
  { id: "발", label: "발", y: 510, view: 'both', bilateral: true, rx: 30 },
]

export default function BodyMap({ selectedParts, togglePart, type = 'workout' }: BodyMapProps) {
    const [view, setView] = useState<'front'|'back'>('front');

    // 상황에 맞는 포인트 색상 (재활은 빨강, 훈련은 에메랄드)
    const activeColor = type === 'rehab' ? '#ef4444' : '#10b981';
    const glowColor = type === 'rehab' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)';

    const visibleNodes = nodes.filter(n => n.view === 'both' || n.view === view);

    // 각 부위별 점(Dot) 렌더링 컴포넌트
    const MuscleNode = ({ node, x }: any) => {
        const isSelected = selectedParts.includes(node.id);
        const color = isSelected ? activeColor : '#64748b';
        // 라벨이 화면 밖으로 나가지 않도록 왼쪽 팔은 오른쪽에 라벨, 오른쪽 팔은 왼쪽에 라벨 표시
        const labelX = x < 120 ? x + 15 : x - 15;
        const anchor = x < 120 ? "start" : "end";

        return (
            <g className="cursor-pointer group" onClick={() => togglePart(node.id)}>
                {/* 🚨 마법의 히트박스: 터치 영역을 엄청 크게 만듦 */}
                <circle cx={x} cy={node.y} r="20" fill="transparent" />

                {/* 1. 선택 시 뒤에 퍼지는 네온 아우라 (Glow) */}
                <circle cx={x} cy={node.y} r="18" fill={glowColor} className={`transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />

                {/* 2. 실제 보여지는 점 */}
                <circle cx={x} cy={node.y} r={isSelected ? "8" : "5"} fill={isSelected ? activeColor : '#1e293b'} stroke={color} strokeWidth={isSelected ? 3 : 2} className="transition-all" />

                {/* 3. 부위 명칭 (HUD 패널 스타일) - 선택 시만 보임 */}
                <foreignObject x={x < 120 ? x + 10 : x - 90} y={node.y - 12} width="80" height="24" className={`pointer-events-none transition-opacity duration-300 origin-left ${isSelected ? 'opacity-100' : 'opacity-0 scale-90'}`}>
                    <div className="flex items-center h-full gap-1.5 px-2.5 py-1 rounded border backdrop-blur-sm bg-white/10 text-white border-white/20 shadow-xl">
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: activeColor }}></span>
                        <span className="text-[10px] font-black whitespace-nowrap select-none tracking-tight">
                            {node.label}
                        </span>
                    </div>
                </foreignObject>
            </g>
        )
    }

    return (
        <div className="w-full bg-slate-900/50 rounded-3xl p-6 border border-white/5 shadow-inner">
           
           {/* 앞면 / 뒷면 스위치 */}
           <div className="flex bg-slate-950 p-1 rounded-xl w-full mb-8 shadow-sm border border-white/5 relative z-10">
              <button type="button" onClick={() => setView('front')} className={`flex-1 py-3 rounded-lg text-xs font-black transition-all ${view === 'front' ? 'bg-slate-800 text-emerald-400 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>앞면 (FRONT)</button>
              <button type="button" onClick={() => setView('back')} className={`flex-1 py-3 rounded-lg text-xs font-black transition-all ${view === 'back' ? 'bg-slate-800 text-emerald-400 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>뒷면 (BACK)</button>
           </div>

           {/* 🦾 SF 스캐너 느낌의 인체 그래픽 영역 */}
           <div className="relative w-full max-w-[280px] mx-auto overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-inner">
               <svg viewBox="0 0 240 540" className="w-full h-auto drop-shadow-2xl">
                  
                  {/* 중앙 격자무늬 배경 패턴 */}
                  <defs>
                     <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" opacity="0.3"/>
                     </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* 🌟 진짜 듬직한 몸짱 형상의 인체 실루엣 Path (앞면/뒷면 공용 베이스) */}
                  <g transform="translate(0, 10) scale(2.4)">
                     <path d="M50 10 C55 10 60 15 60 22 C60 30 55 35 50 35 C45 35 40 30 40 22 C40 15 45 10 50 10 Z M50 35 C60 35 70 40 80 45 C85 47 88 50 90 60 L95 100 C96 105 92 110 88 110 C84 110 80 105 78 100 L75 70 L70 70 L70 120 L80 190 C81 195 78 200 74 200 C70 200 65 195 65 190 L55 130 L45 130 L35 190 C35 195 30 200 26 200 C22 200 19 195 20 190 L30 120 L30 70 L25 70 L22 100 C20 105 16 110 12 110 C8 110 4 105 5 100 L10 60 C12 50 15 47 20 45 C30 40 40 35 50 35 Z" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                  </g>
                  
                  {/* 중앙 가이드 라인 (사이버틱) */}
                  <line x1="120" y1="20" x2="120" y2="520" stroke="#334155" strokeWidth="1" strokeDasharray="5 5" opacity="0.5"/>

                  {/* 그 위에 깔끔하게 점만 렌더링! */}
                  {visibleNodes.map(node => {
                      if (!node.bilateral) {
                          // 중앙 부위 (목, 가슴 등)
                          return <MuscleNode key={node.id} node={node} x={120} />
                      }
                      // 양쪽 부위 (팔, 다리) -> 데칼코마니 렌더링
                      return (
                          <React.Fragment key={node.id}>
                             {/* 왼쪽 */}
                             <MuscleNode node={node} x={120 - (node.rx || 0)} />
                             {/* 오른쪽 */}
                             <MuscleNode node={node} x={120 + (node.rx || 0)} />
                          </React.Fragment>
                      )
                  })}
               </svg>
           </div>

           {/* 하단 선택된 부위 표시 (칩) */}
           <div className="mt-8 pt-6 border-t border-white/5 min-h-16 flex flex-wrap gap-2 justify-center">
               {selectedParts.length > 0 ? (
                   selectedParts.map(part => (
                       <span key={part} onClick={() => togglePart(part)} className="px-3 py-1.5 cursor-pointer text-xs font-black rounded-xl flex items-center gap-1.5 border transition-all hover:scale-105 active:scale-95 bg-emerald-500 text-white border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                           <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                           {part} 
                           <span className="opacity-70 ml-1 text-[10px]">✕</span>
                       </span>
                   ))
               ) : (
                   <p className="text-center text-xs font-bold text-slate-500 mt-2 animate-pulse">
                       👆 인체의 점을 터치해서 부위를 선택하세요
                   </p>
               )}
           </div>
        </div>
    )
}