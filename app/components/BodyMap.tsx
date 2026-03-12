"use client"
import React, { useState } from 'react'

interface BodyMapProps {
  selectedParts: string[];
  togglePart: (part: string) => void;
  type?: 'workout' | 'rehab' | 'match';
}

// 부위별 정확한 인체 좌표 및 라벨 위치 세팅
const nodes = [
  { id: "목", label: "목", x: 100, y: 50, view: 'both', ox: 22 },
  { id: "승모근", label: "승모근", x: 100, y: 72, view: 'both', ox: 25 },
  { id: "어깨", label: "어깨", x: 60, y: 75, view: 'both', bilateral: true, ox: 15 },
  { id: "가슴", label: "가슴", x: 100, y: 110, view: 'front', ox: 30 },
  { id: "등", label: "등", x: 100, y: 110, view: 'back', ox: 30 },
  { id: "복근", label: "복근", x: 100, y: 150, view: 'front', ox: 30 },
  { id: "허리", label: "허리", x: 100, y: 150, view: 'back', ox: 30 },
  { id: "고관절", label: "고관절", x: 100, y: 190, view: 'front', ox: 30 },
  { id: "엉덩이", label: "엉덩이", x: 100, y: 190, view: 'back', ox: 30 },
  { id: "이두", label: "이두", x: 45, y: 105, view: 'front', bilateral: true, ox: 15 },
  { id: "삼두", label: "삼두", x: 45, y: 105, view: 'back', bilateral: true, ox: 15 },
  { id: "전완근", label: "전완근", x: 32, y: 150, view: 'both', bilateral: true, ox: 15 },
  { id: "손목", label: "손목", x: 25, y: 180, view: 'both', bilateral: true, ox: 15 },
  { id: "손", label: "손", x: 20, y: 200, view: 'both', bilateral: true, ox: 15 },
  { id: "허벅지(앞)", label: "앞벅지", x: 77, y: 230, view: 'front', bilateral: true, ox: 18 },
  { id: "허벅지(뒤)(햄스트링)", label: "햄스트링", x: 77, y: 230, view: 'back', bilateral: true, ox: 18 },
  { id: "무릎", label: "무릎", x: 70, y: 280, view: 'front', bilateral: true, ox: 16 },
  { id: "종아리", label: "종아리", x: 70, y: 325, view: 'both', bilateral: true, ox: 16 },
  { id: "발목", label: "발목", x: 70, y: 370, view: 'both', bilateral: true, ox: 16 },
  { id: "발", label: "발", x: 70, y: 390, view: 'both', bilateral: true, ox: 16 },
]

