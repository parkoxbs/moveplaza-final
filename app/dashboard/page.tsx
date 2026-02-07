'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabase';
import { useRouter } from 'next/navigation';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import toast from 'react-hot-toast';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import BodyMapSelector from '../components/BodyMapSelector';

type Log = { id: string; title?: string; content: string; created_at: string; pain_score: number; user_id: string; is_public: boolean; image_url?: string; log_type: 'workout' | 'rehab'; media_type: 'image' | 'video'; };
type Template = { id: number; name: string; title: string; content: string; parts: string[]; log_type: 'workout' | 'rehab'; };
type Goal = { id: number; title: string; target_date: string; };
type PartStat = { name: string; count: number; };

const getLevel = (count: number) => {
  if (count >= 50) return { name: 'World Class', rank: '월드 클래스', emoji: '👑', color: 'bg-purple-600 text-white', next: 1000 };
  if (count >= 30) return { name: 'Pro', rank: '프로', emoji: '🔥', color: 'bg-red-500 text-white', next: 50 };
  if (count >= 10) return { name: 'Semi-Pro', rank: '세미 프로', emoji: '🏃', color: 'bg-blue-500 text-white', next: 30 };
  return { name: 'Rookie', rank: '루키', emoji: '🐣', color: 'bg-green-500 text-white', next: 10 };
};

