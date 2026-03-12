"use client"
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion' // 🚨 여기서 AnimatePresence를 빼먹었었습니다!

interface BodyMapProps {
  selectedParts: string[];
  togglePart: (part: string) => void;
  type?: 'workout' | 'rehab' | 'match';
}

// 부위별 데이터 (실제 인체 비율 기반 좌표 조정)
const nodes = [
  // 중앙 부위
  { id: "목", label: "목", y: 35, view: 'both' },
  { id: "승모근", label: "승모근", y: 65, view: 'both' },
  { id: "가슴", label: "가슴", y: 110, view: 'front' },
  { id: "등", label: "등", y: 110, view: 'back' },
  { id: "복근", label: "복근", y: 160, view: 'front' },
  { id: "허리", label: "허리", y: 160, view: 'back' },
  { id: "고관절", label: "고관절", y: 210, view: 'front' },
  { id: "엉덩이", label: "엉덩이", y: 210, view: 'back' },
  
  // 양쪽 부위 (bilateral: true)
  { id: "어깨", label: "어깨", y: 80, view: 'both', bilateral: true, rx: 65 },
  { id: "이두", label: "이두", y: 125, view: 'front', bilateral: true, rx: 60 },
  { id: "삼두", label: "삼두", y: 125, view: 'back', bilateral: true, rx: 60 },
  { id: "전완근", label: "전완근", y: 180, view: 'both', bilateral: true, rx: 55 },
  { id: "손목", label: "손목", y: 230, view: 'both', bilateral: true, rx: 50 },
  { id: "손", label: "손", y: 260, view: 'both', bilateral: true, rx: 45 },
  { id: "허벅지(앞)", label: "앞벅지", y: 270, view: 'front', bilateral: true, rx: 75 },
  { id: "허벅지(뒤)(햄스트링)", label: "햄스트링", y: 270, view: 'back', bilateral: true, rx: 75 },
  { id: "무릎", label: "무릎", y: 330, view: 'front', bilateral: true, rx: 70 },
  { id: "종아리", label: "종아리", y: 380, view: 'both', bilateral: true, rx: 68 },
  { id: "발목", label: "발목", y: 440, view: 'both', bilateral: true, rx: 65 },
  { id: "발", label: "발", y: 470, view: 'both', bilateral: true, rx: 60 },
]

export default function BodyMap({ selectedParts, togglePart, type = 'workout' }: BodyMapProps) {
    const [view, setView] = useState<'front'|'back'>('front');

    // 포인트 컬러 (에메랄드)
    const activeColor = type === 'rehab' ? '#ef4444' : '#10b981';
    const glowColor = type === 'rehab' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)';

    const visibleNodes = nodes.filter(n => n.view === 'both' || n.view === view);

    // 상호작용 가능한 버튼 컴포넌트
    const MuscleNode = ({ node, x }: any) => {
        const isSelected = selectedParts.includes(node.id);
        const color = isSelected ? activeColor : '#94a3b8';

        return (
            <g className="cursor-pointer group" onClick={() => togglePart(node.id)}>
                {/* 🚨 마법의 히트박스: 터치 영역을 엄청 크게 잡아서 삑사리 방지 */}
                <circle cx={x} cy={node.y} r="25" fill="transparent" />

                {/* 1. 선택 시 뒤에 퍼지는 네온 아우라 (Glow) */}
                <AnimatePresence>
                    {isSelected && (
                        <motion.circle initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} cx={x} cy={node.y} r="18" fill={glowColor} className="animate-pulse-slow" />
                    )}
                </AnimatePresence>

                {/* 2. HUD 스타일의 타겟 원 (점) */}
                <circle cx={x} cy={node.y} r={isSelected ? "8" : "5"} fill={isSelected ? activeColor : '#1e293b'} stroke={color} strokeWidth={isSelected ? 3 : 2} className="transition-all duration-300" />
                
                {/* 3. 부위 이름표 (HUD 패널 스타일) */}
                <foreignObject x={x + 15} y={node.y - 12} width="80" height="24" className="pointer-events-none group-hover:scale-105 transition-transform origin-left">
                    <div className={`flex items-center h-full gap-1.5 px-2 py-1 rounded border backdrop-blur-sm transition-all duration-300 ${isSelected ? 'bg-white text-slate-950 border-white' : 'bg-slate-950/70 text-slate-300 border-slate-700 group-hover:border-slate-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'animate-pulse' : ''}`} style={{ backgroundColor: color }}></span>
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
           
           {/* 앞면 / 뒷면 스위치 (세련된 디자인) */}
           <div className="flex bg-slate-950 p-1 rounded-xl w-full mb-8 shadow-sm border border-white/5 relative z-10">
              <button type="button" onClick={() => setView('front')} className={`flex-1 py-3 rounded-lg text-xs font-black transition-all ${view === 'front' ? 'bg-slate-800 text-emerald-400 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>앞면 (FRONT)</button>
              <button type="button" onClick={() => setView('back')} className={`flex-1 py-3 rounded-lg text-xs font-black transition-all ${view === 'back' ? 'bg-slate-800 text-emerald-400 shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>뒷면 (BACK)</button>
           </div>

           {/* 바디맵 영역 */}
           <div className="relative w-full max-w-[320px] mx-auto overflow-hidden">
               <svg viewBox="0 0 240 500" className="w-full h-auto drop-shadow-2xl">
                  {/* 중앙 축선 (가이드) */}
                  <line x1="120" y1="20" x2="120" y2="480" stroke="#334155" strokeWidth="1" strokeDasharray="5 5" opacity="0.5"/>

                  {/* 노드들 (상호작용 점 + 이름표) */}
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