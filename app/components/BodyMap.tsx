"use client"
import React, { useState } from 'react'

interface BodyMapProps {
  selectedParts: string[];
  togglePart: (part: string) => void;
  type?: 'workout' | 'rehab' | 'match';
}

// 부위별 데이터 (DB에 저장될 정확한 id와 화면에 예쁘게 보일 label 분리)
const nodes = [
  { id: "목", label: "목 (Neck)", y: 65, view: 'both' },
  { id: "승모근", label: "승모근 (Trapezius)", y: 80, view: 'both' },
  { id: "어깨", label: "어깨 (Deltoid)", y: 95, view: 'both', bilateral: true, rx: 48 },
  { id: "가슴", label: "가슴 (Pectoral)", y: 110, view: 'front' },
  { id: "등", label: "등 (Lats)", y: 110, view: 'back' },
  { id: "이두", label: "이두 (Biceps)", y: 135, view: 'front', bilateral: true, rx: 58 },
  { id: "삼두", label: "삼두 (Triceps)", y: 135, view: 'back', bilateral: true, rx: 58 },
  { id: "복근", label: "복근 (Abs)", y: 170, view: 'front' },
  { id: "허리", label: "허리 (Lower Back)", y: 170, view: 'back' },
  { id: "전완근", label: "전완근 (Forearm)", y: 200, view: 'both', bilateral: true, rx: 65 },
  { id: "고관절", label: "고관절 (Hip)", y: 245, view: 'front' },
  { id: "엉덩이", label: "엉덩이 (Glutes)", y: 245, view: 'back' },
  { id: "손목", label: "손목 (Wrist)", y: 245, view: 'both', bilateral: true, rx: 70 },
  { id: "손", label: "손 (Hand)", y: 275, view: 'both', bilateral: true, rx: 72 },
  { id: "허벅지(앞)", label: "앞벅지 (Quads)", y: 300, view: 'front', bilateral: true, rx: 25 },
  { id: "허벅지(뒤)(햄스트링)", label: "햄스트링 (Hamstring)", y: 300, view: 'back', bilateral: true, rx: 25 },
  { id: "무릎", label: "무릎 (Knee)", y: 365, view: 'front', bilateral: true, rx: 20 },
  { id: "종아리", label: "종아리 (Calf)", y: 410, view: 'both', bilateral: true, rx: 25 },
  { id: "발목", label: "발목 (Ankle)", y: 460, view: 'both', bilateral: true, rx: 30 },
  { id: "발", label: "발 (Foot)", y: 485, view: 'both', bilateral: true, rx: 32 },
]

