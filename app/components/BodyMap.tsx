"use client"
import React, { useState } from 'react'

interface BodyMapProps {
  selectedParts: string[];
  togglePart: (part: string) => void;
  type?: 'workout' | 'rehab' | 'match';
}

// 부위별 데이터 (실제 인체 실루엣 좌표에 완벽하게 맞춤)
const nodes = [
  // 중앙 부위
  { id: "목", label: "목", y: 90, view: 'both' },
  { id: "승모근", label: "승모근", y: 110, view: 'both' },
  { id: "가슴", label: "가슴", y: 145, view: 'front' },
  { id: "등", label: "등", y: 145, view: 'back' },
  { id: "복근", label: "복근", y: 215, view: 'front' },
  { id: "허리", label: "허리", y: 215, view: 'back' },
  { id: "고관절", label: "고관절", y: 290, view: 'front' },
  { id: "엉덩이", label: "엉덩이", y: 290, view: 'back' },
  
  // 양쪽 부위 (bilateral: true)
  { id: "어깨", label: "어깨", y: 118, view: 'both', bilateral: true, rx: 60 },
  { id: "이두", label: "이두", y: 178, view: 'front', bilateral: true, rx: 80 },
  { id: "삼두", label: "삼두", y: 178, view: 'back', bilateral: true, rx: 80 },
  { id: "전완근", label: "전완근", y: 214, view: 'both', bilateral: true, rx: 90 },
  { id: "손목", label: "손목", y: 240, view: 'both', bilateral: true, rx: 95 },
  { id: "손", label: "손", y: 262, view: 'both', bilateral: true, rx: 95 },
  { id: "허벅지(앞)", label: "앞벅지", y: 350, view: 'front', bilateral: true, rx: 45 },
  { id: "허벅지(뒤)(햄스트링)", label: "햄스트링", y: 350, view: 'back', bilateral: true, rx: 45 },
  { id: "무릎", label: "무릎", y: 410, view: 'front', bilateral: true, rx: 50 },
  { id: "종아리", label: "종아리", y: 445, view: 'both', bilateral: true, rx: 55 },
  { id: "발목", label: "발목", y: 475, view: 'both', bilateral: true, rx: 50 },
  { id: "발", label: "발", y: 490, view: 'both', bilateral: true, rx: 45 },
]

