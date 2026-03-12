"use client"
import React, { useState } from 'react'

interface BodyMapProps {
  selectedParts: string[];
  togglePart: (part: string) => void;
  type?: 'workout' | 'rehab' | 'match';
}

// 부위별 데이터 (id와 화면에 보일 라벨 예쁘게 병기)
const nodes = [
  { id: "목", label: "목 (Neck)", y: 65, view: 'both' },
  { id: "승모근", label: "승모근 (Trapezius)", y: 85, view: 'both' },
  { id: "어깨", label: "어깨 (Deltoid)", y: 105, view: 'both', bilateral: true, rx: 65 },
  { id: "가슴", label: "가슴 (Pectoral)", y: 125, view: 'front' },
  { id: "등", label: "등 (Lats)", y: 125, view: 'back' },
  { id: "이두", label: "이두 (Biceps)", y: 155, view: 'front', bilateral: true, rx: 75 },
  { id: "삼두", label: "삼두 (Triceps)", y: 155, view: 'back', bilateral: true, rx: 75 },
  { id: "복근", label: "복근 (Abs)", y: 195, view: 'front' },
  { id: "허리", label: "허리 (Lower Back)", y: 195, view: 'back' },
  { id: "전완근", label: "전완근 (Forearm)", y: 225, view: 'both', bilateral: true, rx: 85 },
  { id: "고관절", label: "고관절 (Hip)", y: 275, view: 'front' },
  { id: "엉덩이", label: "엉덩이 (Glutes)", y: 275, view: 'back' },
  { id: "손목", label: "손목 (Wrist)", y: 275, view: 'both', bilateral: true, rx: 90 },
  { id: "손", label: "손 (Hand)", y: 310, view: 'both', bilateral: true, rx: 95 },
  { id: "허벅지(앞)", label: "앞벅지 (Quads)", y: 335, view: 'front', bilateral: true, rx: 35 },
  { id: "허벅지(뒤)(햄스트링)", label: "햄스트링 (Hamstring)", y: 335, view: 'back', bilateral: true, rx: 35 },
  { id: "무릎", label: "무릎 (Knee)", y: 405, view: 'front', bilateral: true, rx: 30 },
  { id: "종아리", label: "종아리 (Calf)", y: 445, view: 'both', bilateral: true, rx: 35 },
  { id: "발목", label: "발목 (Ankle)", y: 480, view: 'both', bilateral: true, rx: 30 },
  { id: "발", label: "발 (Foot)", y: 495, view: 'both', bilateral: true, rx: 25 },
]

