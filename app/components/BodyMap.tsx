"use client"
import React from 'react'

interface BodyMapProps {
  selectedParts: string[];
  togglePart: (part: string) => void;
  type?: 'workout' | 'rehab' | 'match';
}

// 🚨 물리치료/해부학 전공자 맞춤형 데이터 (신용어 / 구용어 / 영어 원어 완벽 분리)
const bodyCategories = [
    {
        title: "상체 (Upper Body)",
        parts: [
            { id: "가슴", name: "가슴", terms: "큰가슴근 / 대흉근 / Pectoralis" },
            { id: "등", name: "등", terms: "넓은등근 / 광배근 / Latissimus Dorsi" },
            { id: "어깨", name: "어깨", terms: "어깨세모근 / 삼각근 / Deltoid" },
            { id: "승모근", name: "승모근", terms: "등세모근 / 승모근 / Trapezius" },
            { id: "이두", name: "이두", terms: "위팔두갈래근 / 상완이두근 / Biceps Brachii" },
            { id: "삼두", name: "삼두", terms: "위팔세갈래근 / 상완삼두근 / Triceps Brachii" },
            { id: "전완근", name: "전완근", terms: "아래팔근 / 전완근 / Forearm Muscle" },
        ]
    },
    {
        title: "하체 (Lower Body)",
        parts: [
            { id: "엉덩이", name: "엉덩이", terms: "큰볼기근 / 대둔근 / Gluteus Maximus" },
            { id: "고관절", name: "고관절", terms: "엉덩관절 / 고관절 / Hip Joint" },
            { id: "허벅지(앞)", name: "앞벅지", terms: "넙다리네갈래근 / 대퇴사두근 / Quadriceps" },
            { id: "허벅지(뒤)(햄스트링)", name: "뒷벅지", terms: "넙다리뒤근육 / 햄스트링 / Hamstrings" },
            { id: "무릎", name: "무릎", terms: "무릎관절 / 슬관절 / Knee Joint" },
            { id: "종아리", name: "종아리", terms: "장딴지근·가자미근 / 하퇴삼두근 / Calf (Gastrocnemius)" },
            { id: "발목", name: "발목", terms: "발목관절 / 족관절 / Ankle Joint" },
            { id: "발", name: "발", terms: "발 / 족부 / Foot" },
        ]
    },
    {
        title: "코어 및 기타 (Core & Others)",
        parts: [
            { id: "목", name: "목", terms: "목뼈·목근육 / 경추부 / Cervical" },
            { id: "복근", name: "복근", terms: "배곧은근 / 복직근 / Rectus Abdominis" },
            { id: "허리", name: "허리", terms: "허리뼈·척추세움근 / 요추부 / Lumbar" },
            { id: "손목", name: "손목", terms: "손목관절 / 수관절 / Wrist Joint" },
            { id: "손", name: "손", terms: "손 / 수부 / Hand" },
        ]
    }
];

export default function BodyMap({ selectedParts, togglePart, type = 'workout' }: BodyMapProps) {
    // 훈련, 재활, 경기 상황에 맞는 선택 색상 적용 (파란색 테마 유지)
    const activeBg = type === 'rehab' ? 'bg-red-500 border-red-400' : type === 'match' ? 'bg-yellow-500 border-yellow-400' : 'bg-blue-600 border-blue-400';
    const activeText = type === 'match' ? 'text-slate-900' : 'text-white';
    const activeSubText = type === 'match' ? 'text-slate-800' : 'text-white/80';

    return (
        <div className="w-full bg-slate-900/50 rounded-3xl p-5 border border-white/5 shadow-inner max-h-[400px] overflow-y-auto custom-scrollbar">
            <div className="space-y-6">
                {bodyCategories.map((category) => (
                    <div key={category.title}>
                        <h4 className="text-xs font-extrabold text-slate-400 mb-3 border-b border-slate-800 pb-2">
                            {category.title}
                        </h4>
                        {/* 🚨 버튼들을 깔끔한 2열(그리드)로 정렬하여 가독성 극대화 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {category.parts.map((part) => {
                                const isSelected = selectedParts.includes(part.id);
                                return (
                                    <button
                                        key={part.id}
                                        type="button"
                                        onClick={() => togglePart(part.id)}
                                        className={`flex flex-col text-left px-4 py-2.5 rounded-xl border transition-all duration-200 active:scale-95 ${
                                            isSelected 
                                                ? `${activeBg} shadow-[0_0_15px_rgba(0,0,0,0.3)]` 
                                                : 'bg-slate-800/80 border-slate-700 hover:bg-slate-700 hover:border-slate-500'
                                        }`}
                                    >
                                        <span className={`text-[13px] font-black mb-0.5 ${isSelected ? activeText : 'text-slate-200'}`}>
                                            {part.name}
                                        </span>
                                        {/* 👇 신용어 / 구용어 / 영어가 들어가는 서브 텍스트 */}
                                        <span className={`text-[9px] font-medium tracking-tight ${isSelected ? activeSubText : 'text-slate-500'}`}>
                                            {part.terms}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
            
            {/* 선택된 항목이 없을 때 안내 문구 */}
            {selectedParts.length === 0 && (
                <div className="mt-6 pt-4 border-t border-slate-800 text-center">
                    <p className="text-xs font-bold text-slate-500 animate-pulse">
                        👆 위 목록에서 관련된 운동/통증 부위를 선택해주세요
                    </p>
                </div>
            )}
        </div>
    )
}