'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toPng } from 'html-to-image';
import toast, { Toaster } from 'react-hot-toast';

// 아이콘
const Icons = {
  ArrowLeft: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>,
  Download: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>,
};

// 📍 포메이션 좌표 데이터
const FORMATIONS: any = {
  '4-3-3': [
    { top: '90%', left: '50%' }, // GK
    { top: '75%', left: '15%' }, { top: '75%', left: '38%' }, { top: '75%', left: '62%' }, { top: '75%', left: '85%' }, // DF
    { top: '52%', left: '25%' }, { top: '55%', left: '50%' }, { top: '52%', left: '75%' }, // MF
    { top: '25%', left: '20%' }, { top: '22%', left: '50%' }, { top: '25%', left: '80%' }  // FW
  ],
  '4-4-2': [
    { top: '90%', left: '50%' }, // GK
    { top: '75%', left: '15%' }, { top: '75%', left: '38%' }, { top: '75%', left: '62%' }, { top: '75%', left: '85%' }, // DF
    { top: '50%', left: '15%' }, { top: '50%', left: '38%' }, { top: '50%', left: '62%' }, { top: '50%', left: '85%' }, // MF
    { top: '25%', left: '35%' }, { top: '25%', left: '65%' }  // FW
  ],
  '4-2-3-1': [
    { top: '90%', left: '50%' }, // GK
    { top: '78%', left: '15%' }, { top: '78%', left: '38%' }, { top: '78%', left: '62%' }, { top: '78%', left: '85%' }, // DF
    { top: '60%', left: '35%' }, { top: '60%', left: '65%' }, // CDM
    { top: '40%', left: '15%' }, { top: '40%', left: '50%' }, { top: '40%', left: '85%' }, // CAM/Wing
    { top: '22%', left: '50%' }  // ST
  ],
  '3-5-2': [
    { top: '90%', left: '50%' }, // GK
    { top: '75%', left: '25%' }, { top: '75%', left: '50%' }, { top: '75%', left: '75%' }, // DF
    { top: '50%', left: '10%' }, { top: '50%', left: '30%' }, { top: '55%', left: '50%' }, { top: '50%', left: '70%' }, { top: '50%', left: '90%' }, // MF
    { top: '25%', left: '35%' }, { top: '25%', left: '65%' }  // FW
  ],
  '3-4-3': [
    { top: '90%', left: '50%' }, // GK
    { top: '75%', left: '20%' }, { top: '75%', left: '50%' }, { top: '75%', left: '80%' }, // DF
    { top: '52%', left: '10%' }, { top: '52%', left: '35%' }, { top: '52%', left: '65%' }, { top: '52%', left: '90%' }, // MF
    { top: '25%', left: '20%' }, { top: '22%', left: '50%' }, { top: '25%', left: '80%' }  // FW
  ],
  '5-2-3': [
    { top: '92%', left: '50%' }, // GK
    { top: '78%', left: '10%' }, { top: '78%', left: '30%' }, { top: '78%', left: '50%' }, { top: '78%', left: '70%' }, { top: '78%', left: '90%' }, // DF
    { top: '52%', left: '35%' }, { top: '52%', left: '65%' }, // MF
    { top: '25%', left: '20%' }, { top: '22%', left: '50%' }, { top: '25%', left: '80%' }  // FW
  ],
  '4-1-4-1': [
    { top: '92%', left: '50%' }, // GK
    { top: '80%', left: '15%' }, { top: '80%', left: '38%' }, { top: '80%', left: '62%' }, { top: '80%', left: '85%' }, // DF
    { top: '62%', left: '50%' }, // CDM
    { top: '42%', left: '12%' }, { top: '42%', left: '35%' }, { top: '42%', left: '65%' }, { top: '42%', left: '88%' }, // MF
    { top: '22%', left: '50%' }  // ST
  ]
};

// 유니폼 색상 프리셋
const KIT_COLORS = [
  { name: 'Red', bg: 'bg-red-600', text: 'text-white' },
  { name: 'Blue', bg: 'bg-blue-600', text: 'text-white' },
  { name: 'White', bg: 'bg-white', text: 'text-black' },
  { name: 'Black', bg: 'bg-slate-900', text: 'text-white' },
  { name: 'Yellow', bg: 'bg-yellow-400', text: 'text-black' },
  { name: 'Green', bg: 'bg-green-600', text: 'text-white' },
  { name: 'Sky', bg: 'bg-sky-400', text: 'text-white' },
];