export default function BodyMap({ selectedParts, togglePart, type = 'workout' }: BodyMapProps) {
    const [view, setView] = useState<'front'|'back'>('front');

    // 상황에 맞는 포인트 색상 (재활은 빨강, 훈련은 에메랄드)
    const activeColor = type === 'rehab' ? '#ef4444' : '#10b981';

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
            <g className="cursor-pointer" onClick={() => togglePart(node.id)}>
                {/* 🚨 보이지 않는 대형 터치 영역 (손가락 삑사리 완벽 방지) */}
                <circle cx={x} cy={node.y} r="25" fill="transparent" />
                
                {/* 선택 시 배경에 퍼지는 네온 파동 */}
                {isSelected && (
                    <circle cx={x} cy={node.y} r="12" fill={activeColor} opacity="0.3" className="animate-pulse" />
                )}
                
                {/* 실제 보여지는 세련된 점 */}
                <circle 
                    cx={x} 
                    cy={node.y} 
                    r={isSelected ? "6" : "4"} 
                    fill={color} 
                    stroke={isSelected ? "#ffffff" : "#1e293b"} 
                    strokeWidth="2" 
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
           <div className="relative w-full max-w-[260px] mx-auto">
               <svg viewBox="0 0 240 500" className="w-full h-auto drop-shadow-2xl">
                   <defs>
                       {/* 🌟 진짜 사람 근육 실루엣을 코드로 정교하게 깎아낸 마법의 데칼코마니 (오른쪽 반쪽) */}
                       <g id="half-body">
                           {/* 인체 외곽선 */}
                           <path d="M 120 20 C 135 20, 140 35, 135 50 C 130 60, 130 65, 135 70 C 150 75, 170 80, 175 95 L 185 140 C 190 150, 190 160, 185 170 L 195 230 C 200 240, 200 250, 195 260 L 200 280 C 190 285, 185 275, 180 260 L 170 180 C 165 170, 165 160, 170 150 L 155 105 L 145 170 C 140 200, 145 220, 150 240 L 160 340 C 162 355, 160 365, 155 375 L 165 440 C 168 455, 165 465, 160 475 L 165 495 C 150 500, 140 490, 140 480 L 135 450 L 125 375 C 120 365, 122 355, 125 340 L 120 270 Z" fill="#1e293b" stroke="#475569" strokeWidth="2" strokeLinejoin="round"/>
                           
                           {/* 인체 내부 근육/관절 경계선 (디테일) */}
                           <path d="M 120 115 Q 140 120 152 105" fill="none" stroke="#334155" strokeWidth="2"/> {/* 가슴 라인 */}
                           <line x1="120" y1="115" x2="120" y2="230" stroke="#334155" strokeWidth="2"/> {/* 복근 중앙선 */}
                           <line x1="120" y1="150" x2="142" y2="150" stroke="#334155" strokeWidth="2"/> {/* 복근 가로선 1 */}
                           <line x1="120" y1="185" x2="145" y2="185" stroke="#334155" strokeWidth="2"/> {/* 복근 가로선 2 */}
                           <path d="M 120 235 Q 135 240 148 230" fill="none" stroke="#334155" strokeWidth="2"/> {/* 허리 라인 */}
                           <path d="M 120 270 Q 135 275 150 240" fill="none" stroke="#334155" strokeWidth="2"/> {/* 고관절 라인 */}
                           <ellipse cx="140" cy="365" rx="10" ry="14" fill="none" stroke="#334155" strokeWidth="2"/> {/* 무릎 관절 */}
                           <ellipse cx="178" cy="160" rx="6" ry="10" fill="none" stroke="#334155" strokeWidth="2"/> {/* 팔꿈치 관절 */}
                           <path d="M 155 105 Q 165 95 173 95" fill="none" stroke="#334155" strokeWidth="2"/> {/* 어깨 관절 라인 */}
                       </g>
                   </defs>

                   {/* 그려둔 반쪽을 왼쪽/오른쪽 거울처럼 찍어냄 (완벽한 대칭 구현) */}
                   <use href="#half-body" />
                   <use href="#half-body" transform="translate(240, 0) scale(-1, 1)" />

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
           <div className="mt-8 p-4 bg-slate-950/50 rounded-2xl border border-white/5 min-h-[100px]">
               <h4 className="text-[10px] text-slate-500 font-black mb-3 uppercase tracking-widest text-center">선택된 부위 목록</h4>
               <div className="flex flex-wrap gap-2 justify-center">
                   {selectedParts.length > 0 ? (
                       selectedParts.map(part => (
                           <span 
                              key={part} 
                              onClick={() => togglePart(part)} 
                              className={`px-3 py-1.5 cursor-pointer text-xs font-bold rounded-xl flex items-center gap-1.5 border transition-all hover:scale-105 active:scale-95 ${type === 'rehab' ? 'bg-red-500 text-white border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.4)]' : 'bg-emerald-500 text-white border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]'}`}
                           >
                               <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                               {getLabel(part)} {/* DB용 이름 대신 보기 좋은 영어 병기 라벨 표시 */}
                               <span className="opacity-70 ml-1 text-[10px]">✕</span>
                           </span>
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