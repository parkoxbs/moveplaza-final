"use client"

import { useEffect, useState, useRef } from "react"
import { createClient } from "@supabase/supabase-js"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast, { Toaster } from 'react-hot-toast'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { toPng } from 'html-to-image'
import jsPDF from 'jspdf'
import BodyMap from "..//components/BodyMap" 

// 👇 1. Supabase 주소와 키 입력 (본인 걸로!)
const supabaseUrl = "https://okckpesbufkqhmzcjiab.supabase.co"
const supabaseKey = "sb_publishable_G_y2dTmNj9nGIvu750MlKQ_jjjgxu-t"

const supabase = createClient(supabaseUrl, supabaseKey)

// 아이콘
const Icons = {
  Activity: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  AlertCircle: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>,
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 5v14M5 12h14"/></svg>,
  X: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M18 6 6 18M6 6l12 12"/></svg>,
  Share: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Camera: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>,
  Download: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>,
  Chart: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>,
  Info: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>
}

const getLevel = (count: number) => {
  if (count >= 50) return { name: 'World Class', rank: '월드 클래스', emoji: '👑', color: 'bg-purple-600 text-white', next: 1000 };
  if (count >= 30) return { name: 'Pro', rank: '프로', emoji: '🔥', color: 'bg-red-500 text-white', next: 50 };
  if (count >= 10) return { name: 'Semi-Pro', rank: '세미 프로', emoji: '🏃', color: 'bg-blue-500 text-white', next: 30 };
  return { name: 'Rookie', rank: '루키', emoji: '🐣', color: 'bg-green-500 text-white', next: 10 };
};

