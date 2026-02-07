'use client';

import React from 'react';

type Props = {
  selectedParts: string[];
  togglePart: (part: string) => void;
  logType: 'workout' | 'rehab';
};

export default function BodyMapSelector({ selectedParts, togglePart, logType }: Props) {
  // 색상 설정 (운동: 파랑 / 재활: 빨강)
  const activeClass = logType === 'workout' 
    ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105' 
    : 'bg-red-500 text-white border-red-500 shadow-md transform scale-105';
    
  const inactiveClass = 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300';

  // 부위 데이터 (단순 텍스트 리스트)
  const bodyGroups = [
    {
      title: "상체 (Upper)",
      parts: ["목", "승모근", "어깨", "가슴", "등", "허리", "복근"]
    },
    {
      title: "팔 (Arms)",
      parts: ["이두", "삼두", "전완근", "손목"]
    },
    {
      title: "하체 (Lower)",
      parts: ["엉덩이", "고관절", "허벅지(앞)", "허벅지(뒤)", "무릎", "종아리", "발목", "발바닥"]
    }
  ];

  return (
    <div className="w-full space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
      <div className="text-center mb-2">
        <h3 className="text-slate-700 font-bold text-sm">운동 부위 선택</h3>
      </div>

      {bodyGroups.map((group, idx) => (
        <div key={idx}>
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            {group.title}
          </h4>
          <div className="flex flex-wrap gap-2">
            {group.parts.map((part) => {
              const isSelected = selectedParts.includes(part);
              return (
                <button
                  key={part}
                  type="button" // 🚨 [중요] 이게 있어야 저장 버튼이랑 안 헷갈림!
                  onClick={() => togglePart(part)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all duration-200 ${
                    isSelected ? activeClass : inactiveClass
                  }`}
                >
                  {part}
                  {isSelected && <span className="ml-1 opacity-70">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}