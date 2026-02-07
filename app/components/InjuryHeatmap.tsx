'use client';

import React, { useMemo } from 'react';

type Log = {
  id: string;
  content: string; // 예: "[무릎, 발목] 오늘 좀 아픔"
  pain_score: number;
  log_type: 'workout' | 'rehab';
  created_at: string;
};

type Props = {
  logs: Log[];
};

export default function InjuryHeatmap({ logs }: Props) {
  // 1. 재활(Rehab) 기록이거나 통증 점수가 높은(4점 이상) 기록만 골라내기
  const injuryLogs = useMemo(() => {
    return logs.filter(log => log.log_type === 'rehab' || log.pain_score >= 4);
  }, [logs]);

  // 2. 부위별로 몇 번 아팠는지 카운트 세기
  const partCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    
    injuryLogs.forEach(log => {
      // "[무릎, 발목]" 처럼 대괄호 안에 있는 부위 텍스트만 추출
      const match = log.content.match(/^\[(.*?)\]/);
      if (match) {
        const parts = match[1].split(', '); // 쉼표로 쪼개기
        parts.forEach(part => {
          counts[part] = (counts[part] || 0) + 1;
        });
      }
    });
    return counts;
  }, [injuryLogs]);

  // 3. 횟수에 따라 색깔 정해주는 함수 (히트맵의 핵심! 🔥)
  const getColor = (count: number) => {
    if (count === 0) return 'bg-slate-50 text-slate-300 border-slate-100'; // 안 아픔
    if (count <= 2) return 'bg-yellow-100 text-yellow-700 border-yellow-200'; // 살짝 조심
    if (count <= 5) return 'bg-orange-100 text-orange-700 border-orange-200 font-bold'; // 위험
    return 'bg-red-500 text-white border-red-600 font-black shadow-md animate-pulse'; // 🚨 초비상 (많이 다침)
  };

  // 부위 목록 (입력할 때랑 똑같은 순서)
  const bodyGroups = [
    { title: "상체 (Upper)", parts: ["목", "승모근", "어깨", "가슴", "등", "허리", "복근"] },
    { title: "팔 (Arms)", parts: ["이두", "삼두", "전완근", "손목"] },
    { title: "하체 (Lower)", parts: ["엉덩이", "고관절", "허벅지(앞)", "허벅지(뒤)", "무릎", "종아리", "발목", "발바닥"] }
  ];

  return (
    <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            🏥 부상 히트맵 (Injury Map)
          </h2>
          <p className="text-sm text-slate-500 font-bold mt-1">
            최근 자주 통증을 느낀 부위를 분석했습니다.
          </p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-black text-red-500">{injuryLogs.length}</span>
          <span className="text-xs font-bold text-slate-400 block">건의 통증 기록</span>
        </div>
      </div>

      <div className="space-y-6">
        {bodyGroups.map((group, idx) => (
          <div key={idx}>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 pb-1">
              {group.title}
            </h4>
            <div className="flex flex-wrap gap-2">
              {group.parts.map((part) => {
                const count = partCounts[part] || 0;
                return (
                  <div
                    key={part}
                    className={`px-3 py-2 rounded-xl text-xs border transition-all duration-300 flex items-center gap-1.5 ${getColor(count)}`}
                  >
                    {part}
                    {count > 0 && (
                      <span className="bg-white/30 px-1.5 py-0.5 rounded-md text-[10px] min-w-[18px] text-center">
                        {count}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 범례 (Legend) */}
      <div className="mt-6 flex justify-center gap-4 text-[10px] font-bold text-slate-400 bg-slate-50 p-3 rounded-xl">
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-slate-200"></div>안전</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-200"></div>주의</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-orange-200"></div>경고</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-500 animate-pulse"></div>위험</div>
      </div>
    </div>
  );
}