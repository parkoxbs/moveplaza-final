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

// 👇 1. Supabase 주소와 키 입력
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
  Camera: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
}

// 레벨 계산
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
  
  // 기능용 Refs
  const reportRef = useRef<HTMLDivElement>(null)
  const shareCardRef = useRef<HTMLDivElement>(null)
  const [shareData, setShareData] = useState<any>(null)

  // 상태들
  const [streak, setStreak] = useState(0)
  const [myLevel, setMyLevel] = useState<any>(getLevel(0))
  const [todayCondition, setTodayCondition] = useState<'good' | 'normal' | 'bad' | null>(null)

  // 모달 및 입력 폼
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

  const bodyParts = [
    "목", "승모근", "어깨", "가슴", "등", "복근", "허리",
    "삼두", "이두", "전완근", "손목", "손",
    "엉덩이", "고관절", "허벅지(앞)", "허벅지(뒤)", "무릎", "종아리", "발목", "발"
  ]

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    
    const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single()
    setUserName(profile?.username || user.email?.split("@")[0] || "선수")

    const { data } = await supabase.from('logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    if (data) {
        setLogs(data)
        setMyLevel(getLevel(data.length))
        calculateStreak(data)
    }

    const today = new Date().toISOString().split('T')[0]
    const { data: conditionData } = await supabase.from('daily_conditions').select('*').eq('user_id', user.id).gte('created_at', `${today}T00:00:00`).limit(1)
    if (conditionData && conditionData.length > 0) setTodayCondition(conditionData[0].status)

    setLoading(false)
  }

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
    const t = toast.loading("PDF 리포트 생성 중...")
    try {
      const element = reportRef.current
      const width = element.scrollWidth
      const height = element.scrollHeight
      const dataUrl = await toPng(element, { cacheBust: true, pixelRatio: 2, backgroundColor: '#ffffff', width: width, height: height, style: { padding: '40px', background: 'white' } })
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgProps = pdf.getImageProperties(dataUrl)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`${userName}_Moveplaza_Report.pdf`)
      toast.success("PDF 저장 완료!", { id: t })
    } catch (e) { console.error(e); toast.error("PDF 생성 실패 ㅠ", { id: t }) }
  }

  const handleAddLog = async () => {
    if (!title.trim()) return toast.error("제목을 입력해주세요!")
    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      try {
        let mediaUrl = null;
        let mediaType = 'image';

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
        
        const { error } = await supabase.from('logs').insert({
          user_id: user.id,
          title,
          content: partsString + content,
          pain_score: score,
          log_type: logType,
          is_public: isPublic,
          image_url: mediaUrl,
          media_type: mediaType,
          created_at: new Date().toISOString()
        })

        if (error) throw error;

        toast.success("기록 저장 완료! 🎉")
        setIsModalOpen(false)
        setTitle(''); setContent(''); setScore(5); setSelectedParts([]); 
        setMediaFile(null); setMediaPreview(null);
        fetchData()

      } catch (e: any) {
        toast.error("저장 실패: " + e.message)
      }
    }
    setUploading(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setMediaFile(file)
      setMediaPreview(URL.createObjectURL(file))
    }
  }

  const handleDeleteLog = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    const { error } = await supabase.from('logs').delete().eq('id', id)
    if (!error) { toast.success('삭제 완료!'); setLogs(logs.filter(l => l.id !== id)) }
  }

  const handleShare = async (log: any) => {
    setShareData(log)
    const t = toast.loading("카드 생성 중...")
    setTimeout(async () => {
      if (shareCardRef.current) {
        try {
          const dataUrl = await toPng(shareCardRef.current, { cacheBust: true, pixelRatio: 3 })
          const link = document.createElement('a')
          link.download = `Moveplaza_Share.png`
          link.href = dataUrl
          link.click()
          toast.success("이미지 저장 완료!", { id: t })
        } catch { toast.error("실패 ㅠ", { id: t }) }
        setShareData(null)
      }
    }, 500)
  }

  const togglePart = (part: string) => {
    if (selectedParts.includes(part)) setSelectedParts(selectedParts.filter(p => p !== part))
    else setSelectedParts([...selectedParts, part])
  }

  const rehabLogs = logs.filter((log: any) => { if (log.type === 'workout') return false; if (log.intensity) return false; return true; })
  const bodyPartCounts = rehabLogs.reduce((acc: any, log: any) => {
    if (log.body_part) acc[log.body_part] = (acc[log.body_part] || 0) + 1
    const match = log.content?.match(/^\[(.*?)\]/); if (match) match[1].split(', ').forEach((p: string) => acc[p] = (acc[p] || 0) + 1);
    return acc
  }, {} as any)
  const getSeverityColor = (count: number) => {
    if (count >= 5) return "bg-red-500 text-white border-red-600 shadow-md shadow-red-200"; if (count >= 3) return "bg-orange-500 text-white border-orange-600 shadow-md shadow-orange-200"; if (count >= 1) return "bg-yellow-400 text-white border-yellow-500 shadow-md shadow-yellow-200"; return "bg-white text-gray-500 border-gray-200 hover:bg-gray-50";
  }
  const filteredLogs = selectedDate ? logs.filter(l => new Date(l.created_at).toDateString() === selectedDate.toDateString()) : logs

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-24">
      <Toaster position="top-center" />
      
      {/* 📸 공유용 숨겨진 카드 (사진 있으면 배경으로 깔림) */}
      {shareData && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-[-1] opacity-0 pointer-events-none">
          <div ref={shareCardRef} className="w-[500px] h-[500px] bg-slate-900 p-8 flex flex-col justify-between text-white relative overflow-hidden font-sans">
            
            {/* 👇 배경 설정 (사진 vs 그라데이션) */}
            {shareData.image_url ? (
              <>
                <img src={shareData.image_url} className="absolute inset-0 w-full h-full object-cover z-0" crossOrigin="anonymous" alt="배경" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30 z-0"></div>
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 z-0"></div>
                <div className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] bg-blue-600 rounded-full blur-[90px] opacity-60 z-0"></div>
                <div className="absolute bottom-[-50px] left-[-50px] w-[200px] h-[200px] bg-red-600 rounded-full blur-[90px] opacity-50 z-0"></div>
              </>
            )}

            <div className="z-10 relative">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-4 py-1.5 rounded-full text-sm font-black tracking-wide ${shareData.log_type === 'workout' ? 'bg-blue-600' : 'bg-red-600'}`}>{shareData.log_type === 'workout' ? 'WORKOUT LOG' : 'REHAB LOG'}</span>
                <p className="text-white/80 font-bold text-sm">{new Date(shareData.created_at).toLocaleDateString()}</p>
              </div>
              <h1 className="text-4xl font-black leading-tight mb-4 tracking-tight drop-shadow-lg">{shareData.title}</h1>
              <p className="text-white/90 text-lg font-medium leading-relaxed line-clamp-4 drop-shadow-md">{shareData.content}</p>
            </div>
            
            <div className="z-10 relative border-t border-white/20 pt-6 flex justify-between items-end">
              <div>
                <p className="text-white/70 text-xs font-black tracking-widest mb-1">INTENSITY</p>
                <p className="text-5xl font-black text-white drop-shadow-lg">{shareData.pain_score}<span className="text-xl text-white/60 ml-1">/ 10</span></p>
              </div>
              <div className="text-right">
                <p className="font-black text-2xl italic tracking-tighter text-white drop-shadow-lg">MOVEPLAZA</p>
                <p className="text-[10px] text-white/70 font-bold tracking-widest uppercase">Athlete Performance System</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all">
        <div className="max-w-md mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}><div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-blue-900/20 shadow-lg">M</div><span className="text-xl font-black tracking-tight text-slate-900">MOVEPLAZA</span></div>
          <div className="flex items-center gap-4 text-sm font-bold text-gray-500"><Link href="/community" className="hover:text-blue-600 transition">광장</Link><Link href="/mypage" className="hover:text-blue-600 transition">내 정보</Link></div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-md mx-auto px-5 pt-8 space-y-8 animate-slide-up bg-white" ref={reportRef}>
        <section><h2 className="text-3xl font-extrabold text-slate-900 leading-tight">안녕하세요,<br/><span className="text-blue-600">{userName}</span>님!</h2><p className="text-slate-500 font-bold mt-2 text-sm">오늘도 부상 없이 득근해볼까요? 💪</p></section>

        {/* 1. 컨디션 & 스트릭 */}
        <section className="grid grid-cols-1 gap-4">
            <div className="bg-white rounded-3xl p-5 shadow-lg border border-slate-100 flex items-center justify-between">
                <div><h2 className="font-extrabold text-slate-900 text-sm mb-1">오늘 컨디션 👋</h2><p className="text-slate-400 font-bold text-xs">부상 방지 체크!</p></div>
                <div className="flex gap-2">{['good', 'normal', 'bad'].map((status) => (<button key={status} onClick={() => handleConditionCheck(status as any)} className={`flex items-center justify-center w-10 h-10 rounded-xl border-2 transition-all ${todayCondition === status ? (status === 'good' ? 'bg-green-50 border-green-400 scale-110' : status === 'normal' ? 'bg-yellow-50 border-yellow-400 scale-110' : 'bg-red-50 border-red-400 scale-110') : 'bg-white border-slate-100'}`}><span className="text-lg">{status === 'good' ? '😆' : status === 'normal' ? '🙂' : '😷'}</span></button>))}</div>
            </div>
            <div className={`rounded-3xl p-6 shadow-lg border-2 border-white relative overflow-hidden text-white ${myLevel.color}`}><div className="relative z-10 flex justify-between items-end"><div><div className="flex items-center gap-2 mb-1"><span className="text-2xl">{myLevel.emoji}</span><span className="font-black text-xl uppercase italic tracking-wider">{myLevel.name}</span></div><p className="font-bold text-white/90 text-xs mb-3">현재 등급: {myLevel.rank}</p><div className="flex items-center gap-2"><span className="text-3xl font-black">{streak}</span><span className="text-sm font-bold opacity-80">일 연속! 🔥</span></div></div><div className="text-right"><p className="text-xs font-bold opacity-70 mb-1">다음 등급까지</p><p className="text-lg font-black">{myLevel.next - logs.length}회</p></div></div></div>
        </section>

        {/* 2. 부상 히트맵 */}
        <section className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/60 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl opacity-60 -mr-10 -mt-10 pointer-events-none"></div>
          <div className="flex justify-between items-end mb-6 relative"><div><h3 className="text-lg font-black text-slate-900 flex items-center gap-2">부상 히트맵 <span className="text-red-500 animate-pulse"><Icons.AlertCircle /></span></h3><p className="text-xs font-bold text-slate-400 mt-1">최근 통증 부위 (재활 기록만)</p></div><div className="text-right"><span className="block text-3xl font-black text-slate-900">{rehabLogs.length}</span><span className="text-xs font-bold text-slate-400">건의 통증</span></div></div>
          <div className="flex flex-wrap gap-2 relative z-10">{bodyParts.map((part) => { const count = bodyPartCounts[part] || 0; return (<div key={part} className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-300 ${getSeverityColor(count)}`}>{part} {count > 0 && <span className="ml-1 opacity-90 text-[10px]">({count})</span>}</div>) })}</div>
        </section>

        {/* 3. 캘린더 & 차트 */}
        <section className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
           <h3 className="font-extrabold text-slate-900 mb-4">활동 흐름</h3>
           <div className="h-40 mb-6"><ResponsiveContainer width="100%" height="100%"><LineChart data={logs.slice(0, 7).reverse()}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="created_at" tickFormatter={(d) => new Date(d).getDate() + '일'} tick={{fontSize:10}} axisLine={false} tickLine={false} /><Tooltip contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 4px 6px -1px rgb(0 0 0 / 0.1)'}} /><Line type="monotone" dataKey="pain_score" stroke="#2563eb" strokeWidth={3} dot={{r:3}} activeDot={{r:5}} isAnimationActive={false} /></LineChart></ResponsiveContainer></div>
           <style jsx global>{` .react-calendar { border: none; width: 100%; font-family: inherit; } .react-calendar__tile--active { background: #1e3a8a !important; color: white !important; border-radius: 8px; } .react-calendar__tile--now { background: #eff6ff !important; color: #1e3a8a !important; border-radius: 8px; font-weight: bold; } `}</style>
           <Calendar onClickDay={setSelectedDate} value={selectedDate} tileContent={({ date }) => logs.some(l => new Date(l.created_at).toDateString() === date.toDateString()) ? <div className="flex justify-center mt-1"><div className="w-1 h-1 bg-blue-600 rounded-full"></div></div> : null} />
        </section>

        {/* 4. 로그 리스트 */}
        <section>
          <div className="flex justify-between items-center mb-4 px-1"><h3 className="text-xl font-black text-slate-900">{selectedDate ? `${selectedDate.getMonth()+1}월 ${selectedDate.getDate()}일 기록` : '최근 활동'}</h3><div className="flex gap-2"><button onClick={handleDownloadPDF} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg font-bold hover:bg-slate-200">📄 리포트 저장</button>{selectedDate && <button onClick={() => setSelectedDate(null)} className="text-xs bg-gray-200 px-2 py-1 rounded-lg font-bold">전체보기</button>}</div></div>
          <div className="space-y-3">{loading ? (<div className="text-center py-10 font-bold text-slate-300">로딩 중...</div>) : filteredLogs.length === 0 ? (<div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-slate-200"><p className="text-slate-400 font-bold text-sm">기록이 없습니다.</p><button onClick={() => setIsModalOpen(true)} className="mt-4 text-blue-600 font-black text-sm hover:underline">+ 첫 기록 남기기</button></div>) : (filteredLogs.slice(0, 10).map((log) => { const isWorkout = log.log_type === 'workout' || (log.pain_score && !log.content.includes('통증')); return (<div key={log.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition hover:shadow-md hover:scale-[1.01] cursor-default group"><div className="flex items-center gap-4"><div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm overflow-hidden shrink-0 ${isWorkout ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>{log.image_url ? <img src={log.image_url} alt="인증" className="w-full h-full object-cover" /> : (isWorkout ? <Icons.Activity /> : <Icons.AlertCircle />)}</div><div><div className="font-black text-slate-900 text-sm mb-0.5">{log.title}</div><div className="text-xs font-bold text-slate-500 line-clamp-1">{log.content}</div></div></div><div className="flex items-center gap-3"><button onClick={() => handleShare(log)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-pink-500 hover:bg-pink-50 rounded-full transition"><Icons.Share /></button><button onClick={() => handleDeleteLog(log.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"><Icons.Trash /></button><div className="text-right"><div className={`font-black text-lg ${log.pain_score > 7 ? 'text-red-500' : 'text-slate-900'}`}>{log.pain_score}</div><div className="text-[10px] font-bold text-slate-400">점</div></div></div></div>) }))}</div>
        </section>
      </main>

      {/* 플로팅 버튼 & 모달 */}
      <div className="fixed bottom-0 left-0 right-0 p-6 pointer-events-none flex justify-end max-w-md mx-auto z-40"><button onClick={() => setIsModalOpen(true)} className="pointer-events-auto w-16 h-16 bg-blue-600 rounded-full shadow-xl shadow-blue-600/40 flex items-center justify-center text-white hover:bg-blue-700 transition transform hover:scale-110 active:scale-95"><Icons.Plus /></button></div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md h-[90vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-slide-up-modal">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50"><h3 className="font-extrabold text-lg text-gray-900">새로운 기록 남기기 ✍️</h3><button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition"><Icons.X /></button></div>
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
               <div className="flex bg-gray-100 p-1 rounded-xl"><button onClick={() => setLogType('workout')} className={`flex-1 py-3 rounded-lg font-extrabold text-sm transition ${logType === 'workout' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}>💪 운동 완료</button><button onClick={() => setLogType('rehab')} className={`flex-1 py-3 rounded-lg font-extrabold text-sm transition ${logType === 'rehab' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400'}`}>🏥 재활/통증</button></div>
               <div><label className="block text-sm font-bold text-gray-700 mb-1">제목</label><input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-4 bg-gray-50 rounded-xl font-bold border-none focus:ring-2 focus:ring-blue-100" placeholder="제목 입력" /></div>
               <div><label className="block text-sm font-bold text-gray-700 mb-2">사진/영상 추가</label><div className="flex items-center gap-3"><label className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition overflow-hidden">{mediaPreview ? <img src={mediaPreview} className="w-full h-full object-cover" /> : <Icons.Camera />}<input type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} /></label><span className="text-xs text-gray-400 font-bold">{mediaFile ? "파일 선택됨 ✅" : "운동 인증샷이나 통증 부위를 찍어보세요."}</span></div></div>
               <div><label className="block text-sm font-bold text-gray-700 mb-2">관련 부위</label><div className="flex flex-wrap gap-2">{bodyParts.map(part => (<button key={part} onClick={() => togglePart(part)} className={`px-3 py-2 rounded-lg text-xs font-bold border transition ${selectedParts.includes(part) ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-gray-500 border-gray-200'}`}>{part}</button>))}</div></div>
               <div><label className="block text-sm font-bold text-gray-700 mb-1">내용</label><textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full p-4 h-32 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 resize-none" placeholder="내용 입력" /></div>
               <div><div className="flex justify-between mb-2"><span className="font-bold text-gray-700">{logType === 'workout' ? '강도' : '통증'}</span><span className={`font-black text-xl ${score > 7 ? 'text-red-500' : 'text-blue-600'}`}>{score}</span></div><input type="range" min="0" max="10" value={score} onChange={(e) => setScore(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-slate-900" /></div>
               <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100"><input type="checkbox" id="public" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="w-5 h-5 rounded text-blue-600"/><label htmlFor="public" className="text-sm font-bold text-blue-900 cursor-pointer">광장에 자랑하기 (공개)</label></div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-white"><button onClick={handleAddLog} disabled={uploading} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 transition disabled:opacity-50">{uploading ? '저장 중...' : '기록 저장 완료 ✨'}</button></div>
          </div>
        </div>
      )}
    </div>
  )
}