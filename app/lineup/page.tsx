'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toPng } from 'html-to-image';
import toast, { Toaster } from 'react-hot-toast';
import { createBrowserClient } from "@supabase/ssr"; 

const supabaseUrl = "https://okckpesbufkqhmzcjiab.supabase.co"
const supabaseKey = "sb_publishable_G_y2dTmNj9nGIvu750MlKQ_jjjgxu-t"
const supabase = createBrowserClient(supabaseUrl, supabaseKey)

// 아이콘
const Icons = {
  ArrowLeft: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>,
  Download: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>,
  Save: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  Folder: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  X: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
};

// 📍 포메이션 좌표 데이터 (11인조, 6인조, 5인조 완벽 분리!)
const FORMATIONS: any = {
  '11v11': {
    '4-3-3': [
      { top: '90%', left: '50%' }, // GK
      { top: '75%', left: '15%' }, { top: '75%', left: '38%' }, { top: '75%', left: '62%' }, { top: '75%', left: '85%' }, // DF
      { top: '52%', left: '25%' }, { top: '55%', left: '50%' }, { top: '52%', left: '75%' }, // MF
      { top: '25%', left: '20%' }, { top: '22%', left: '50%' }, { top: '25%', left: '80%' }  // FW
    ],
    '4-4-2': [
      { top: '90%', left: '50%' },
      { top: '75%', left: '15%' }, { top: '75%', left: '38%' }, { top: '75%', left: '62%' }, { top: '75%', left: '85%' },
      { top: '50%', left: '15%' }, { top: '50%', left: '38%' }, { top: '50%', left: '62%' }, { top: '50%', left: '85%' },
      { top: '25%', left: '35%' }, { top: '25%', left: '65%' }
    ],
    '4-2-3-1': [
      { top: '90%', left: '50%' },
      { top: '78%', left: '15%' }, { top: '78%', left: '38%' }, { top: '78%', left: '62%' }, { top: '78%', left: '85%' },
      { top: '60%', left: '35%' }, { top: '60%', left: '65%' },
      { top: '40%', left: '15%' }, { top: '40%', left: '50%' }, { top: '40%', left: '85%' },
      { top: '22%', left: '50%' }
    ],
    '3-5-2': [
      { top: '90%', left: '50%' },
      { top: '75%', left: '25%' }, { top: '75%', left: '50%' }, { top: '75%', left: '75%' },
      { top: '50%', left: '10%' }, { top: '50%', left: '30%' }, { top: '55%', left: '50%' }, { top: '50%', left: '70%' }, { top: '50%', left: '90%' },
      { top: '25%', left: '35%' }, { top: '25%', left: '65%' }
    ],
    '3-4-3': [
      { top: '90%', left: '50%' },
      { top: '75%', left: '20%' }, { top: '75%', left: '50%' }, { top: '75%', left: '80%' },
      { top: '52%', left: '10%' }, { top: '52%', left: '35%' }, { top: '52%', left: '65%' }, { top: '52%', left: '90%' },
      { top: '25%', left: '20%' }, { top: '22%', left: '50%' }, { top: '25%', left: '80%' }
    ],
    '5-2-3': [
      { top: '92%', left: '50%' },
      { top: '78%', left: '10%' }, { top: '78%', left: '30%' }, { top: '78%', left: '50%' }, { top: '78%', left: '70%' }, { top: '78%', left: '90%' },
      { top: '52%', left: '35%' }, { top: '52%', left: '65%' },
      { top: '25%', left: '20%' }, { top: '22%', left: '50%' }, { top: '25%', left: '80%' }
    ],
    '4-1-4-1': [
      { top: '92%', left: '50%' },
      { top: '80%', left: '15%' }, { top: '80%', left: '38%' }, { top: '80%', left: '62%' }, { top: '80%', left: '85%' },
      { top: '62%', left: '50%' },
      { top: '42%', left: '12%' }, { top: '42%', left: '35%' }, { top: '42%', left: '65%' }, { top: '42%', left: '88%' },
      { top: '22%', left: '50%' }
    ]
  },
  '6v6': {
    '2-2-1': [
      { top: '90%', left: '50%' }, // GK
      { top: '70%', left: '30%' }, { top: '70%', left: '70%' }, // FIXO
      { top: '45%', left: '20%' }, { top: '45%', left: '80%' }, // ALA
      { top: '25%', left: '50%' }  // PIVO
    ],
    '2-1-2': [
      { top: '90%', left: '50%' },
      { top: '72%', left: '30%' }, { top: '72%', left: '70%' },
      { top: '50%', left: '50%' },
      { top: '28%', left: '30%' }, { top: '28%', left: '70%' }
    ],
    '1-3-1': [
      { top: '90%', left: '50%' },
      { top: '75%', left: '50%' },
      { top: '50%', left: '20%' }, { top: '50%', left: '50%' }, { top: '50%', left: '80%' },
      { top: '25%', left: '50%' }
    ],
    '3-1-1': [
      { top: '90%', left: '50%' },
      { top: '70%', left: '20%' }, { top: '72%', left: '50%' }, { top: '70%', left: '80%' },
      { top: '45%', left: '50%' },
      { top: '25%', left: '50%' }
    ]
  },
  '5v5': {
    '1-2-1': [
      { top: '90%', left: '50%' }, // GK
      { top: '70%', left: '50%' }, // FIXO
      { top: '45%', left: '20%' }, { top: '45%', left: '80%' }, // ALA
      { top: '25%', left: '50%' }  // PIVO
    ],
    '2-2': [
      { top: '90%', left: '50%' },
      { top: '65%', left: '30%' }, { top: '65%', left: '70%' },
      { top: '35%', left: '30%' }, { top: '35%', left: '70%' }
    ],
    '2-1-1': [
      { top: '90%', left: '50%' },
      { top: '70%', left: '30%' }, { top: '70%', left: '70%' },
      { top: '48%', left: '50%' },
      { top: '25%', left: '50%' }
    ]
  }
};

