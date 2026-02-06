// app/components/BodyMapSelector.tsx

'use client';

import React from 'react';

type Props = {
  selectedParts: string[];
  togglePart: (part: string) => void;
  logType: 'workout' | 'rehab';
};

// 부위별 매핑 데이터 (SVG path와 부위 이름 연결)
const bodyPaths = [
    // 머리/목
    { name: '목(경추)', path: 'M145 65 Q150 85 155 95 L145 105 L135 95 Q140 85 145 65 Z' },
    // 몸통
    { name: '어깨(회전근개)', path: 'M115 105 Q145 100 175 105 L190 125 L175 135 Q145 125 115 135 L100 125 Z' },
    { name: '등(흉추)', path: 'M120 135 Q145 130 170 135 L165 180 Q145 175 125 180 Z' },
    { name: '허리(요추)', path: 'M125 180 Q145 175 165 180 L170 205 Q145 215 120 205 Z' },
    // 팔 (왼쪽)
    { name: '팔꿈치', path: 'M190 125 L210 160 L195 175 L175 135 Z' },
    { name: '손목', path: 'M210 160 L225 190 L210 200 L195 175 Z' },
    // 팔 (오른쪽 - 대칭)
    { name: '팔꿈치', path: 'M100 125 L80 160 L95 175 L115 135 Z' },
    { name: '손목', path: 'M80 160 L65 190 L80 200 L95 175 Z' },
    // 하체 (골반/엉덩이)
    { name: '고관절(서혜부)', path: 'M120 205 Q145 215 170 205 L185 235 Q145 245 105 235 Z' },
    { name: '엉덩이', path: 'M105 235 Q145 245 185 235 L190 260 Q145 270 100 260 Z' },
    // 다리 (왼쪽)
    { name: '허벅지 앞(대퇴사두)', path: 'M185 235 L205 300 L180 310 L160 245 Z' },
    { name: '허벅지 뒤(햄스트링)', path: 'M160 245 L180 310 L155 320 L135 255 Z' },
    { name: '무릎', path: 'M180 310 L205 300 L200 340 L175 350 Z' },
    { name: '종아리', path: 'M200 340 L210 390 L185 400 L175 350 Z' },
    { name: '발목(아킬레스)', path: 'M210 390 L215 410 L190 420 L185 400 Z' },
    { name: '발바닥(족저근막)', path: 'M215 410 L230 430 L180 440 L175 420 Z' },
    // 다리 (오른쪽 - 대칭)
    { name: '허벅지 앞(대퇴사두)', path: 'M105 235 L85 300 L110 310 L130 245 Z' },
    { name: '허벅지 뒤(햄스트링)', path: 'M130 245 L110 310 L135 320 L155 255 Z' },
    { name: '무릎', path: 'M110 310 L85 300 L90 340 L115 350 Z' },
    { name: '종아리', path: 'M90 340 L80 390 L105 400 L115 350 Z' },
    { name: '발목(아킬레스)', path: 'M80 390 L75 410 L100 420 L105 400 Z' },
    { name: '발바닥(족저근막)', path: 'M75 410 L60 430 L110 440 L115 420 Z' },
];

export default function BodyMapSelector({ selectedParts, togglePart, logType }: Props) {
  // 선택된 색상 (운동: 파랑, 재활: 빨강)
  const selectedColor = logType === 'workout' ? '#1e3a8a' : '#dc2626';
  // 기본 색상
  const defaultColor = '#e2e8f0';
  // 호버 색상
  const hoverColor = logType === 'workout' ? '#bfdbfe' : '#fecaca';

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
      <p className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider text-center">
        Tap Body Parts to Select <br/> (정확한 부위를 터치하세요)
      </p>
      
      {/* 인체 실루엣 SVG */}
      <svg
        viewBox="0 0 290 450"
        className="w-full max-w-[300px] h-auto drop-shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 배경 실루엣 (가이드용) */}
        <path d="M145,20 C120,20 100,40 100,65 C100,85 115,100 135,105 L115,115 L90,110 L70,150 L90,165 L110,135 L115,180 L100,230 L80,300 L90,345 L80,400 L60,430 L110,440 L115,415 L135,355 L130,250 L145,250 L160,250 L155,355 L175,415 L180,440 L230,430 L210,400 L200,345 L210,300 L190,230 L175,180 L180,135 L200,165 L220,150 L200,110 L175,115 L155,105 C175,100 190,85 190,65 C190,40 170,20 145,20 Z" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2"/>

        {/* 인터랙티브 부위들 */}
        {bodyPaths.map((part, index) => {
          const isSelected = selectedParts.includes(part.name);
          return (
            <path
              key={index}
              d={part.path}
              fill={isSelected ? selectedColor : defaultColor}
              stroke="white"
              strokeWidth="1.5"
              className={`cursor-pointer transition-all duration-200 hover:opacity-90 ${isSelected ? 'filter drop-shadow-md' : ''}`}
              onClick={() => togglePart(part.name)}
              style={{
                fill: isSelected ? selectedColor : defaultColor,
              }}
              onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.fill = hoverColor; }}
              onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.fill = defaultColor; }}
            >
              <title>{part.name}</title> {/* 마우스 올리면 툴팁 나옴 */}
            </path>
          );
        })}
      </svg>

      {/* 선택된 부위 텍스트 표시 */}
      {selectedParts.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {selectedParts.map((part) => (
            <span key={part} className={`px-3 py-1 rounded-full text-xs font-bold text-white ${logType === 'workout' ? 'bg-blue-900' : 'bg-red-600'}`}>
              {part}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}