export default function LineupPage() {
  const router = useRouter();
  const fieldRef = useRef<HTMLDivElement>(null);
  
  const [formation, setFormation] = useState('4-3-3');
  const [kitColor, setKitColor] = useState(KIT_COLORS[0]);
  const [teamName, setTeamName] = useState('MY TEAM');
  
  // 🚨 드래그 앤 드롭을 위해 players 상태에 position 객체 추가
  const [players, setPlayers] = useState(Array.from({ length: 11 }, (_, i) => ({
    id: i,
    name: i === 0 ? 'GK' : `Player ${i}`,
    number: i === 0 ? 1 : i + 1,
    isMOM: false,
    isCaptain: false,
    goals: 0,
    position: FORMATIONS['4-3-3'][i] // 초기 위치 세팅
  })));

  const [editingPlayer, setEditingPlayer] = useState<any>(null);

  // 🚨 드래그 상태 관리 변수들
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const initialPlayerPos = useRef({ top: 0, left: 0 });
  const isDraggingRef = useRef(false);

  // 포메이션 변경 시 선수 위치 일괄 이동
  const handleFormationChange = (fmt: string) => {
    setFormation(fmt);
    setPlayers(prev => prev.map((p, i) => ({
        ...p,
        position: FORMATIONS[fmt][i] || { top: '50%', left: '50%' }
    })));
  };

  const handlePlayerClick = (player: any) => {
    setEditingPlayer(player);
  };

  const updatePlayer = (key: string, value: any) => {
    if (key === 'isCaptain' && value === true) {
        setPlayers(players.map(p => ({
            ...p,
            isCaptain: p.id === editingPlayer.id ? true : false
        })));
        setEditingPlayer((prev: any) => prev ? ({ ...prev, isCaptain: true }) : null);
    } else {
        setPlayers(players.map(p => p.id === editingPlayer.id ? { ...p, [key]: value } : p));
        setEditingPlayer((prev: any) => {
            if (!prev) return null;
            return { ...prev, [key]: value };
        });
    }
  };

  const handleSaveImage = async () => {
    if (!fieldRef.current) return;
    const t = toast.loading("이미지 생성 중... 🎨");
    try {
      const dataUrl = await toPng(fieldRef.current, { cacheBust: true, pixelRatio: 2, backgroundColor: '#0f172a' });
      const link = document.createElement('a');
      link.download = `moveplaza_lineup_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("저장 완료! 인스타에 자랑하세요 📸", { id: t });
    } catch (e) {
      toast.error("저장 실패 ㅠ", { id: t });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white pb-20">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1e293b', color: '#fff' } }} />
      
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-white/5 p-4 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-white"><Icons.ArrowLeft /></button>
        <span className="font-black text-lg">LINEUP BUILDER ⚽</span>
        <div className="w-6"></div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        
        {/* 1. 설정 컨트롤 패널 */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-white/10 space-y-4 shadow-sm">
          <div>
            <label className="text-xs font-bold text-slate-400 mb-2 block">팀 이름</label>
            <input 
              type="text" 
              value={teamName} 
              onChange={(e) => setTeamName(e.target.value)} 
              className="w-full bg-slate-800 text-white font-black text-center p-2 rounded-lg border border-white/10 focus:border-blue-500 outline-none transition"
            />
          </div>
          
          <div>
            <label className="text-xs font-bold text-slate-400 mb-2 block">포메이션</label>
            <div className="flex flex-wrap gap-1">
              {Object.keys(FORMATIONS).map(fmt => (
                <button 
                  key={fmt} 
                  onClick={() => handleFormationChange(fmt)} // 🚨 수정된 함수 적용
                  className={`flex-grow py-2 px-3 text-xs font-bold rounded-lg transition active:scale-95 ${formation === fmt ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 mb-2 block">유니폼 컬러</label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {KIT_COLORS.map(color => (
                <button 
                  key={color.name}
                  onClick={() => setKitColor(color)}
                  className={`w-8 h-8 rounded-full border-2 shrink-0 transition active:scale-90 ${color.bg} ${kitColor.name === color.name ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 2. 그라운드 (캡처 영역) */}
        <div 
          ref={fieldRef} 
          className="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border-[3px] border-white/30"
          style={{
            backgroundColor: '#2d6a35', 
            backgroundImage: `
                radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.4) 100%), 
                repeating-linear-gradient(to bottom, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 25px, transparent 25px, transparent 50px)
            `
          }}
        >
          
          {/* 센터 서클 & 라인 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white/70 rounded-full pointer-events-none"></div>
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/70 -translate-y-1/2 pointer-events-none"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-transparent pointer-events-none"></div>

          {/* 페널티 박스 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 border-2 border-t-0 border-white/70 pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-24 border-2 border-b-0 border-white/70 pointer-events-none"></div>

          {/* 팀 이름 */}
          <div className="absolute top-6 left-0 w-full text-center z-10 pointer-events-none">
            <h2 className="text-3xl font-black text-white drop-shadow-lg italic tracking-tighter uppercase">{teamName}</h2>
            <p className="text-white/80 text-xs font-bold tracking-widest">{formation}</p>
          </div>

          {/* 선수 배치 (드래그 앤 드롭 지원) */}
          {players.map((player, index) => {
            const isDragging = draggingId === player.id;
            return (
              <div 
                key={player.id}
                className={`absolute flex flex-col items-center justify-center cursor-grab active:cursor-grabbing ${isDragging ? 'scale-110 z-50' : 'z-20 transition-all duration-300'}`}
                style={{ 
                    top: player.position.top, 
                    left: player.position.left, 
                    transform: 'translate(-50%, -50%)', 
                    width: '60px',
                    touchAction: 'none' // 🚨 모바일에서 드래그 시 화면 스크롤 방지
                }} 
                onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    setDraggingId(player.id);
                    isDraggingRef.current = false;
                    dragStartPos.current = { x: e.clientX, y: e.clientY };
                    initialPlayerPos.current = {
                        top: parseFloat(player.position.top),
                        left: parseFloat(player.position.left)
                    };
                }}
                onPointerMove={(e) => {
                    if (draggingId !== player.id) return;
                    
                    const dx = e.clientX - dragStartPos.current.x;
                    const dy = e.clientY - dragStartPos.current.y;
                    
                    // 움직임이 3px 이상일 때만 '드래그'로 판정 (그 이하는 단순 터치/클릭)
                    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                        isDraggingRef.current = true;
                    }

                    if (isDraggingRef.current && fieldRef.current) {
                        const rect = fieldRef.current.getBoundingClientRect();
                        const dxPercent = (dx / rect.width) * 100;
                        const dyPercent = (dy / rect.height) * 100;

                        let newLeft = initialPlayerPos.current.left + dxPercent;
                        let newTop = initialPlayerPos.current.top + dyPercent;

                        // 화면 밖으로 못 나가게 제한 (0% ~ 100%)
                        newLeft = Math.max(0, Math.min(100, newLeft));
                        newTop = Math.max(0, Math.min(100, newTop));

                        setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, position: { top: `${newTop}%`, left: `${newLeft}%` } } : p));
                    }
                }}
                onPointerUp={(e) => {
                    if (draggingId === player.id) {
                        e.currentTarget.releasePointerCapture(e.pointerId);
                        setDraggingId(null);
                        
                        // 드래그가 아니라 단순 클릭이었다면 수정 모달 띄우기
                        if (!isDraggingRef.current) {
                            handlePlayerClick(player);
                        }
                        isDraggingRef.current = false;
                    }
                }}
              >
                {/* 유니폼 아이콘 (포인터 이벤트 차단하여 드래그 간섭 방지) */}
                <div className={`relative w-10 h-10 pointer-events-none ${index === 0 ? 'text-yellow-400' : kitColor.text}`}>
                   <div className={`absolute inset-0 rounded-full opacity-80 ${index === 0 ? 'bg-yellow-900' : kitColor.bg} blur-md`}></div>
                   <div className={`relative z-10 w-full h-full flex items-center justify-center rounded-full border-2 border-white/30 shadow-lg ${index === 0 ? 'bg-yellow-500 text-black' : `${kitColor.bg} ${kitColor.text}`}`}>
                      <span className="font-black text-sm">{player.number}</span>
                   </div>
                   
                   {/* 뱃지들 */}
                   {player.isCaptain && <span className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-400 border border-black rounded-full flex items-center justify-center text-[10px] font-black text-black shadow-md z-20">C</span>}
                   {player.isMOM && <span className="absolute -top-2 -left-2 text-lg drop-shadow-md animate-bounce z-20">⭐</span>}
                   
                   {/* 골 숫자 표시 */}
                   {player.goals > 0 && (
                       <div className="absolute -bottom-2 -right-2 bg-white border border-black rounded-full flex items-center justify-center px-1.5 py-0.5 z-20 shadow-sm gap-0.5">
                           <span className="text-[10px] leading-none">⚽</span>
                           <span className="text-[10px] font-black text-black leading-none font-sans">{player.goals}</span>
                       </div>
                   )}
                </div>
                
                {/* 이름표 (포인터 이벤트 차단) */}
                <div className="mt-0.5 px-2 py-0.5 bg-black/60 rounded-md backdrop-blur-sm border border-white/10 max-w-[80px] pointer-events-none">
                  <p className="text-[9px] font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis">{player.name}</p>
                </div>
              </div>
            );
          })}

          {/* 로고 */}
          <div className="absolute bottom-4 right-4 opacity-50 pointer-events-none">
            <p className="text-[10px] font-black text-white italic">MOVEPLAZA</p>
          </div>
        </div>

        <button 
          onClick={handleSaveImage}
          className="w-full py-4 bg-blue-600 text-white font-extrabold rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:bg-blue-500 transition flex items-center justify-center gap-2 active:scale-95"
        >
          <Icons.Download /> 라인업 이미지 저장하기
        </button>

      </main>

      {/* 선수 수정 모달 (기존과 동일) */}
      {editingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setEditingPlayer(null)}>
          <div className="bg-slate-900 border border-white/10 w-full max-w-xs rounded-3xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-black text-white text-lg mb-4 text-center">선수 정보 수정</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-400">이름</label>
                <input type="text" value={editingPlayer.name} onChange={(e) => updatePlayer('name', e.target.value)} className="w-full p-3 bg-slate-800 text-white font-bold rounded-xl border border-slate-700 outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400">등번호</label>
                <input type="number" value={editingPlayer.number} onChange={(e) => updatePlayer('number', e.target.value)} className="w-full p-3 bg-slate-800 text-white font-bold rounded-xl border border-slate-700 outline-none focus:border-blue-500" />
              </div>
              
              <div className="pt-4 border-t border-white/10 space-y-3 mt-2">
                <div className="grid grid-cols-2 gap-2">
                    <button 
                    onClick={() => updatePlayer('isCaptain', !editingPlayer.isCaptain)}
                    className={`py-3 rounded-xl text-xs font-black border transition active:scale-95 ${editingPlayer.isCaptain ? 'bg-yellow-500 text-black border-yellow-400 shadow-md' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                    >
                    © 주장 선임
                    </button>
                    <button 
                    onClick={() => updatePlayer('isMOM', !editingPlayer.isMOM)}
                    className={`py-3 rounded-xl text-xs font-black border transition active:scale-95 ${editingPlayer.isMOM ? 'bg-blue-600 text-white border-blue-400 shadow-md' : 'bg-slate-800 text-slate-400 border-slate-700'}`}
                    >
                    ⭐ MOM
                    </button>
                </div>
                
                <div className="flex items-center bg-slate-800 rounded-xl border border-slate-700 px-4 py-3 justify-between">
                   <span className="text-sm text-slate-300 font-bold">⚽ 득점 기록</span>
                   <div className="flex items-center gap-3">
                       <button onClick={() => updatePlayer('goals', Math.max(0, editingPlayer.goals - 1))} className="w-8 h-8 bg-slate-700 rounded-lg text-white font-black hover:bg-slate-600 active:scale-90 transition">-</button>
                       <span className="font-black text-lg w-6 text-center">{editingPlayer.goals}</span>
                       <button onClick={() => updatePlayer('goals', editingPlayer.goals + 1)} className="w-8 h-8 bg-slate-700 rounded-lg text-white font-black hover:bg-slate-600 active:scale-90 transition">+</button>
                   </div>
                </div>
              </div>
            </div>
            <button onClick={() => setEditingPlayer(null)} className="mt-6 w-full py-4 bg-white text-slate-900 font-black rounded-xl hover:bg-slate-200 transition active:scale-95">완료</button>
          </div>
        </div>
      )}
    </div>
  );
}