export default function BodyMap({ selectedParts, togglePart, type = 'workout' }: BodyMapProps) {
    const [view, setView] = useState<'front'|'back'>('front');

    // 상황에 맞는 포인트 색상 (재활은 빨강, 훈련은 파랑, 경기는 노랑)
    const activeColor = type === 'rehab' ? '#ef4444' : type === 'match' ? '#facc15' : '#3b82f6';
    const activeRippleColor = type === 'rehab' ? 'rgba(239, 68, 68, 0.4)' : type === 'match' ? 'rgba(250, 204, 21, 0.4)' : 'rgba(59, 130, 246, 0.4)';

    const visibleNodes = nodes.filter(n => n.view === 'both' || n.view === view);

    // ID로 Label 이름 찾아오는 함수 (하단 표시용)
    const getLabel = (id: string) => {
        return nodes.find(n => n.id === id)?.label || id;
    }

    // 마법의 인터랙티브 점 컴포넌트 (글씨 없이 깔끔하게 점만 렌더링!)
    const MuscleDot = ({ node, x }: any) => {
        const isSelected = selectedParts.includes(node.id);
        const color = isSelected ? activeColor : '#475569';

        return (
            <g className="cursor-pointer group" onClick={() => togglePart(node.id)}>
                {/* 🚨 보이지 않는 대형 터치 영역 (손가락 삑사리 완벽 방지) */}
                <circle cx={x} cy={node.y} r="25" fill="transparent" />
                
                {/* 선택 시 배경에 퍼지는 네온 파동 */}
                {isSelected && (
                    <circle cx={x} cy={node.y} r="15" fill={activeRippleColor} className="animate-pulse" />
                )}
                
                {/* 실제 보여지는 세련된 점 */}
                <circle 
                    cx={x} 
                    cy={node.y} 
                    r={isSelected ? "7" : "5"} 
                    fill={color} 
                    stroke={isSelected ? "#ffffff" : "#1e293b"} 
                    strokeWidth="2.5" 
                    className="transition-all duration-300"
                />
            </g>
        )
    }

    return (
        <div className="w-full bg-slate-900/50 rounded-3xl p-6 border border-white/5 shadow-inner">
           
           {/* 앞면 / 뒷면 스위치 */}
           <div className="flex bg-slate-950 p-1 rounded-xl w-full mb-6 shadow-sm border border-white/5 relative z-10">
              <button type="button" onClick={() => setView('front')} className={`flex-1 py-3 rounded-lg text-xs font-black transition-all ${view === 'front' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>앞면 (FRONT)</button>
              <button type="button" onClick={() => setView('back')} className={`flex-1 py-3 rounded-lg text-xs font-black transition-all ${view === 'back' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>뒷면 (BACK)</button>
           </div>

           {/* 🦾 SF 스캐너 느낌의 인체 그래픽 영역 */}
           <div className="relative w-full max-w-[300px] mx-auto overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-inner">
               <svg viewBox="0 0 240 500" className="w-full h-auto drop-shadow-2xl opacity-80">
                   <defs>
                       {/* 격자무늬 배경 패턴 */}
                       <pattern id="body-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                           <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5" opacity="0.3"/>
                       </pattern>
                       
                       {/* 🌟 진짜 듬직한 근육질 인체 실루엣 Path (오른쪽 반쪽) */}
                       <g id="body-silhouette-half">
                           {/* 인체 외곽선 - 길쭉하지 않게 비율 조정 */}
                           <path d="M 120 15 C 145 15, 155 35, 150 50 C 145 60, 145 65, 150 75 Q 165 80 180 90 L 195 140 C 200 155, 200 170, 195 185 L 200 240 C 205 255, 205 270, 200 285 L 210 320 C 190 330, 180 315, 175 295 L 160 210 C 155 195, 155 180, 160 165 L 140 100 L 130 180 C 125 210, 130 240, 135 270 L 145 350 C 147 365, 145 375, 140 385 L 150 440 C 152 450, 150 460, 145 470 L 150 490 C 135 495, 125 485, 125 470 L 120 440 L 115 380 C 112 370, 114 360, 115 350 L 110 280 Z" fill="#1e293b" stroke="#475569" strokeWidth="2.5" strokeLinejoin="round"/>
                           
                           {/* 주요 근육/관절 데코 라인 */}
                           <path d="M 120 120 Q 150 125 165 110" fill="none" stroke="#334155" strokeWidth="2.5" opacity="0.7"/> {/* 가슴 라인 */}
                           <line x1="120" y1="120" x2="120" y2="240" stroke="#334155" strokeWidth="2.5" opacity="0.7"/> {/* 복근 중앙선 */}
                           <line x1="120" y1="160" x2="152" y2="160" stroke="#334155" strokeWidth="2.5" opacity="0.7"/> {/* 복근 상단 가로선 */}
                           <line x1="120" y1="200" x2="155" y2="200" stroke="#334155" strokeWidth="2.5" opacity="0.7"/> {/* 복근 하단 가로선 */}
                           <path d="M 120 250 Q 140 255 160 240" fill="none" stroke="#334155" strokeWidth="2.5" opacity="0.7"/> {/* 골반 상단선 */}
                           <path d="M 120 280 Q 145 285 165 260" fill="none" stroke="#334155" strokeWidth="2.5" opacity="0.7"/> {/* 골반 하단선 */}
                           <ellipse cx="128" cy="405" rx="10" ry="14" fill="none" stroke="#334155" strokeWidth="2.5" opacity="0.7"/> {/* 무릎 관절 */}
                       </g>
                   </defs>

                   {/* 그려둔 격자 패턴 배경으로 깔기 */}
                   <rect width="100%" height="100%" fill="url(#body-grid)" opacity="0.5"/>

                   {/* 그려둔 반쪽을 왼쪽/오른쪽 거울처럼 찍어냄 (완벽한 대칭 구현) */}
                   <use href="#body-silhouette-half" />
                   <use href="#body-silhouette-half" transform="translate(240, 0) scale(-1, 1)" />

                   {/* 그 위에 깔끔하게 점만 렌더링! (글씨 없음) */}
                   {visibleNodes.map(node => {
                       if (!node.bilateral) {
                           return <MuscleDot key={node.id} node={node} x={120} />
                       }
                       return (
                           <React.Fragment key={node.id}>
                              <MuscleDot node={node} x={120 - (node.rx || 0)} />
                              <MuscleDot node={node} x={120 + (node.rx || 0)} />
                           </React.Fragment>
                       )
                   })}
               </svg>
           </div>

           {/* 👇 사용자가 점을 터치하면 이 아래에 명칭 칩이 예쁘게 생깁니다! */}
           <div className="mt-8 p-4 bg-slate-950/80 rounded-2xl border border-white/10 min-h-[100px] shadow-inner">
               <h4 className="text-[11px] text-slate-500 font-black mb-3 uppercase tracking-widest text-center">선택된 부위 목록</h4>
               <div className="flex flex-wrap gap-2.5 justify-center">
                   {selectedParts.length > 0 ? (
                       selectedParts.map(part => (
                           <button 
                              key={part} 
                              onClick={() => togglePart(part)} 
                              className={`px-3.5 py-1.5 cursor-pointer text-xs font-extrabold rounded-xl flex items-center gap-2 border transition-all hover:scale-105 active:scale-95 ${type === 'rehab' ? 'bg-red-500 text-white border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.5)]' : type === 'match' ? 'bg-yellow-500 text-white border-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.5)]' : 'bg-blue-600 text-white border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.5)]'}`}
                           >
                               <span className="w-2 h-2 bg-white rounded-full"></span>
                               {getLabel(part)} {/* DB용 이름 대신 보기 좋은 영어 병기 라벨 표시 */}
                               <span className="opacity-70 ml-1 text-[10px]">✕</span>
                           </button>
                       ))
                   ) : (
                       <p className="text-xs font-bold text-slate-600 mt-2 animate-pulse text-center">
                           👆 위 인체에서 점을 터치해주세요
                       </p>
                   )}
               </div>
           </div>
           
        </div>
    )
}