// 🚨 유니폼 SVG 렌더링을 위해 svgFill과 stroke 속성 추가!
const KIT_COLORS = [
  { name: 'Red', bg: 'bg-red-600', text: 'text-white', svgFill: 'text-red-600', stroke: 'stroke-red-800' },
  { name: 'Blue', bg: 'bg-blue-600', text: 'text-white', svgFill: 'text-blue-600', stroke: 'stroke-blue-800' },
  { name: 'White', bg: 'bg-white', text: 'text-black', svgFill: 'text-white', stroke: 'stroke-slate-300' },
  { name: 'Black', bg: 'bg-slate-900', text: 'text-white', svgFill: 'text-slate-900', stroke: 'stroke-slate-950' },
  { name: 'Yellow', bg: 'bg-yellow-400', text: 'text-black', svgFill: 'text-yellow-400', stroke: 'stroke-yellow-600' },
  { name: 'Green', bg: 'bg-green-600', text: 'text-white', svgFill: 'text-green-600', stroke: 'stroke-green-800' },
  { name: 'Sky', bg: 'bg-sky-400', text: 'text-white', svgFill: 'text-sky-400', stroke: 'stroke-sky-600' },
];

// 🚨 매치 타입에 따라 포지션 이름을 다르게 출력하는 스마트 계산기
const getPositionInfo = (topPercent: string, leftPercent: string, matchType: string) => {
  const y = parseFloat(topPercent);
  const x = parseFloat(leftPercent);

  // 🥅 풋살 (5v5, 6v6) 전용 포지션 명칭
  if (matchType !== '11v11') {
      if (y >= 85) return { label: 'GK', color: 'bg-yellow-400 text-black' }; // Goleiro (골레이로)
      
      let side = 'C';
      if (x < 35) side = 'L';
      else if (x > 65) side = 'R';

      if (y >= 60) return { label: 'FIXO', color: 'bg-blue-500 text-white' }; // Fixo (픽소/수비)
      if (y >= 40) {
          if (side === 'C') return { label: 'CM', color: 'bg-emerald-500 text-white' };
          return { label: 'ALA', color: 'bg-emerald-500 text-white' }; // Ala (알라/윙어)
      }
      return { label: 'PIVO', color: 'bg-red-500 text-white' }; // Pivo (피보/공격)
  }

  // ⚽ 11인조 (기존) 포지션 명칭
  if (y >= 85) return { label: 'GK', color: 'bg-yellow-400 text-black' };

  let side = 'C';
  if (x < 28) side = 'L';
  else if (x > 72) side = 'R';

  if (y >= 68) {
    if (side === 'L') return { label: 'LB', color: 'bg-blue-500 text-white' };
    if (side === 'R') return { label: 'RB', color: 'bg-blue-500 text-white' };
    return { label: 'CB', color: 'bg-blue-500 text-white' };
  }
  if (y >= 56) {
    if (side === 'L') return { label: 'LWB', color: 'bg-blue-500 text-white' };
    if (side === 'R') return { label: 'RWB', color: 'bg-blue-500 text-white' };
    return { label: 'CDM', color: 'bg-emerald-500 text-white' };
  }
  if (y >= 44) {
    if (side === 'L') return { label: 'LM', color: 'bg-emerald-500 text-white' };
    if (side === 'R') return { label: 'RM', color: 'bg-emerald-500 text-white' };
    return { label: 'CM', color: 'bg-emerald-500 text-white' };
  }
  if (y >= 34) {
    if (side === 'L') return { label: 'LW', color: 'bg-red-500 text-white' };
    if (side === 'R') return { label: 'RW', color: 'bg-red-500 text-white' };
    return { label: 'CAM', color: 'bg-emerald-500 text-white' };
  }
  if (y >= 24) {
    if (side === 'L') return { label: 'LW', color: 'bg-red-500 text-white' };
    if (side === 'R') return { label: 'RW', color: 'bg-red-500 text-white' };
    return { label: 'CF', color: 'bg-red-500 text-white' };
  }
  if (side === 'L') return { label: 'LW', color: 'bg-red-500 text-white' };
  if (side === 'R') return { label: 'RW', color: 'bg-red-500 text-white' };
  return { label: 'ST', color: 'bg-red-500 text-white' };
};