export default function Dashboard() {
  const router = useRouter()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState("")
  
  const reportRef = useRef<HTMLDivElement>(null)
  const shareCardRef = useRef<HTMLDivElement>(null)
  const [shareData, setShareData] = useState<any>(null)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [isResultOpen, setIsResultOpen] = useState(false)
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false)
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false) // 🆕 면책 조항 모달 상태

  const [streak, setStreak] = useState(0)
  const [myLevel, setMyLevel] = useState<any>(getLevel(0))
  const [todayCondition, setTodayCondition] = useState<'good' | 'normal' | 'bad' | null>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [logType, setLogType] = useState<'workout' | 'rehab'>('workout')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [score, setScore] = useState(5)
  const [selectedParts, setSelectedParts] = useState<string[]>([])
  const [isPublic, setIsPublic] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)

  const bodyParts = ["목", "승모근", "어깨", "가슴", "등", "복근", "허리", "삼두", "이두", "전완근", "손목", "손", "엉덩이", "고관절", "허벅지(앞)", "허벅지(뒤)", "무릎", "종아리", "발목", "발"]

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single()
    setUserName(profile?.username || user.email?.split("@")[0] || "선수")
    const { data } = await supabase.from('logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    if (data) { 
        setLogs(data); 
        setMyLevel(getLevel(data.length)); 
        calculateStreak(data); 
        analyzeLogs(data); 
    }
    const today = new Date().toISOString().split('T')[0]
    const { data: conditionData } = await supabase.from('daily_conditions').select('*').eq('user_id', user.id).gte('created_at', `${today}T00:00:00`).limit(1)
    if (conditionData && conditionData.length > 0) setTodayCondition(conditionData[0].status)
    setLoading(false)
  }

  const analyzeLogs = (data: any[]) => {
    if (data.length === 0) return;
    const partCounts: {[key: string]: number} = {};
    let totalPain = 0;
    let painLogCount = 0;
    data.forEach(log => {
        if (log.pain_score > 0) {
            totalPain += log.pain_score;
            painLogCount++;
            const match = log.content?.match(/^\[(.*?)\]/);
            if (match) match[1].split(', ').forEach((p: string) => { partCounts[p] = (partCounts[p] || 0) + 1; });
        }
    });
    const sortedParts = Object.entries(partCounts).sort((a, b) => b[1] - a[1]);
    const worstPart = sortedParts.length > 0 ? sortedParts[0][0] : '없음';
    const avgPain = painLogCount > 0 ? (totalPain / painLogCount).toFixed(1) : '0';

    let advice = "꾸준한 운동이 답입니다! 💪";
    if (Number(avgPain) > 7) advice = "🚨 통증 점수가 높습니다. 충분한 휴식을 취하거나 전문가 상담을 권장합니다.";
    else if (worstPart.includes("무릎")) advice = "🦵 무릎 부하가 많네요. 대퇴사두근과 햄스트링 보강 운동이 도움될 수 있습니다.";
    else if (worstPart.includes("허리")) advice = "🧘 허리가 불편하시군요. 코어 운동과 스트레칭을 루틴에 추가해보세요.";
    else if (worstPart.includes("발목")) advice = "🦶 발목 안정성을 위해 밸런스 운동을 워밍업에 넣어보는 건 어떨까요?";
    else if (worstPart.includes("어깨")) advice = "🙆‍♂️ 어깨 회전근개 강화와 흉추 가동성 운동을 추천합니다.";

    setAnalysisData({ worstPart, avgPain, advice, totalLogs: data.length });
  };

  const calculateStreak = (logs: any[]) => {
    if (logs.length === 0) return setStreak(0);
    const dates = Array.from(new Set(logs.map(l => new Date(l.created_at).toDateString())));
    const sortedDates = dates.map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime());
    let currentStreak = 0;
    const today = new Date(); today.setHours(0,0,0,0);
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    if (sortedDates.length > 0 && (sortedDates[0].getTime() === today.getTime() || sortedDates[0].getTime() === yesterday.getTime())) {
        currentStreak = 1;
        for (let i = 0; i < sortedDates.length - 1; i++) {
            const curr = sortedDates[i]; const prev = sortedDates[i+1];
            const diffDays = Math.ceil(Math.abs(curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) currentStreak++; else break;
        }
    }
    setStreak(currentStreak);
  };

  const handleConditionCheck = async (status: 'good' | 'normal' | 'bad') => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('daily_conditions').insert({ user_id: user.id, status })
    setTodayCondition(status)
    toast.success("컨디션 기록 완료!")
  }

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return
    const t = toast.loading("리포트 생성 중...")
    setTimeout(async () => {
      try {
        if(!reportRef.current) return;
        const element = reportRef.current
        const width = element.scrollWidth
        const height = element.scrollHeight
        const dataUrl = await toPng(element, { cacheBust: true, pixelRatio: 2, backgroundColor: '#0f172a', width: width, height: height, style: { padding: '20px', background: '#0f172a' } })
        const pdf = new jsPDF('p', 'mm', 'a4')
        const imgProps = pdf.getImageProperties(dataUrl)
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight)
        const pdfBlob = pdf.output('blob');
        const file = new File([pdfBlob], `Moveplaza_Report.pdf`, { type: 'application/pdf' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Moveplaza 리포트' }); toast.dismiss(t); } 
        else { pdf.save(`${userName}_Moveplaza_Report.pdf`); toast.success("다운로드 완료!", { id: t }) }
      } catch (e) { console.error(e); toast.error("저장이 차단되었습니다. 캡처를 이용해주세요.", { id: t, duration: 5000 }) }
    }, 1000);
  }

  const handleAddLog = async () => {
    if (!title.trim()) return toast.error("제목을 입력해주세요!")
    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      try {
        let mediaUrl = null; let mediaType = 'image';
        if (mediaFile) {
           const fileExt = mediaFile.name.split('.').pop();
           const filePath = `${user.id}/${Date.now()}.${fileExt}`;
           const { error: uploadError } = await supabase.storage.from('images').upload(filePath, mediaFile);
           if (uploadError) throw uploadError;
           const { data } = supabase.storage.from('images').getPublicUrl(filePath);
           mediaUrl = data.publicUrl;
           mediaType = mediaFile.type.startsWith('video') ? 'video' : 'image';
        }
        const partsString = selectedParts.length > 0 ? `[${selectedParts.join(', ')}] ` : ''
        const { error } = await supabase.from('logs').insert({ user_id: user.id, title, content: partsString + content, pain_score: score, log_type: logType, is_public: isPublic, image_url: mediaUrl, media_type: mediaType, created_at: new Date().toISOString() })
        if (error) throw error;
        toast.success("기록 저장 완료! 🎉"); setIsModalOpen(false); setTitle(''); setContent(''); setScore(5); setSelectedParts([]); setMediaFile(null); setMediaPreview(null); fetchData()
      } catch (e: any) { toast.error("저장 실패: " + e.message) }
    }
    setUploading(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]; setMediaFile(file); setMediaPreview(URL.createObjectURL(file))
    }
  }

  const handleDeleteLog = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    const { error } = await supabase.from('logs').delete().eq('id', id)
    if (!error) { toast.success('삭제 완료!'); setLogs(logs.filter(l => l.id !== id)) }
  }

  const togglePart = (part: string) => {
    if (selectedParts.includes(part)) setSelectedParts(selectedParts.filter(p => p !== part))
    else setSelectedParts([...selectedParts, part])
  }

  const handleShareClick = async (log: any) => {
    setShareData(log)
    const t = toast.loading("카드 만드는 중... 🎨")
    setTimeout(async () => {
      if (shareCardRef.current) {
        try {
          const dataUrl = await toPng(shareCardRef.current, { cacheBust: true, pixelRatio: 3, backgroundColor: '#0f172a' })
          setResultImage(dataUrl); setIsResultOpen(true); toast.dismiss(t)
        } catch (error) { console.error(error); toast.error("실패 ㅠ 다시 시도해주세요.", { id: t }); }
        setShareData(null);
      }
    }, 1000);
  }

  const handleSaveResultImage = async (dataUrl: string) => {
    const t = toast.loading("저장/공유 창 여는 중...")
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "moveplaza_card.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Moveplaza 공유 카드', text: '나의 운동 기록 카드입니다!', }); toast.dismiss(t); } 
      else { const link = document.createElement('a'); link.download = 'moveplaza_card.png'; link.href = dataUrl; link.click(); toast.success("PC: 다운로드됨", { id: t }); }
    } catch (error: any) { if (error.name !== 'AbortError') { console.error(error); toast.error("저장이 차단되었습니다 ㅠ", { id: t }); } else { toast.dismiss(t); } }
  }

  const rehabLogs = logs.filter((log: any) => { if (log.type === 'workout') return false; if (log.intensity) return false; return true; })
  const bodyPartCounts = rehabLogs.reduce((acc: any, log: any) => { if (log.body_part) acc[log.body_part] = (acc[log.body_part] || 0) + 1; const match = log.content?.match(/^\[(.*?)\]/); if (match) match[1].split(', ').forEach((p: string) => acc[p] = (acc[p] || 0) + 1); return acc; }, {} as any)
  const getSeverityColor = (count: number) => { if (count >= 5) return "bg-red-500/80 text-white border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]"; if (count >= 3) return "bg-orange-500/80 text-white border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]"; if (count >= 1) return "bg-yellow-500/80 text-white border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]"; return "bg-slate-800 text-slate-400 border-slate-700"; }
  const filteredLogs = selectedDate ? logs.filter(l => new Date(l.created_at).toDateString() === selectedDate.toDateString()) : logs

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white pb-32 selection:bg-blue-500 selection:text-white">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1e293b', color: '#fff' } }} />
      {shareData && (<div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-[-1] opacity-0 pointer-events-none"><div ref={shareCardRef} className="w-[500px] h-[500px] bg-slate-900 p-8 flex flex-col justify-between text-white relative overflow-hidden font-sans">{shareData.image_url ? (<><img src={shareData.image_url} className="absolute inset-0 w-full h-full object-cover z-0" crossOrigin="anonymous" alt="배경" /><div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30 z-0"></div></>) : (<><div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 z-0"></div><div className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] bg-blue-600 rounded-full blur-[90px] opacity-60 z-0"></div><div className="absolute bottom-[-50px] left-[-50px] w-[200px] h-[200px] bg-red-600 rounded-full blur-[90px] opacity-50 z-0"></div></>)}<div className="z-10 relative"><div className="flex justify-between items-start mb-4"><span className={`px-4 py-1.5 rounded-full text-sm font-black tracking-wide ${shareData.log_type === 'workout' ? 'bg-blue-600' : 'bg-red-600'}`}>{shareData.log_type === 'workout' ? 'WORKOUT LOG' : 'REHAB LOG'}</span><p className="text-white/80 font-bold text-sm">{new Date(shareData.created_at).toLocaleDateString()}</p></div><h1 className="text-4xl font-black leading-tight mb-4 tracking-tight drop-shadow-lg">{shareData.title}</h1><p className="text-white/90 text-lg font-medium leading-relaxed line-clamp-4 drop-shadow-md">{shareData.content}</p></div><div className="z-10 relative border-t border-white/20 pt-6 flex justify-between items-end"><div><p className="text-white/70 text-xs font-black tracking-widest mb-1">INTENSITY</p><p className="text-5xl font-black text-white drop-shadow-lg">{shareData.pain_score}<span className="text-xl text-white/60 ml-1">/ 10</span></p></div><div className="text-right"><p className="font-black text-2xl italic tracking-tighter text-white drop-shadow-lg">MOVEPLAZA</p><p className="text-[10px] text-white/70 font-bold tracking-widest uppercase">Athlete Performance System</p></div></div></div></div>)}

      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/5 transition-all">
        <div className="max-w-md mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}><div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-[0_0_15px_rgba(37,99,235,0.5)]">M</div><span className="text-xl font-black tracking-tight text-white">MOVEPLAZA</span></div>
          <div className="flex items-center gap-4 text-sm font-bold text-slate-400"><Link href="/community" className="hover:text-blue-400 transition">광장</Link><Link href="/mypage" className="hover:text-blue-400 transition">내 정보</Link></div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-5 pt-8 space-y-8 animate-slide-up bg-slate-950" ref={reportRef}>
        <section>
            <div className="flex justify-between items-end">
                <div><h2 className="text-3xl font-extrabold text-white leading-tight">안녕하세요,<br/><span className="text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">{userName}</span>님!</h2><p className="text-slate-400 font-bold mt-2 text-sm">오늘도 부상 없이 득근해볼까요? 💪</p></div>
                <button onClick={() => setIsAnalysisOpen(true)} className="bg-slate-800 border border-white/10 text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-700 transition flex items-center gap-1"><Icons.Chart /> AI 분석</button>
            </div>
        </section>

        <section className="grid grid-cols-1 gap-4">
            <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl p-5 border border-white/5 flex items-center justify-between">
                <div><h2 className="font-extrabold text-white text-sm mb-1">오늘 컨디션 👋</h2><p className="text-slate-400 font-bold text-xs">부상 방지 체크!</p></div>
                <div className="flex gap-2">{['good', 'normal', 'bad'].map((status) => (<button key={status} onClick={() => handleConditionCheck(status as any)} className={`flex items-center justify-center w-10 h-10 rounded-xl border-2 transition-all ${todayCondition === status ? (status === 'good' ? 'bg-green-500/20 border-green-500 scale-110' : status === 'normal' ? 'bg-yellow-500/20 border-yellow-500 scale-110' : 'bg-red-500/20 border-red-500 scale-110') : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}><span className="text-lg">{status === 'good' ? '😆' : status === 'normal' ? '🙂' : '😷'}</span></button>))}</div>
            </div>
            <div className={`rounded-3xl p-6 shadow-lg border-2 border-white/10 relative overflow-hidden text-white ${myLevel.color}`}><div className="relative z-10 flex justify-between items-end"><div><div className="flex items-center gap-2 mb-1"><span className="text-2xl">{myLevel.emoji}</span><span className="font-black text-xl uppercase italic tracking-wider">{myLevel.name}</span></div><p className="font-bold text-white/90 text-xs mb-3">현재 등급: {myLevel.rank}</p><div className="flex items-center gap-2"><span className="text-3xl font-black">{streak}</span><span className="text-sm font-bold opacity-80">일 연속! 🔥</span></div></div><div className="text-right"><p className="text-xs font-bold opacity-70 mb-1">다음 등급까지</p><p className="text-lg font-black">{myLevel.next - logs.length}회</p></div></div></div>
        </section>

        <section className="bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 rounded-full blur-[80px] opacity-20 -mr-10 -mt-10 pointer-events-none"></div>
          <div className="flex justify-between items-end mb-6 relative"><div><h3 className="text-lg font-black text-white flex items-center gap-2">부상 히트맵 <span className="text-red-500 animate-pulse"><Icons.AlertCircle /></span></h3><p className="text-xs font-bold text-slate-400 mt-1">최근 통증 부위 (재활 기록만)</p></div><div className="text-right"><span className="block text-3xl font-black text-white">{rehabLogs.length}</span><span className="text-xs font-bold text-slate-400">건의 통증</span></div></div>
          <div className="flex flex-wrap gap-2 relative z-10">{bodyParts.map((part) => { const count = bodyPartCounts[part] || 0; return (<div key={part} className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-300 ${getSeverityColor(count)}`}>{part} {count > 0 && <span className="ml-1 opacity-90 text-[10px]">({count})</span>}</div>) })}</div>
        </section>

        <section className="bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-white/5">
           <h3 className="font-extrabold text-white mb-4">활동 흐름</h3>
           <div className="h-40 mb-6">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={logs.slice(0, 7).reverse()}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                 <XAxis dataKey="created_at" tickFormatter={(d) => new Date(d).getDate() + '일'} tick={{fontSize:10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                 <Tooltip position={{ y: 0 }} contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', fontSize: '12px', padding: '6px 10px', fontWeight: 'bold', color: '#fff' }} labelStyle={{ display: 'none' }} formatter={(value, name, props) => [`${value}점`, `${new Date(props.payload.created_at).getDate()}일 기록`]} />
                 <Line type="monotone" dataKey="pain_score" stroke="#3b82f6" strokeWidth={3} dot={{r:3, fill:'#3b82f6', strokeWidth:0}} activeDot={{r:6, fill:'#60a5fa'}} isAnimationActive={false} />
               </LineChart>
             </ResponsiveContainer>
           </div>
           <style jsx global>{` .react-calendar { background: transparent !important; border: none; width: 100%; font-family: inherit; color: #fff; } .react-calendar__tile { color: #cbd5e1; } .react-calendar__navigation button { color: #fff; font-weight: bold; font-size: 16px; } .react-calendar__tile:enabled:hover, .react-calendar__tile:enabled:focus { background-color: #334155; border-radius: 8px; } .react-calendar__tile--active { background: #3b82f6 !important; color: white !important; border-radius: 8px; box-shadow: 0 0 10px rgba(59,130,246,0.5); } .react-calendar__tile--now { background: #1e293b !important; color: #60a5fa !important; border-radius: 8px; font-weight: bold; border: 1px solid #3b82f6; } .react-calendar__month-view__days__day--weekend { color: #f87171; } `}</style>
           <Calendar onClickDay={setSelectedDate} value={selectedDate} tileContent={({ date }) => logs.some(l => new Date(l.created_at).toDateString() === date.toDateString()) ? <div className="flex justify-center mt-1"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_5px_#3b82f6]"></div></div> : null} />
        </section>

        <section>
          <div className="flex justify-between items-center mb-4 px-1"><h3 className="text-xl font-black text-white">{selectedDate ? `${selectedDate.getMonth()+1}월 ${selectedDate.getDate()}일 기록` : '최근 활동'}</h3><div className="flex gap-2"><button onClick={handleDownloadPDF} className="text-xs bg-slate-800 border border-white/10 text-slate-300 px-2 py-1 rounded-lg font-bold hover:bg-slate-700">📄 리포트 저장</button>{selectedDate && <button onClick={() => setSelectedDate(null)} className="text-xs bg-slate-700 text-white px-2 py-1 rounded-lg font-bold">전체보기</button>}</div></div>
          <div className="space-y-3">{loading ? (<div className="text-center py-10 font-bold text-slate-600 animate-pulse">로딩 중...</div>) : filteredLogs.length === 0 ? (<div className="text-center py-12 bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-800"><p className="text-slate-500 font-bold text-sm">기록이 없습니다.</p><button onClick={() => setIsModalOpen(true)} className="mt-4 text-blue-400 font-black text-sm hover:underline">+ 첫 기록 남기기</button></div>) : (filteredLogs.slice(0, 10).map((log) => { const isWorkout = log.log_type === 'workout' || (log.pain_score && !log.content.includes('통증')); return (<div key={log.id} className="bg-slate-900/50 backdrop-blur-sm p-5 rounded-2xl border border-white/5 flex items-center justify-between transition hover:bg-slate-800 cursor-default group"><div className="flex items-center gap-4"><div className={`w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 border border-white/5 ${isWorkout ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'}`}>{log.image_url ? <img src={log.image_url} alt="인증" className="w-full h-full object-cover" /> : (isWorkout ? <Icons.Activity /> : <Icons.AlertCircle />)}</div><div><div className="font-black text-white text-sm mb-0.5">{log.title}</div><div className="text-xs font-bold text-slate-500 line-clamp-1">{log.content}</div></div></div><div className="flex items-center gap-3"><button onClick={() => handleShareClick(log)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-pink-500 hover:bg-pink-500/10 rounded-full transition"><Icons.Share /></button><button onClick={() => handleDeleteLog(log.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition"><Icons.Trash /></button><div className="text-right"><div className={`font-black text-lg ${log.pain_score > 7 ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'text-white'}`}>{log.pain_score}</div><div className="text-[10px] font-bold text-slate-500">점</div></div></div></div>) }))}</div>
        </section>

        {/* 🆕 면책 조항 버튼 추가 (맨 아래) */}
        <section className="mt-8 mb-4 text-center">
            <button 
                onClick={() => setIsDisclaimerOpen(true)} 
                className="text-[10px] text-slate-600 font-bold hover:text-slate-400 flex items-center justify-center gap-1 mx-auto transition"
            >
                <Icons.Info /> 서비스 이용 약관 및 면책 조항
            </button>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-6 pointer-events-none flex justify-end max-w-md mx-auto z-40"><button onClick={() => setIsModalOpen(true)} className="pointer-events-auto w-16 h-16 bg-blue-600 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.6)] flex items-center justify-center text-white hover:bg-blue-500 transition transform hover:scale-110 active:scale-95"><Icons.Plus /></button></div>
      
      {/* 🆕 면책 조항 모달 (상세 내용 포함) */}
      {isDisclaimerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setIsDisclaimerOpen(false)}>
            <div className="bg-slate-900 border border-white/10 w-full max-w-sm max-h-[80vh] overflow-y-auto rounded-3xl p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <button onClick={() => setIsDisclaimerOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><Icons.X /></button>
                <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">⚖️ 서비스 이용 약관 및 면책 조항</h3>
                
                <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-medium">
                    <div className="bg-slate-950 p-4 rounded-xl border border-white/5">
                        <h4 className="font-bold text-white mb-1">1. 의료 행위 아님 (비의료 건강관리 서비스)</h4>
                        <p className="text-slate-400">본 서비스 'Moveplaza'에서 제공하는 모든 데이터, 분석 결과, 조언 및 정보는 사용자의 자가 건강 관리를 돕기 위한 참고용 자료일 뿐입니다. 이는 의사나 물리치료사의 전문적인 진단, 진료, 치료를 대체할 수 없으며, 의료 행위에 해당하지 않습니다.</p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-white/5">
                        <h4 className="font-bold text-white mb-1">2. 사용자의 책임 및 주의사항</h4>
                        <p className="text-slate-400">서비스 이용 중 통증이 발생하거나 악화될 경우 즉시 운동을 중단하고 전문 의료 기관을 방문해야 합니다. 본 서비스의 정보를 따라 하다가 발생한 부상이나 건강 상의 문제에 대해 개발자는 법적 책임을 지지 않습니다.</p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-white/5">
                        <h4 className="font-bold text-white mb-1">3. AI 분석 및 데이터의 한계</h4>
                        <p className="text-slate-400">제공되는 'AI 분석' 및 '통증 리포트'는 사용자가 입력한 데이터를 바탕으로 한 알고리즘적 통계일 뿐입니다. 개인의 신체적 특성이나 기저 질환을 완벽하게 반영하지 못할 수 있습니다.</p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-white/5">
                        <h4 className="font-bold text-white mb-1">4. 개발자 신분 고지</h4>
                        <p className="text-slate-400">본 서비스는 물리치료학과 재학생이 개발 및 운영하는 프로젝트이며, 개발자는 현재 면허를 소지한 전문 물리치료사가 아님을 명시합니다.</p>
                    </div>
                </div>

                <button onClick={() => setIsDisclaimerOpen(false)} className="mt-6 w-full py-3 bg-blue-600 text-white font-extrabold rounded-xl hover:bg-blue-500 transition shadow-lg">확인했습니다</button>
            </div>
        </div>
      )}

      {/* 분석 리포트 모달 */}
      {isAnalysisOpen && analysisData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setIsAnalysisOpen(false)}>
            <div className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <button onClick={() => setIsAnalysisOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><Icons.X /></button>
                <h3 className="text-xl font-black text-white mb-1">📊 내 몸 분석 리포트</h3>
                <p className="text-xs text-slate-500 font-bold mb-6">{analysisData.totalLogs}개의 기록을 분석했습니다.</p>
                
                <div className="space-y-4">
                    <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex items-center justify-between">
                        <div><p className="text-xs font-bold text-blue-400">가장 많이 아픈 곳</p><p className="text-2xl font-black text-white">{analysisData.worstPart}</p></div>
                        <div className="text-4xl">🤕</div>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center justify-between">
                        <div><p className="text-xs font-bold text-red-400">평균 통증 점수</p><p className="text-2xl font-black text-white">{analysisData.avgPain}<span className="text-sm text-slate-500">점</span></p></div>
                        <div className="text-4xl">🌡️</div>
                    </div>
                    <div className="bg-black/40 p-5 rounded-2xl text-white border border-white/5">
                        <p className="text-xs font-bold text-slate-400 mb-2">🤖 AI 분석 피드백</p>
                        <p className="font-bold leading-relaxed text-slate-200">{analysisData.advice}</p>
                    </div>
                    {/* 👇 분석 모달 안에도 면책 조항 링크 추가 (중요) */}
                    <button onClick={() => { setIsAnalysisOpen(false); setIsDisclaimerOpen(true); }} className="text-[10px] text-slate-500 underline text-center w-full hover:text-slate-300">⚠️ 분석 결과는 의료적 진단이 아닙니다. (면책 조항 보기)</button>
                </div>
                <button onClick={() => setIsAnalysisOpen(false)} className="mt-4 w-full py-3 bg-slate-800 text-white border border-white/10 font-bold rounded-xl hover:bg-slate-700 transition">닫기</button>
            </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
          <div className="bg-slate-900 border border-white/10 w-full max-w-md h-[90vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-slide-up-modal">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-slate-900"><h3 className="font-extrabold text-lg text-white">새로운 기록 남기기 ✍️</h3><button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-full transition text-slate-400"><Icons.X /></button></div>
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-900">
               <div className="flex bg-slate-800 p-1 rounded-xl"><button onClick={() => setLogType('workout')} className={`flex-1 py-3 rounded-lg font-extrabold text-sm transition ${logType === 'workout' ? 'bg-slate-700 text-blue-400 shadow-sm' : 'text-slate-500'}`}>💪 운동 완료</button><button onClick={() => setLogType('rehab')} className={`flex-1 py-3 rounded-lg font-extrabold text-sm transition ${logType === 'rehab' ? 'bg-slate-700 text-red-400 shadow-sm' : 'text-slate-500'}`}>🏥 재활/통증</button></div>
               <div><label className="block text-sm font-bold text-slate-400 mb-1">제목</label><input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-4 bg-slate-800 text-white rounded-xl font-bold border-none focus:ring-2 focus:ring-blue-500 placeholder-slate-600" placeholder="제목 입력" /></div>
               <div><label className="block text-sm font-bold text-slate-400 mb-2">사진/영상 추가</label><div className="flex items-center gap-3"><label className="w-20 h-20 bg-slate-800 rounded-xl flex items-center justify-center cursor-pointer border-2 border-dashed border-slate-700 hover:border-blue-500 hover:bg-blue-500/10 transition overflow-hidden text-slate-500">{mediaPreview ? <img src={mediaPreview} className="w-full h-full object-cover" /> : <Icons.Camera />}<input type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} /></label><span className="text-xs text-slate-500 font-bold">{mediaFile ? "파일 선택됨 ✅" : "운동 인증샷이나 통증 부위를 찍어보세요."}</span></div></div>
               
               {/* 👇 여기에 BodyMap 추가됨! */}
               <div>
                 <label className="block text-sm font-bold text-slate-400 mb-2">관련 부위 (터치)</label>
                 <BodyMap selectedParts={selectedParts} togglePart={togglePart} type={logType} />
                 
                 {/* 👇 버튼 리스트 추가: BodyMap 아래에 위치 */}
                 <div className="mt-4 flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                   {bodyParts.map((part) => (
                     <button
                       key={part}
                       onClick={() => togglePart(part)}
                       className={`px-3 py-2 rounded-lg text-xs font-bold border transition ${
                         selectedParts.includes(part)
                           ? logType === 'workout'
                             ? 'bg-blue-600 text-white border-blue-500' 
                             : 'bg-red-600 text-white border-red-500'
                           : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
                       }`}
                     >
                       {part}
                     </button>
                   ))}
                 </div>
               </div>

               <div><label className="block text-sm font-bold text-slate-400 mb-1">내용</label><textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full p-4 h-32 bg-slate-800 text-white rounded-xl border-none focus:ring-2 focus:ring-blue-500 resize-none placeholder-slate-600" placeholder="내용 입력" /></div>
               <div><div className="flex justify-between mb-2"><span className="font-bold text-slate-400">{logType === 'workout' ? '강도' : '통증'}</span><span className={`font-black text-xl ${score > 7 ? 'text-red-500' : 'text-blue-500'}`}>{score}</span></div><input type="range" min="0" max="10" value={score} onChange={(e) => setScore(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" /></div>
               <div className="flex items-center gap-3 p-4 bg-slate-800 rounded-xl border border-white/5"><input type="checkbox" id="public" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="w-5 h-5 rounded text-blue-600 bg-slate-700 border-slate-600"/><label htmlFor="public" className="text-sm font-bold text-slate-300 cursor-pointer">광장에 자랑하기 (공개)</label></div>
            </div>
            <div className="p-4 border-t border-white/5 bg-slate-900"><button onClick={handleAddLog} disabled={uploading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:bg-blue-500 transition disabled:opacity-50">{uploading ? '저장 중...' : '기록 저장 완료 ✨'}</button></div>
          </div>
        </div>
      )}

      {isResultOpen && resultImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4 animate-fade-in">
          <div className="relative max-w-sm w-full space-y-4">
            <h3 className="text-white font-bold text-center text-lg animate-pulse">👇 아래 버튼을 눌러 저장하세요!</h3>
            <img src={resultImage} alt="결과" className="w-full rounded-2xl shadow-2xl border border-white/10" />
            <button onClick={() => handleSaveResultImage(resultImage)} className="w-full py-4 bg-blue-600 text-white font-extrabold rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:bg-blue-500 transition flex items-center justify-center gap-2"><Icons.Download /> 이미지 저장 / 공유하기</button>
            <button onClick={() => setIsResultOpen(false)} className="w-full py-4 bg-slate-800 text-white border border-white/10 font-extrabold rounded-xl shadow-lg hover:bg-slate-700 transition">닫기</button>
          </div>
        </div>
      )}
    </div>
  )
}