export default function BodyMap({ selectedParts, togglePart, type = 'workout' }: BodyMapProps) {
    const [view, setView] = useState<'front'|'back'>('front');

    // 훈련/재활 등 상황에 맞는 메인 색상 세팅
    const activeBgClass = type === 'rehab' ? 'bg-red-500' : type === 'match' ? 'bg-yellow-500' : 'bg-blue-600';
    const activeBorderClass = type === 'rehab' ? 'border-red-400' : type === 'match' ? 'border-yellow-400' : 'border-blue-400';
    const activeRingClass = type === 'rehab' ? 'ring-red-400' : type === 'match' ? 'ring-yellow-400' : 'ring-blue-400';

    const visibleNodes = nodes.filter(n => n.view === 'both' || n.view === view);

    // 상호작용 가능한 점 & 라벨 컴포넌트 (SVG 밖에서 HTML로 렌더링되어 글씨가 절대 잘리지 않음!)
    const MuscleNode = ({ node, x }: any) => {
        const isSelected = selectedParts.includes(node.id);
        const leftPercent = (x / 240) * 100;
        const topPercent = (node.y / 500) * 100;

        // 글씨가 화면 밖으로 나가지 않게 몸통 안쪽으로 스마트하게 정렬
        const alignClass = x < 120 ? "left-full ml-2" : x > 120 ? "right-full mr-2" : "left-full ml-3";

        return (
            <div className="absolute z-20" style={{ left: `${leftPercent}%`, top: `${topPercent}%`, transform: 'translate(-50%, -50%)' }}>
                
                {/* 🚨 왕건이 터치 영역 (이게 핵심입니다. 뚱땅 눌러도 무조건 인식됨) */}
                <button 
                  type="button"
                  onClick={() => togglePart(node.id)}
                  className="absolute w-12 h-12 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer rounded-full bg-transparent"
                />
                
                {/* 깜빡이는 점 */}
                <div className={`relative w-4 h-4 rounded-full ring-2 transition-all duration-300 flex items-center justify-center ${isSelected ? `${activeBgClass} ${activeRingClass} scale-110 shadow-lg` : 'bg-slate-800 ring-slate-600'}`}>
                    {isSelected && <div className="absolute inset-0 rounded-full animate-ping opacity-60 bg-inherit"></div>}
                </div>

                {/* 절대 안 잘리는 이름표 */}
                <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none transition-all ${alignClass}`}>
                    <div className={`px-2 py-1 rounded-lg text-[11px] font-black whitespace-nowrap transition-all border ${isSelected ? `${activeBgClass} ${activeBorderClass} text-white shadow-lg` : 'bg-slate-900/90 border-slate-700 text-slate-400'}`}>
                        {node.label}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full bg-slate-900/50 rounded-3xl p-6 border border-white/5 shadow-inner">
           
           {/* 앞면 / 뒷면 스위치 */}
           <div className="flex bg-slate-950 p-1 rounded-xl w-full mb-8 shadow-sm border border-white/5 relative z-10">
              <button type="button" onClick={() => setView('front')} className={`flex-1 py-3 rounded-lg text-xs font-black transition-all ${view === 'front' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>앞면 (FRONT)</button>
              <button type="button" onClick={() => setView('back')} className={`flex-1 py-3 rounded-lg text-xs font-black transition-all ${view === 'back' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>뒷면 (BACK)</button>
           </div>

           {/* 바디맵 이미지 영역 */}
           <div className="relative w-full max-w-[280px] mx-auto overflow-hidden rounded-xl">
               
               {/* 👇 완벽한 사람 실루엣과 스캐너 격자무늬를 그려주는 마법의 SVG 배경 */}
               <svg viewBox="0 0 240 500" className="w-full h-auto drop-shadow-2xl opacity-60">
                   <defs>
                       <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                           <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" opacity="0.3"/>
                       </pattern>
                   </defs>
                   <rect width="100%" height="100%" fill="url(#grid)" />
                   
                   {/* 사실적인 해부학 인체 실루엣 Path */}
                   <g transform="translate(0, 10) scale(2.4)">
                      <path d="M50 10 C55 10 60 15 60 22 C60 30 55 35 50 35 C45 35 40 30 40 22 C40 15 45 10 50 10 Z M50 35 C60 35 70 40 80 45 C85 47 88 50 90 60 L95 100 C96 105 92 110 88 110 C84 110 80 105 78 100 L75 70 L70 70 L70 120 L80 190 C81 195 78 200 74 200 C70 200 65 195 65 190 L55 130 L45 130 L35 190 C35 195 30 200 26 200 C22 200 19 195 20 190 L30 120 L30 70 L25 70 L22 100 C20 105 16 110 12 110 C8 110 4 105 5 100 L10 60 C12 50 15 47 20 45 C30 40 40 35 50 35 Z" fill="#1e293b" stroke="#475569" strokeWidth="1" />
                   </g>
               </svg>

               {/* HTML 노드들을 그림 위에 절대 위치로 뿌려줌 */}
               {visibleNodes.map(node => {
                   if (!node.bilateral) {
                       return <MuscleNode key={node.id} node={node} x={120} />
                   }
                   return (
                       <React.Fragment key={node.id}>
                          <MuscleNode node={node} x={120 - (node.rx || 0)} />
                          <MuscleNode node={node} x={120 + (node.rx || 0)} />
                       </React.Fragment>
                   )
               })}
           </div>

           {/* 하단 선택된 부위 표시 (칩) */}
           <div className="mt-8 pt-6 border-t border-white/5 min-h-16 flex flex-wrap gap-2 justify-center">
               {selectedParts.length > 0 ? (
                   selectedParts.map(part => (
                       <span key={part} onClick={() => togglePart(part)} className={`px-3 py-1.5 cursor-pointer text-xs font-black rounded-xl flex items-center gap-1.5 border transition-all hover:scale-105 active:scale-95 ${activeBgClass} text-white ${activeBorderClass} shadow-md`}>
                           <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                           {part} 
                           <span className="opacity-70 ml-1 text-[10px]">✕</span>
                       </span>
                   ))
               ) : (
                   <p className="text-center text-xs font-bold text-slate-500 mt-2 animate-pulse">
                       👆 사람 실루엣의 점을 터치해서 부위를 선택하세요
                   </p>
               )}
           </div>
        </div>
    )
}