export default function Dashboard() {
  const router = useRouter();
  const [logs, setLogs] = useState<Log[]>([]);
  const reportRef = useRef<HTMLDivElement>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [shareData, setShareData] = useState<Log | null>(null);

  const [templates, setTemplates] = useState<Template[]>([]);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDate, setGoalDate] = useState('');
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [todayCondition, setTodayCondition] = useState<'good' | 'normal' | 'bad' | null>(null);

  const [logType, setLogType] = useState<'workout' | 'rehab'>('workout');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [score, setScore] = useState(5);
  const [isPublic, setIsPublic] = useState(false); // 공유 여부 상태
  const [agreed, setAgreed] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPart, setFilterPart] = useState('전체');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [partStats, setPartStats] = useState<PartStat[]>([]);
  const [avgScore, setAvgScore] = useState(0);
  const [totalWorkout, setTotalWorkout] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [advice, setAdvice] = useState('');
  
  const [streak, setStreak] = useState(0);
  const [myLevel, setMyLevel] = useState<any>(getLevel(0));

  useEffect(() => {
    if (logType === 'rehab') {
      if (score <= 3) setAdvice("✅ 상태 양호. 가동범위 유지 위주.");
      else if (score <= 6) setAdvice("⚠️ 통증 주의. 버티기 운동 추천.");
      else setAdvice("🚨 [위험] 즉시 중단. 병원 진료 권장.");
    } else {
      if (score <= 4) setAdvice("🔵 웜업 단계. 자세 집중.");
      else if (score <= 8) setAdvice("🟢 근성장 최적 구간! 🔥");
      else setAdvice("🟣 초고강도. 부상 조심.");
    }
  }, [score, logType]);

  const fetchLogs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }
    const { data, error } = await supabase.from('logs').select('*').order('created_at', { ascending: true });
    if (!error) {
      const formattedLogs = (data || []).map(l => ({ ...l, log_type: l.log_type || 'rehab', media_type: l.media_type || 'image' }));
      setLogs(formattedLogs); 
      analyzeData(formattedLogs);
      setMyLevel(getLevel(formattedLogs.length));
      calculateStreak(formattedLogs);
    }
    fetchTemplates(user.id); fetchGoal(user.id); fetchTodayCondition(user.id); setLoading(false);
  };

  const calculateStreak = (logs: Log[]) => {
    if (logs.length === 0) return setStreak(0);
    const dates = Array.from(new Set(logs.map(l => new Date(l.created_at).toDateString())));
    const sortedDates = dates.map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime());
    let currentStreak = 0;
    const today = new Date(); today.setHours(0,0,0,0);
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    if (sortedDates[0].getTime() === today.getTime() || sortedDates[0].getTime() === yesterday.getTime()) {
        currentStreak = 1;
        for (let i = 0; i < sortedDates.length - 1; i++) {
            const curr = sortedDates[i]; const prev = sortedDates[i+1];
            const diffTime = Math.abs(curr.getTime() - prev.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays === 1) currentStreak++; else break;
        }
    }
    setStreak(currentStreak);
  };

  const fetchTemplates = async (userId: string) => { const { data } = await supabase.from('templates').select('*').order('created_at', { ascending: true }); if (data) setTemplates(data); };
  const fetchGoal = async (userId: string) => { const { data } = await supabase.from('goals').select('*').eq('user_id', userId).single(); if (data) setGoal(data); };
  const fetchTodayCondition = async (userId: string) => { const today = new Date().toISOString().split('T')[0]; const { data } = await supabase.from('daily_conditions').select('*').eq('user_id', userId).gte('created_at', `${today}T00:00:00`).lte('created_at', `${today}T23:59:59`).order('created_at', { ascending: false }).limit(1); if (data && data.length > 0) setTodayCondition(data[0].status as any); };
  const handleConditionCheck = async (status: 'good' | 'normal' | 'bad') => { const { data: { user } } = await supabase.auth.getUser(); if (!user) return; await supabase.from('daily_conditions').insert({ user_id: user.id, status }); setTodayCondition(status); toast.success("컨디션 기록 완료!"); };
  const handleShare = async (log: Log) => { setShareData(log); const t = toast.loading("카드 생성 중..."); setTimeout(async () => { if (shareCardRef.current) { try { const dataUrl = await toPng(shareCardRef.current, { cacheBust: true, pixelRatio: 3 }); const link = document.createElement('a'); link.download = `Moveplaza_Share.png`; link.href = dataUrl; link.click(); toast.success("저장 완료!", { id: t }); } catch { toast.error("실패", { id: t }); } setShareData(null); } }, 500); };
  const handleSaveGoal = async () => { const { data: { user } } = await supabase.auth.getUser(); if (!user) return; await supabase.from('goals').upsert({ id: goal?.id, user_id: user.id, title: goalTitle, target_date: goalDate }); toast.success('목표 설정 완료!'); setIsEditingGoal(false); fetchGoal(user.id); };
  const handleDeleteGoal = async () => { if(goal) { await supabase.from('goals').delete().eq('id', goal.id); setGoal(null); setIsEditingGoal(false); toast.success('삭제됨'); }};
  const calculateDday = (targetDate: string) => { const today = new Date(); today.setHours(0,0,0,0); const target = new Date(targetDate); target.setHours(0,0,0,0); const diffDays = Math.ceil((target.getTime() - today.getTime())/(1000*60*60*24)); return diffDays === 0 ? "D-Day 🎉" : diffDays < 0 ? `D+${Math.abs(diffDays)}` : `D-${diffDays}`; };
  const handleSaveTemplate = async () => { const name = prompt("루틴 이름"); if(!name) return; const { data: { user } } = await supabase.auth.getUser(); if(!user) return; await supabase.from('templates').insert({ user_id: user.id, name, title, content, parts: selectedParts, log_type: logType }); toast.success("저장 완료!"); fetchTemplates(user.id); };
  const handleLoadTemplate = (t: Template) => { if(!confirm(`'${t.name}' 불러올까요?`)) return; setTitle(t.title || ''); setContent(t.content || ''); setSelectedParts(t.parts || []); setLogType(t.log_type || 'workout'); toast.success("적용 완료!"); };
  const handleDeleteTemplate = async (id: number, e: React.MouseEvent) => { e.stopPropagation(); if(!confirm("삭제?")) return; await supabase.from('templates').delete().eq('id', id); const { data: { user } } = await supabase.auth.getUser(); if(user) fetchTemplates(user.id); };
  const analyzeData = (data: Log[]) => { if (data.length === 0) return; const totalScore = data.reduce((sum, log) => sum + log.pain_score, 0); setAvgScore(Number((totalScore / data.length).toFixed(1))); setTotalWorkout(data.filter(l => l.log_type === 'workout').length); const stats: { [key: string]: number } = {}; data.forEach(log => { const match = log.content.match(/^\[(.*?)\]/); if (match) match[1].split(', ').forEach(p => stats[p] = (stats[p] || 0) + 1); }); setPartStats(Object.keys(stats).map(k => ({ name: k, count: stats[k] })).sort((a, b) => b.count - a.count).slice(0, 5)); };
  useEffect(() => { fetchLogs(); }, [router]);
  const handleDownloadPDF = async () => { if (!reportRef.current) return; const t = toast.loading("PDF 생성 중..."); try { const dataUrl = await toPng(reportRef.current, { cacheBust: true, pixelRatio: 2 }); const pdf = new jsPDF('p', 'mm', 'a4'); const imgProps = pdf.getImageProperties(dataUrl); const pdfHeight = (imgProps.height * pdf.internal.pageSize.getWidth()) / imgProps.width; pdf.addImage(dataUrl, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdfHeight); pdf.save(`Moveplaza_Report.pdf`); toast.success("완료!", { id: t }); } catch { toast.error("실패", { id: t }); } };
  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/login'); };
  const formatDate = (d: string) => { const date = new Date(d); return `${date.getMonth() + 1}/${date.getDate()}`; };
  const hasLogOnDate = (d: Date) => logs.some(l => new Date(l.created_at).toDateString() === d.toDateString());
  const togglePart = (part: string) => { if (selectedParts.includes(part)) setSelectedParts(selectedParts.filter(p => p !== part)); else setSelectedParts([...selectedParts, part]); };
  const handleDeleteLog = async (id: string) => { if (!confirm('정말 삭제하시겠습니까? 🗑️')) return; const { error } = await supabase.from('logs').delete().eq('id', id); if (error) { toast.error('삭제 실패 ㅠ'); } else { toast.success('기록 삭제 완료!'); const newLogs = logs.filter(l => l.id !== id); setLogs(newLogs); analyzeData(newLogs); setMyLevel(getLevel(newLogs.length)); } };
  
  const handleAddLog = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    if (!title.trim()) { toast('제목 입력!'); return; } 
    if (!agreed) { toast.error('동의 필요!'); return; } 
    const { data: { user } } = await supabase.auth.getUser(); 
    if (!user) return; 
    setUploading(true); 
    const t = toast.loading('저장 중...'); 
    try { 
        let mediaUrl = null; 
        let mediaType = 'image'; 
        if (mediaFile) { 
            mediaType = mediaFile.type.startsWith('video/') ? 'video' : 'image'; 
            const fileExt = mediaFile.name.split('.').pop(); 
            const filePath = `${user.id}/${Date.now()}.${fileExt}`; 
            await supabase.storage.from('images').upload(filePath, mediaFile); 
            const { data } = supabase.storage.from('images').getPublicUrl(filePath); 
            mediaUrl = data.publicUrl; 
        } 
        const partsString = selectedParts.length > 0 ? `[${selectedParts.join(', ')}] ` : ''; 
        // ✅ isPublic 상태가 여기서 DB로 전송됩니다.
        await supabase.from('logs').insert([{ title, content: partsString + content, pain_score: score, user_id: user.id, is_public: isPublic, image_url: mediaUrl, log_type: logType, media_type: mediaType }]); 
        toast.success('저장 완료!', { id: t }); 
        setTitle(''); setContent(''); setSelectedParts([]); setScore(5); setIsPublic(false); setMediaFile(null); setAgreed(false); fetchLogs(); 
    } catch (e: any) { 
        toast.error(e.message, { id: t }); 
    } finally { 
        setUploading(false); 
    } 
  };
  
  const filteredLogs = logs.filter(l => (selectedDate ? new Date(l.created_at).toDateString() === selectedDate.toDateString() : true) && (filterPart === '전체' || l.content.includes(filterPart)) && ((l.title && l.title.includes(searchTerm)) || l.content.includes(searchTerm)));

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-xl font-bold animate-pulse text-blue-600">로딩 중...</p></div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {shareData && ( <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-[-1] opacity-0 pointer-events-none"> <div ref={shareCardRef} className="w-[500px] h-[500px] bg-gradient-to-br from-slate-900 to-slate-800 p-8 flex flex-col justify-between text-white relative overflow-hidden font-sans"> <div className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] bg-blue-600 rounded-full blur-[90px] opacity-60"></div> <div className="absolute bottom-[-50px] left-[-50px] w-[200px] h-[200px] bg-red-600 rounded-full blur-[90px] opacity-50"></div> <div className="z-10"> <div className="flex justify-between items-start mb-4"> <span className={`px-4 py-1.5 rounded-full text-sm font-black tracking-wide ${shareData.log_type === 'workout' ? 'bg-blue-600' : 'bg-red-600'}`}>{shareData.log_type === 'workout' ? 'WORKOUT LOG' : 'REHAB LOG'}</span> <p className="text-slate-400 font-bold text-sm">{new Date(shareData.created_at).toLocaleDateString()}</p> </div> <h1 className="text-4xl font-black leading-tight mb-4 tracking-tight">{shareData.title || "오늘의 기록"}</h1> <p className="text-slate-300 text-lg font-medium leading-relaxed line-clamp-4">{shareData.content}</p> </div> <div className="z-10 border-t border-white/10 pt-6 flex justify-between items-end"> <div> <p className="text-slate-500 text-xs font-black tracking-widest mb-1">INTENSITY</p> <p className="text-5xl font-black text-white">{shareData.pain_score}<span className="text-xl text-slate-500 ml-1">/ 10</span></p> </div> <div className="text-right"> <p className="font-black text-2xl italic tracking-tighter text-white">MOVEPLAZA</p> <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Athlete Performance System</p> </div> </div> </div> </div> )}

      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center text-white font-black text-lg">M</div>
            <span className="text-xl font-black tracking-tight text-slate-900">MOVEPLAZA</span>
          </div>
          <nav className="flex items-center gap-2 md:gap-4">
            <button onClick={() => router.push('/community')} className="text-sm font-bold text-slate-600 hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-slate-100 transition">광장</button>
            <button onClick={() => router.push('/mypage')} className="text-sm font-bold text-slate-600 hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-slate-100 transition">내 정보</button>
            <div className="h-4 w-px bg-slate-300 mx-1"></div>
            <button onClick={handleLogout} className="text-sm font-bold text-slate-400 hover:text-red-500 transition">로그아웃</button>
          </nav>
        </div>
      </header>

      <main className="pt-24 pb-20 px-4 md:px-8 max-w-6xl mx-auto space-y-8 animate-slide-up">
        
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-2 bg-white rounded-3xl p-6 shadow-lg border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-extrabold text-slate-900 mb-1">오늘 컨디션 체크 👋</h2>
                    <p className="text-slate-500 font-bold text-xs">매일 아침 부상 방지를 위해!</p>
                </div>
                <div className="flex gap-3">
                    {['good', 'normal', 'bad'].map((status) => (
                    <button key={status} onClick={() => handleConditionCheck(status as any)} className={`flex flex-col items-center gap-1 w-14 py-2 rounded-xl transition-all duration-200 border-2 ${todayCondition === status ? (status === 'good' ? 'bg-green-50 border-green-400 scale-110 shadow-md' : status === 'normal' ? 'bg-yellow-50 border-yellow-400 scale-110 shadow-md' : 'bg-red-50 border-red-400 scale-110 shadow-md') : 'bg-white border-slate-100 hover:border-slate-300'}`}>
                        <span className="text-xl">{status === 'good' ? '😆' : status === 'normal' ? '🙂' : '😷'}</span>
                    </button>
                    ))}
                </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl p-6 shadow-lg text-white flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400 rounded-full blur-[50px] opacity-40"></div>
                <div className="relative z-10 text-center">
                    <p className="text-orange-100 font-bold text-xs uppercase tracking-wider mb-1">Current Streak</p>
                    <div className="flex items-center gap-2 justify-center">
                        <span className="text-5xl font-black">{streak}</span>
                        <span className="text-3xl">🔥</span>
                    </div>
                    <p className="text-white font-bold text-sm mt-1">일 연속 달성 중!</p>
                </div>
            </div>
        </section>

        <div className={`rounded-3xl p-6 shadow-lg border-2 border-white flex items-center justify-between relative overflow-hidden ${myLevel.color}`}>
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2"><span className="text-3xl">{myLevel.emoji}</span><span className="font-black text-2xl uppercase italic tracking-wider">{myLevel.name}</span></div>
                <p className="font-bold text-white/90 text-sm mb-4">현재 등급: {myLevel.rank}</p>
                <div className="w-full bg-black/20 rounded-full h-2 mb-1 overflow-hidden"><div className="bg-white h-full rounded-full" style={{ width: `${Math.min((logs.length / myLevel.next) * 100, 100)}%` }}></div></div>
                <p className="text-xs font-bold text-white/80">{logs.length} / {myLevel.next} (다음 등급까지 {myLevel.next - logs.length}개)</p>
            </div>
            <div className="text-6xl opacity-20 rotate-12 absolute right-4 bottom-[-10px]">🏆</div>
        </div>

        <div ref={reportRef} className="space-y-8">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-3xl shadow-xl text-white flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
               <div className="relative z-10 flex-1 text-center md:text-left w-full">
                 {goal && !isEditingGoal ? ( <> <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-blue-200 mb-3 border border-white/10">CURRENT GOAL</div> <h2 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">{goal.title}</h2> <p className="text-slate-400 font-bold text-lg">{goal.target_date} 까지</p> </> ) : ( <div className="flex flex-col gap-3 w-full"> <p className="text-xl font-bold text-white mb-2">🏆 새로운 목표 설정</p> <input type="text" placeholder="목표 (예: 3대 500)" value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white font-bold placeholder-white/30 focus:outline-none focus:bg-white/20 backdrop-blur-sm" /> <input type="date" value={goalDate} onChange={(e) => setGoalDate(e.target.value)} className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white font-bold focus:outline-none focus:bg-white/20 backdrop-blur-sm" /> </div> )}
               </div>
               <div className="relative z-10 flex flex-col items-center"> {goal && !isEditingGoal ? ( <> <div className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-blue-300 to-blue-600 drop-shadow-lg mb-4">{calculateDday(goal.target_date)}</div> <div className="flex gap-2"> <button onClick={() => { setIsEditingGoal(true); setGoalTitle(goal.title); setGoalDate(goal.target_date); }} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-bold backdrop-blur-sm transition">수정</button> <button onClick={handleDeleteGoal} className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-300 text-sm font-bold backdrop-blur-sm transition">삭제</button> </div> </> ) : ( <button onClick={handleSaveGoal} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-black text-lg shadow-lg shadow-blue-900/50 transition transform hover:scale-105 w-full md:w-auto mt-4 md:mt-0">{goal ? '수정 완료' : '목표 등록하기'}</button> )} </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition"> <p className="text-slate-400 font-extrabold text-xs tracking-wider uppercase">Total Workouts</p> <p className="text-4xl font-black text-slate-900 mt-2">{totalWorkout}<span className="text-lg text-slate-400 ml-1">회</span></p> </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition"> <p className="text-slate-400 font-extrabold text-xs tracking-wider uppercase">Avg. Intensity</p> <p className="text-4xl font-black text-slate-900 mt-2">{avgScore}<span className="text-lg text-slate-400 ml-1">점</span></p> </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition"> <p className="text-slate-400 font-extrabold text-xs tracking-wider uppercase">Most Trained</p> <p className="text-2xl font-black text-slate-900 mt-3 truncate">{partStats.length > 0 ? partStats[0].name : '-'}</p> </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100"> <div className="flex justify-between items-center mb-4"><h3 className="font-extrabold text-slate-900">캘린더</h3>{selectedDate && <button onClick={() => setSelectedDate(null)} className="text-xs bg-slate-100 px-2 py-1 rounded font-bold">전체보기</button>}</div> <style jsx global>{` .react-calendar { border: none; font-family: sans-serif; width: 100%; } .react-calendar__tile--active { background: #0f172a !important; color: white !important; border-radius: 12px; } .react-calendar__tile--now { background: #fef9c3 !important; color: black !important; border-radius: 12px; font-weight: bold; } `}</style> <Calendar onClickDay={setSelectedDate} value={selectedDate} tileContent={({ date }) => hasLogOnDate(date) ? <div className="flex justify-center mt-1"><div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div></div> : null} /> </div>
               <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 lg:col-span-2"> <h3 className="font-extrabold text-slate-900 mb-4">최근 강도 변화</h3> <div className="h-64"><ResponsiveContainer width="100%" height="100%"><LineChart data={logs}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" /><XAxis dataKey="created_at" tickFormatter={formatDate} tick={{fontSize:12, fontWeight:'bold'}} axisLine={false} tickLine={false} /><YAxis domain={[0,10]} tick={{fontSize:12, fontWeight:'bold'}} axisLine={false} tickLine={false} /><Tooltip contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 10px 15px -3px rgb(0 0 0 / 0.1)'}} /><Line type="monotone" dataKey="pain_score" stroke="#2563eb" strokeWidth={3} dot={{r:4, fill:'#2563eb'}} activeDot={{r:6}} /></LineChart></ResponsiveContainer></div> </div>
            </div>

            <div className="pt-4">
              <div className="flex items-center justify-between mb-4"> <h2 className="text-2xl font-extrabold text-slate-900">최근 기록</h2> <button onClick={handleDownloadPDF} className="text-sm font-bold text-slate-500 hover:text-blue-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm transition">📄 PDF 리포트</button> </div>
              <div className="space-y-4">
               {filteredLogs.slice().reverse().slice(0, 5).map((log) => ( 
                <div key={log.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col gap-3 group"> 
                  <div className="flex justify-between items-start"> 
                    <div className="flex items-center gap-3"> 
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-wide uppercase ${log.log_type === 'workout' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>{log.log_type === 'workout' ? 'WORKOUT' : 'REHAB'}</span> 
                        <span className="text-sm text-slate-400 font-bold">{new Date(log.created_at).toLocaleString()}</span> 
                    </div> 
                    <div className="flex items-center gap-2"> 
                        <button onClick={() => handleShare(log)} className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs bg-slate-100 hover:bg-pink-50 hover:text-pink-600 text-slate-600 font-bold px-3 py-1.5 rounded-lg transition" title="인스타 공유">📸 공유</button> 
                        <button onClick={() => handleDeleteLog(log.id)} className="opacity-0 group-hover:opacity-100 text-xs bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 font-bold px-3 py-1.5 rounded-lg transition" title="삭제">🗑️ 삭제</button>
                        <span className={`font-black text-xl ml-2 ${log.pain_score > 7 ? 'text-red-500' : 'text-slate-900'}`}>{log.pain_score}</span> 
                    </div> 
                  </div> 
                  <div> 
                    {/* ✅ [수정됨] 제목 글자 밀림 방지 */}
                    <h3 className="font-bold text-lg text-slate-900 break-all">{log.title || '제목 없음'}</h3> 
                    {/* ✅ [수정됨] 본문 글자 밀림 방지 및 줄바꿈 허용 */}
                    <p className="text-slate-600 mt-1 line-clamp-2 break-all whitespace-pre-wrap">{log.content}</p> 
                  </div> 
                </div> 
               ))}
              </div>
            </div>
        </div>

        <section className={`bg-white p-6 md:p-8 rounded-3xl shadow-xl border-2 transition-colors ${logType === 'workout' ? 'border-blue-100' : 'border-red-100'}`}>
           <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200"> <div className="flex justify-between items-center mb-3"><h3 className="text-sm font-extrabold text-gray-600">⚡ 내 루틴</h3><button onClick={handleSaveTemplate} className="text-xs bg-black text-white px-3 py-1.5 rounded-lg font-bold hover:bg-gray-800 transition shadow-sm">+ 현재 저장</button></div> {templates.length > 0 ? (<div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">{templates.map(tpl => (<div key={tpl.id} className="flex items-center gap-1 bg-white border border-gray-300 rounded-lg px-2 py-1 shadow-sm shrink-0"><button onClick={() => handleLoadTemplate(tpl)} className="font-bold text-sm text-gray-700 hover:text-blue-600 px-1">{tpl.name}</button><button onClick={(e) => handleDeleteTemplate(tpl.id, e)} className="text-gray-400 hover:text-red-500 text-xs px-1">×</button></div>))}</div>) : (<p className="text-xs text-gray-400 font-bold">저장된 루틴이 없어요.</p>)} </div>
           <div className="flex gap-2 mb-6 bg-slate-100 p-1.5 rounded-xl w-fit"> <button onClick={() => setLogType('workout')} className={`px-6 py-2 rounded-lg font-extrabold text-sm transition ${logType === 'workout' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>💪 운동</button> <button onClick={() => setLogType('rehab')} className={`px-6 py-2 rounded-lg font-extrabold text-sm transition ${logType === 'rehab' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>🏥 재활</button> </div>
          <form onSubmit={handleAddLog} className="space-y-6"> 
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full text-2xl font-black placeholder:text-slate-300 border-none focus:ring-0 p-0 text-slate-900" placeholder="제목을 입력하세요..." />
            
            <BodyMapSelector selectedParts={selectedParts} togglePart={togglePart} logType={logType} />

            <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full h-32 p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-100 resize-none font-medium text-slate-700" placeholder="오늘의 훈련 내용은..." /> 
            
            <div className="flex items-center gap-4"> <label className="flex-shrink-0 font-extrabold text-slate-900">{logType === 'workout' ? '강도' : '통증'} {score}</label> <input type="range" min="0" max="10" value={score} onChange={(e) => setScore(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900" /> </div> 
            
            <div className={`p-4 rounded-xl border text-center text-sm font-bold transition-colors ${score <= 3 ? 'bg-green-50 border-green-100 text-green-700' : score <= 6 ? 'bg-yellow-50 border-yellow-100 text-yellow-700' : 'bg-red-50 border-red-100 text-red-700'}`}> <p className="mb-1">🤖 AI Coach: {advice}</p> {logType === 'rehab' && score > 6 && <a href="https://map.naver.com/p/search/정형외과" target="_blank" className="inline-block mt-2 bg-red-600 text-white px-3 py-1 rounded-md text-xs hover:bg-red-700">🏥 병원 찾기</a>} </div> 
            
            {/* ✅ [수정됨] 광장 공유하기 체크박스 부활! */}
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
               <input type="checkbox" id="public-share" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" />
               <label htmlFor="public-share" className="text-sm font-bold text-blue-800 cursor-pointer select-none">
                 광장에 기록 공유하기 <span className="text-xs font-normal text-blue-600 ml-1">(다른 유저와 소통할 수 있어요)</span>
               </label>
            </div>

            <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-xl"> <input type="checkbox" id="agree" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" /> <label htmlFor="agree" className="text-xs text-slate-500 font-bold cursor-pointer select-none">본 앱은 의료기기가 아님을 확인하며, 면책 조항에 동의합니다.</label> </div> 
            
            <button type="submit" disabled={uploading} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold text-lg shadow-xl transition disabled:opacity-50">{uploading ? '저장 중...' : '기록 저장하기 ✨'}</button> 
          </form>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 mt-12"> <div className="max-w-6xl mx-auto px-4 text-center"> <p className="font-black text-slate-900 tracking-tight text-lg mb-2">MOVEPLAZA</p> <p className="text-slate-500 text-sm font-medium">Physical Therapy & Athlete Performance System</p> <p className="text-slate-400 text-xs mt-4">Copyright © 2026. All rights reserved.</p> </div> </footer>
    </div>
  );  
}