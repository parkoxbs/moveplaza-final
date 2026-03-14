"use client"
import React, { useState } from 'react';

interface ActivityCalendarProps {
  logs: any[];
  selectedDate: Date | null;
  onSelectDate: (date: Date | null) => void;
}

export default function ActivityCalendar({ logs, selectedDate, onSelectDate }: ActivityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // 이번 달의 일수와 시작 요일 구하기
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0: 일요일, 1: 월요일 ...

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  // 빈 칸 + 실제 날짜 배열 생성
  const emptyDays: (number | null)[] = Array(firstDayOfMonth).fill(null);
  const realDays: (number | null)[] = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const days = [...emptyDays, ...realDays];

  const isToday = (d: number) => {
    const today = new Date();
    return today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
  };

  const isSelected = (d: number) => {
    if (!selectedDate) return false;
    return selectedDate.getDate() === d && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
  };

  const handleDateClick = (d: number) => {
    const clickedDate = new Date(year, month, d);
    // 이미 선택된 날짜를 다시 누르면 전체보기로 리셋
    if (isSelected(d)) {
      onSelectDate(null);
    } else {
      onSelectDate(clickedDate);
    }
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-5 border border-white/10 shadow-2xl">
      
      {/* 달력 헤더 (월 이동) */}
      <div className="flex items-center justify-between mb-6 px-2">
        <button onClick={prevMonth} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition shadow-sm border border-white/5 active:scale-95">
          &lt;
        </button>
        <h3 className="text-xl font-black text-white tracking-tight drop-shadow-md">
          {year}년 {month + 1}월
        </h3>
        <button onClick={nextMonth} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition shadow-sm border border-white/5 active:scale-95">
          &gt;
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 mb-3 text-center">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
          <div key={day} className={`text-xs font-black pb-2 ${idx === 0 ? 'text-red-400' : idx === 6 ? 'text-blue-400' : 'text-slate-500'}`}>
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((d, index) => {
          if (d === null) return <div key={`empty-${index}`} className="h-14" />; // 빈 칸 처리

          // 해당 날짜의 기록들 찾기
          const dateStr = new Date(year, month, d).toDateString();
          const dayLogs = logs.filter(l => new Date(l.created_at).toDateString() === dateStr);
          
          const hasWorkout = dayLogs.some(l => l.log_type === 'workout');
          const hasMatch = dayLogs.some(l => l.log_type === 'match');
          const hasRehab = dayLogs.some(l => l.log_type === 'rehab');
          const hasAny = hasWorkout || hasMatch || hasRehab;

          return (
            <div 
              key={d} 
              onClick={() => handleDateClick(d)}
              className={`relative h-14 flex flex-col items-center justify-start pt-1.5 cursor-pointer rounded-2xl transition-all duration-300 active:scale-90 overflow-hidden
                ${isSelected(d) 
                    ? 'bg-blue-600/30 ring-2 ring-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.4)]' 
                    : hasAny 
                        ? 'bg-slate-800 border border-white/10 shadow-lg hover:bg-slate-700' 
                        : 'bg-slate-900/50 border border-transparent opacity-60 hover:opacity-100 hover:bg-slate-800'}
              `}
            >
              {/* 날짜 숫자 (오늘 날짜는 뱃지처럼 파랗게 강조) */}
              <span className={`text-[11px] font-extrabold z-10 ${isSelected(d) ? 'text-blue-300' : isToday(d) ? 'text-white bg-blue-600 px-1.5 py-0.5 rounded-md leading-none shadow-md' : hasAny ? 'text-slate-200' : 'text-slate-500'}`}>
                {d}
              </span>
              
              {/* 🎯 마성의 스탬프 아이콘! */}
              <div className="flex gap-0.5 mt-auto pb-1.5 z-10">
                {hasWorkout && <span className="text-[14px] drop-shadow-md transition-transform hover:scale-110" title="훈련">👟</span>}
                {hasMatch && <span className="text-[14px] drop-shadow-md transition-transform hover:scale-110" title="경기">⚽</span>}
                {hasRehab && <span className="text-[14px] drop-shadow-md transition-transform hover:scale-110" title="재활">🩹</span>}
              </div>

              {/* 기록이 있는 날은 은은한 배경 후광(Glow) 효과 */}
              {hasMatch && <div className="absolute inset-0 bg-yellow-500/10 blur-md pointer-events-none"></div>}
              {!hasMatch && hasWorkout && <div className="absolute inset-0 bg-blue-500/10 blur-md pointer-events-none"></div>}
              {!hasMatch && !hasWorkout && hasRehab && <div className="absolute inset-0 bg-red-500/10 blur-md pointer-events-none"></div>}
            </div>
          );
        })}
      </div>
      
      {/* 하단 범례 (Legend) */}
      <div className="flex justify-center gap-5 mt-6 pt-4 border-t border-white/10 bg-slate-950/40 rounded-xl p-3 shadow-inner">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300"><span className="text-base drop-shadow-md">👟</span> 훈련</div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300"><span className="text-base drop-shadow-md">⚽</span> 경기</div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300"><span className="text-base drop-shadow-md">🩹</span> 재활</div>
      </div>
      
    </div>
  );
}