export default function BodyMap({ selectedParts, togglePart, type = 'workout' }: BodyMapProps) {
    const [view, setView] = useState<'front'|'back'>('front');

    // 훈련은 네온 에메랄드, 재활은 네온 레드 컬러 적용
    const activeColor = type === 'rehab' ? '#ef4444' : '#10b981';
    const glowColor = type === 'rehab' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)';

    const visibleNodes = nodes.filter(n => n.view === 'both' || n.view === view);

    // 각 부위별 점(Dot) 렌더링 컴포넌트
    const Dot = ({ node, x, labelX, anchor }: any) => {
        const isSelected = selectedParts.includes(node.id);
        const color = isSelected ? activeColor : '#64748b';

        return (
            <g className="transition-all duration-300">
                {/* 1. 배경 빛 번짐 효과 (선택 시만 보임) */}
                {isSelected && <circle cx={x} cy={node.y} r="12" fill={glowColor} className="animate-pulse pointer-events-none" />}

                {/* 2. 실제 보여지는 점 */}
                <circle cx={x} cy={node.y} r={isSelected ? "6" : "4"} fill={color} stroke="#0f172a" strokeWidth="2" className="pointer-events-none transition-all" />

                {/* 3. 부위 명칭 (선택 시 하얗게 빛남) */}
                <text x={labelX} y={node.y + 3} fontSize="8" fill={isSelected ? '#ffffff' : '#94a3b8'} fontWeight={isSelected ? 'bold' : 'normal'} textAnchor={anchor} className="pointer-events-none drop-shadow-md select-none transition-colors">
                    {node.label}
                </text>

                {/* 4. 🚨 마법의 히트박스: 화면엔 안 보이지만 터치 영역을 엄청 크게 만듦 */}
                <circle cx={x} cy={node.y} r="20" fill="transparent" onClick={() => togglePart(node.id)} className="cursor-pointer" />
            </g>
        )
    }

    return (
        <div className="w-full bg-slate-900/80 rounded-3xl p-4 border-2 border-slate-800 shadow-inner">
           
           {/* 앞면 / 뒷면 토글 버튼 */}
           <div className="flex bg-slate-950 p-1.5 rounded-xl w-48 mx-auto mb-6 shadow-sm border border-white/5">
              <button type="button" onClick={() => setView('front')} className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${view === 'front' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>앞면 (FRONT)</button>
              <button type="button" onClick={() => setView('back')} className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${view === 'back' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>뒷면 (BACK)</button>
           </div>

           {/* 바디맵 SVG 영역 */}
           <div className="relative w-full max-w-[280px] mx-auto">
               <svg viewBox="0 0 200 420" className="w-full h-auto drop-shadow-2xl">
                  
                  {/* 근육 실루엣 베이스 (두꺼운 선을 이용해 인체를 형상화) */}
                  <g className="stroke-slate-800" strokeLinecap="round" strokeLinejoin="round">
                     {/* 몸통 */}
                     <line x1="100" y1="60" x2="100" y2="180" strokeWidth="44"/>
                     {/* 어깨 */}
                     <line x1="60" y1="75" x2="140" y2="75" strokeWidth="34"/>
                     {/* 위팔 */}
                     <line x1="55" y1="75" x2="40" y2="120" strokeWidth="22"/>
                     <line x1="145" y1="75" x2="160" y2="120" strokeWidth="22"/>
                     {/* 아래팔 */}
                     <line x1="40" y1="120" x2="25" y2="180" strokeWidth="16"/>
                     <line x1="160" y1="120" x2="175" y2="180" strokeWidth="16"/>
                     {/* 허벅지 */}
                     <line x1="85" y1="180" x2="70" y2="280" strokeWidth="28"/>
                     <line x1="115" y1="180" x2="130" y2="280" strokeWidth="28"/>
                     {/* 종아리 */}
                     <line x1="70" y1="280" x2="70" y2="370" strokeWidth="20"/>
                     <line x1="130" y1="280" x2="130" y2="370" strokeWidth="20"/>
                  </g>
                  {/* 머리 */}
                  <circle cx="100" cy="25" r="24" className="fill-slate-800" />

                  {/* 투명한 연결선 (사이버틱한 느낌) */}
                  <line x1="100" y1="60" x2="100" y2="180" stroke="#475569" strokeWidth="1" strokeDasharray="4 4" opacity="0.3"/>
                  <line x1="85" y1="180" x2="70" y2="370" stroke="#475569" strokeWidth="1" strokeDasharray="4 4" opacity="0.3"/>
                  <line x1="115" y1="180" x2="130" y2="370" stroke="#475569" strokeWidth="1" strokeDasharray="4 4" opacity="0.3"/>

                  {/* 상호작용 점들 (노드) */}
                  {visibleNodes.map(node => {
                      if (!node.bilateral) {
                          // 중앙에 하나만 있는 부위 (목, 가슴, 배 등)
                          return <Dot key={node.id} node={node} x={node.x} labelX={node.x + node.ox} anchor="start" />
                      }
                      // 양쪽에 있는 부위 (팔, 다리 등) -> 데칼코마니처럼 양쪽 렌더링!
                      return (
                          <React.Fragment key={node.id}>
                             {/* 왼쪽 */}
                             <Dot node={node} x={node.x} labelX={node.x - node.ox} anchor="end" />
                             {/* 오른쪽 */}
                             <Dot node={node} x={200 - node.x} labelX={(200 - node.x) + node.ox} anchor="start" />
                          </React.Fragment>
                      )
                  })}
               </svg>
           </div>

           {/* 하단에 선택된 부위 칩으로 표시 */}
           {selectedParts.length > 0 ? (
               <div className="flex flex-wrap gap-2 mt-6 justify-center">
                   {selectedParts.map(part => (
                       <span key={part} onClick={() => togglePart(part)} className={`px-3 py-1 cursor-pointer text-xs font-black rounded-xl flex items-center gap-1 border transition-all hover:scale-105 active:scale-95 ${type === 'rehab' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                           {part} <span className="opacity-50 ml-1 text-[10px]">✕</span>
                       </span>
                   ))}
               </div>
           ) : (
               <p className="text-center text-xs font-bold text-slate-500 mt-6 animate-pulse">
                   👆 점을 터치해서 부위를 선택하세요
               </p>
           )}
        </div>
    )
}