export default function LineupPage() {
  const router = useRouter();
  const fieldRef = useRef<HTMLDivElement>(null);
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [matchType, setMatchType] = useState<'11v11' | '6v6' | '5v5'>('11v11'); 
  const [formation, setFormation] = useState('4-3-3');
  const [kitColor, setKitColor] = useState(KIT_COLORS[0]);
  const [teamName, setTeamName] = useState('MY TEAM');
  
  const [players, setPlayers] = useState(Array.from({ length: 11 }, (_, i) => ({
    id: i,
    name: i === 0 ? 'GK' : `Player ${i}`,
    number: i === 0 ? 1 : i + 1,
    isMOM: false,
    isCaptain: false,
    goals: 0,
    position: FORMATIONS['11v11']['4-3-3'][i] 
  })));

  const [editingPlayer, setEditingPlayer] = useState<any>(null);

  // 드래그 상태 관리
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const initialPlayerPos = useRef({ top: 0, left: 0 });
  const isDraggingRef = useRef(false);

  const [savedLineups, setSavedLineups] = useState<any[]>([]);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [saveName, setSaveName] = useState('');

  useEffect(() => {
    const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
    };
    getUser();
  }, []);

  const handleMatchTypeChange = (type: '11v11' | '6v6' | '5v5') => {
      setMatchType(type);
      const defaultFmt = type === '11v11' ? '4-3-3' : (type === '6v6' ? '2-2-1' : '1-2-1');
      setFormation(defaultFmt);
      
      const playerNum = type === '11v11' ? 11 : (type === '6v6' ? 6 : 5);
      setPlayers(Array.from({ length: playerNum }, (_, i) => ({
          id: i,
          name: i === 0 ? 'GK' : `Player ${i}`,
          number: i === 0 ? 1 : i + 1,
          isMOM: false,
          isCaptain: false,
          goals: 0,
          position: FORMATIONS[type][defaultFmt][i]
      })));
  };

  const handleFormationChange = (fmt: string) => {
    setFormation(fmt);
    setPlayers(prev => prev.map((p, i) => ({
        ...p,
        position: FORMATIONS[matchType][fmt][i] || { top: '50%', left: '50%' }
    })));
  };

  const handlePlayerClick = (player: any) => {
    setEditingPlayer(player);
  };

  const updatePlayer = (key: string, value: any) => {
    if (key === 'isCaptain' && value === true) {
        setPlayers(players.map(p => ({ ...p, isCaptain: p.id === editingPlayer.id })));
        setEditingPlayer((prev: any) => prev ? ({ ...prev, isCaptain: true }) : null);
    } else {
        setPlayers(players.map(p => p.id === editingPlayer.id ? { ...p, [key]: value } : p));
        setEditingPlayer((prev: any) => prev ? { ...prev, [key]: value } : null);
    }
  };

  const handleSaveImage = async () => {
    if (!fieldRef.current) return;
    const t = toast.loading("이미지 생성 중... 🎨");
    try {
      // 🚨 backgroundColor 옵션 완전 삭제 (이것 때문에 배경이 까맣게 나왔었음!)
      const dataUrl = await toPng(fieldRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `moveplaza_lineup_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("저장 완료! 인스타에 자랑하세요 📸", { id: t });
    } catch (e) {
      toast.error("저장 실패 ㅠ", { id: t });
    }
  };

  const handleSaveLineupDB = async () => {
      if (!currentUser) return toast.error("로그인이 필요합니다.");
      if (!saveName.trim()) return toast.error("저장할 이름을 입력해주세요!");

      const t = toast.loading("전술 저장 중...");
      const { error } = await supabase.from('lineups').insert({
          user_id: currentUser.id,
          save_name: saveName,
          team_name: teamName,
          formation: formation,
          kit_color: kitColor,
          players: players
      });

      if (error) toast.error("저장 실패: " + error.message, { id: t });
      else { toast.success("전술이 저장되었습니다! 💾", { id: t }); setIsSaveModalOpen(false); setSaveName(''); }
  };

  const fetchSavedLineups = async () => {
      if (!currentUser) return;
      const { data, error } = await supabase.from('lineups').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false });
      if (!error && data) { setSavedLineups(data); setIsLoadModalOpen(true); }
  };

  const loadLineup = (lineup: any) => {
      const numPlayers = lineup.players.length;
      let loadedType: '11v11' | '6v6' | '5v5' = '11v11';
      if (numPlayers === 5) loadedType = '5v5';
      else if (numPlayers === 6) loadedType = '6v6';

      setMatchType(loadedType);
      setTeamName(lineup.team_name); 
      setFormation(lineup.formation); 
      setKitColor(lineup.kit_color); 
      setPlayers(lineup.players);
      setIsLoadModalOpen(false); 
      toast.success(`${lineup.save_name} 불러오기 완료! 🔄`);
  };

  const deleteLineup = async (id: number, e: React.MouseEvent) => {
      e.stopPropagation();
      if(!confirm("정말 삭제하시겠습니까?")) return;
      const { error } = await supabase.from('lineups').delete().eq('id', id);
      if(!error) { setSavedLineups(prev => prev.filter(l => l.id !== id)); toast.success("삭제되었습니다."); }
  };

  const fieldStyle = matchType === '11v11' 
    ? { backgroundColor: '#2d6a35', backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.4) 100%), repeating-linear-gradient(to bottom, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 25px, transparent 25px, transparent 50px)` }
    : { backgroundColor: '#1e3a8a', backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.5) 100%), linear-gradient(0deg, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`, backgroundSize: '40px 40px' };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white pb-24">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1e293b', color: '#fff' } }} />
      
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-white/5 p-4 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-white"><Icons.ArrowLeft /></button>
        <span className="font-black text-lg">LINEUP BUILDER ⚽</span>
        <button onClick={fetchSavedLineups} className="text-slate-400 hover:text-white transition"><Icons.Folder /></button>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-5">
        
        <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-white/10 shadow-sm">
            <button onClick={() => handleMatchTypeChange('11v11')} className={`flex-1 py-2.5 text-xs font-black rounded-xl transition ${matchType === '11v11' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>⚽ 11인조</button>
            <button onClick={() => handleMatchTypeChange('6v6')} className={`flex-1 py-2.5 text-xs font-black rounded-xl transition ${matchType === '6v6' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>🥅 6인조</button>
            <button onClick={() => handleMatchTypeChange('5v5')} className={`flex-1 py-2.5 text-xs font-black rounded-xl transition ${matchType === '5v5' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>🥅 5인조</button>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-white/10 space-y-4 shadow-sm">
          <div>
            <label className="text-xs font-bold text-slate-400 mb-2 block">팀 이름</label>
            <input type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} className="w-full bg-slate-800 text-white font-black text-center p-2 rounded-lg border border-white/10 focus:border-blue-500 outline-none transition" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 mb-2 block">포메이션 ({matchType === '11v11' ? '축구' : '풋살'})</label>
            <div className="flex flex-wrap gap-1">
              {Object.keys(FORMATIONS[matchType]).map(fmt => (
                <button key={fmt} onClick={() => handleFormationChange(fmt)} className={`flex-grow py-2 px-3 text-xs font-bold rounded-lg transition active:scale-95 ${formation === fmt ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                  {fmt}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400 mb-2 block">유니폼 컬러</label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {KIT_COLORS.map(color => (
                <button key={color.name} onClick={() => setKitColor(color)} className={`w-8 h-8 rounded-full border-2 shrink-0 transition active:scale-90 ${color.bg} ${kitColor.name === color.name ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`} />
              ))}
            </div>
          </div>
        </div>

        <div ref={fieldRef} className="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border-[3px] border-white/30" style={fieldStyle}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white/70 rounded-full pointer-events-none"></div>
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/70 -translate-y-1/2 pointer-events-none"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-transparent pointer-events-none"></div>
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 border-2 border-t-0 border-white/70 pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-24 border-2 border-b-0 border-white/70 pointer-events-none"></div>

          <div className="absolute top-6 left-0 w-full text-center z-10 pointer-events-none">
            <h2 className="text-3xl font-black text-white drop-shadow-lg italic tracking-tighter uppercase">{teamName}</h2>
            <p className="text-white/80 text-xs font-bold tracking-widest">{formation}</p>
          </div>

          {players.map((player, index) => {
            const isDragging = draggingId === player.id;
            const posInfo = getPositionInfo(player.position.top, player.position.left, matchType);

            return (
              <div 
                key={player.id}
                className={`absolute flex flex-col items-center justify-center cursor-grab active:cursor-grabbing ${isDragging ? 'scale-110 z-50' : 'z-20 transition-all duration-100'}`}
                style={{ 
                    top: player.position.top, left: player.position.left, transform: 'translate(-50%, -50%)', width: '70px', touchAction: 'none' 
                }} 
                onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    setDraggingId(player.id);
                    isDraggingRef.current = false;
                    dragStartPos.current = { x: e.clientX, y: e.clientY };
                    initialPlayerPos.current = { top: parseFloat(player.position.top), left: parseFloat(player.position.left) };
                }}
                onPointerMove={(e) => {
                    if (draggingId !== player.id) return;
                    
                    const dx = e.clientX - dragStartPos.current.x;
                    const dy = e.clientY - dragStartPos.current.y;
                    
                    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) isDraggingRef.current = true;

                    if (isDraggingRef.current && fieldRef.current) {
                        const rect = fieldRef.current.getBoundingClientRect();
                        const dxPercent = (dx / rect.width) * 100;
                        const dyPercent = (dy / rect.height) * 100;

                        let newLeft = initialPlayerPos.current.left + dxPercent;
                        let newTop = initialPlayerPos.current.top + dyPercent;

                        newLeft = Math.max(0, Math.min(100, newLeft));
                        newTop = Math.max(0, Math.min(100, newTop));

                        const step = 2.5; 
                        newLeft = Math.round(newLeft / step) * step;
                        newTop = Math.round(newTop / step) * step;

                        setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, position: { top: `${newTop}%`, left: `${newLeft}%` } } : p));
                    }
                }}
                onPointerUp={(e) => {
                    if (draggingId === player.id) {
                        e.currentTarget.releasePointerCapture(e.pointerId);
                        setDraggingId(null);
                        if (!isDraggingRef.current) handlePlayerClick(player);
                        isDraggingRef.current = false;
                    }
                }}
              >
                {/* 🚨 원형 아이콘에서 예쁜 유니폼 SVG로 교체 완료! */}
                <div className={`relative w-12 h-12 pointer-events-none flex flex-col items-center justify-center`}>
                   {/* 👕 유니폼 SVG */}
                   <svg 
                     xmlns="http://www.w3.org/2000/svg" 
                     viewBox="0 0 24 24" 
                     fill="currentColor" 
                     stroke="currentColor"
                     strokeWidth="1"
                     className={`absolute inset-0 w-full h-full drop-shadow-md z-10 transition-colors duration-200 ${index === 0 ? 'text-yellow-400 stroke-yellow-600' : `${kitColor.svgFill} ${kitColor.stroke}`}`}
                   >
                     <path d="M20.33 6.06l-4.22-1.76A2.92 2.92 0 0015 4H9a2.92 2.92 0 00-1.11.22L3.67 6.06a1 1 0 00-.5.81v3.25a1 1 0 001 1h1.83v8.38a1 1 0 001 1h10a1 1 0 001-1V11.12h1.83a1 1 0 001-1V6.87a1 1 0 00-.5-.81z" />
                   </svg>
                   
                   {/* 등번호 */}
                   <span className={`relative z-20 font-black text-sm mt-1 ${index === 0 ? 'text-black' : kitColor.text}`}>
                     {player.number}
                   </span>
                   
                   {/* 주장 마크, MOM, 골 표시 */}
                   {player.isCaptain && <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 border border-black rounded-full flex items-center justify-center text-[10px] font-black text-black shadow-md z-30">C</span>}
                   {player.isMOM && <span className="absolute -top-2 -left-2 text-lg drop-shadow-md animate-bounce z-30">⭐</span>}
                   {player.goals > 0 && (
                       <div className="absolute -bottom-1 -right-1 bg-white border border-black rounded-full flex items-center justify-center px-1.5 py-0.5 z-30 shadow-sm gap-0.5">
                           <span className="text-[10px] leading-none">⚽</span>
                           <span className="text-[10px] font-black text-black leading-none font-sans">{player.goals}</span>
                       </div>
                   )}
                </div>
                
                <div className="mt-1 px-1.5 py-0.5 bg-black/60 rounded-md backdrop-blur-sm border border-white/10 flex items-center justify-center gap-1 w-max min-w-[50px] pointer-events-none shadow-md whitespace-nowrap z-30">
                  <span className={`text-[8px] font-black px-1 rounded-sm ${posInfo.color}`}>{posInfo.label}</span>
                  <p className="text-[10px] font-bold text-white">{player.name}</p>
                </div>
              </div>
            );
          })}

          <div className="absolute bottom-4 right-4 opacity-50 pointer-events-none">
            <p className="text-[10px] font-black text-white italic">MOVEPLAZA</p>
          </div>
        </div>

        <div className="flex gap-2">
            <button onClick={() => setIsSaveModalOpen(true)} className="flex-1 py-4 bg-slate-800 text-slate-300 font-extrabold rounded-xl hover:bg-slate-700 transition flex items-center justify-center gap-2 border border-white/10">
                <Icons.Save /> 전술 저장
            </button>
            <button onClick={handleSaveImage} className="flex-[2] py-4 bg-blue-600 text-white font-extrabold rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:bg-blue-500 transition flex items-center justify-center gap-2">
                <Icons.Download /> 이미지 캡처
            </button>
        </div>
      </main>

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
                    <button onClick={() => updatePlayer('isCaptain', !editingPlayer.isCaptain)} className={`py-3 rounded-xl text-xs font-black border transition active:scale-95 ${editingPlayer.isCaptain ? 'bg-yellow-500 text-black border-yellow-400 shadow-md' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>© 주장 선임</button>
                    <button onClick={() => updatePlayer('isMOM', !editingPlayer.isMOM)} className={`py-3 rounded-xl text-xs font-black border transition active:scale-95 ${editingPlayer.isMOM ? 'bg-blue-600 text-white border-blue-400 shadow-md' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>⭐ MOM</button>
                </div>
                <div className="flex items-center bg-slate-800 rounded-xl border border-slate-700 px-4 py-3 justify-between">
                   <span className="text-sm text-slate-300 font-bold">⚽ 득점 기록</span>
                   <div className="flex items-center gap-3">
                       <button onClick={() => updatePlayer('goals', Math.max(0, editingPlayer.goals - 1))} className="w-8 h-8 bg-slate-700 rounded-lg text-white font-black hover:bg-slate-600 transition">-</button>
                       <span className="font-black text-lg w-6 text-center">{editingPlayer.goals}</span>
                       <button onClick={() => updatePlayer('goals', editingPlayer.goals + 1)} className="w-8 h-8 bg-slate-700 rounded-lg text-white font-black hover:bg-slate-600 transition">+</button>
                   </div>
                </div>
              </div>
            </div>
            <button onClick={() => setEditingPlayer(null)} className="mt-6 w-full py-4 bg-white text-slate-900 font-black rounded-xl hover:bg-slate-200 transition">완료</button>
          </div>
        </div>
      )}

      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setIsSaveModalOpen(false)}>
          <div className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsSaveModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><Icons.X /></button>
            <h3 className="font-black text-white text-lg mb-2">전술 저장하기 💾</h3>
            <p className="text-xs text-slate-400 font-bold mb-4">현재 세팅된 포메이션과 선수 배치를 그대로 저장합니다.</p>
            <input type="text" value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder="예: 주말 리그 선발, FC무브 1쿼터" className="w-full p-4 bg-slate-800 text-white font-bold rounded-xl border border-slate-700 outline-none focus:border-blue-500 mb-4" />
            <button onClick={handleSaveLineupDB} className="w-full py-4 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-500 transition">저장 완료</button>
          </div>
        </div>
      )}

      {isLoadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm sm:p-4 animate-fade-in" onClick={() => setIsLoadModalOpen(false)}>
          <div className="bg-slate-900 border border-white/10 w-full max-w-md h-[80vh] sm:h-auto sm:max-h-[80vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-white/10 flex justify-between items-center">
                <h3 className="font-black text-white text-lg">내 전술 보관함 📂</h3>
                <button onClick={() => setIsLoadModalOpen(false)} className="text-slate-400 hover:text-white"><Icons.X /></button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 custom-scrollbar space-y-3">
                {savedLineups.length === 0 ? (
                    <div className="text-center py-10"><p className="text-3xl mb-2">텅</p><p className="text-slate-500 font-bold text-sm">저장된 전술이 없습니다.</p></div>
                ) : (
                    savedLineups.map(lineup => (
                        <div key={lineup.id} onClick={() => loadLineup(lineup)} className="bg-slate-800 p-4 rounded-2xl border border-white/5 hover:border-blue-500 hover:bg-slate-800/80 transition cursor-pointer flex justify-between items-center group">
                            <div>
                                <h4 className="font-black text-white mb-1">{lineup.save_name}</h4>
                                <div className="flex gap-2 text-xs font-bold text-slate-400">
                                    <span className="bg-slate-950 px-2 py-0.5 rounded-md">{lineup.team_name}</span>
                                    <span className="bg-slate-950 px-2 py-0.5 rounded-md">{lineup.formation}</span>
                                </div>
                            </div>
                            <button onClick={(e) => deleteLineup(lineup.id, e)} className="p-2 text-slate-500 hover:text-red-500 transition opacity-0 group-hover:opacity-100 bg-slate-950 rounded-full"><Icons.Trash /></button>
                        </div>
                    ))
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}