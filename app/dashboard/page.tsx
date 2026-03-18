"use client"

import { useEffect, useState, useRef } from "react"
import { createBrowserClient } from "@supabase/ssr"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast, { Toaster } from 'react-hot-toast'
import 'react-calendar/dist/Calendar.css'
import { LineChart, Line, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend } from 'recharts'
import { toPng } from 'html-to-image'
import BodyMap from "../components/BodyMap"
import ActivityCalendar from "..//components/ActivityCalendar"
import { motion, AnimatePresence } from "framer-motion"
import confetti from 'canvas-confetti'
import BottomNav from "../components/BottomNav"
import * as nsfwjs from 'nsfwjs' 
// 🚨 서버비 다이어트! 이미지 압축 라이브러리 추가
import imageCompression from 'browser-image-compression'

const supabaseUrl = "https://okckpesbufkqhmzcjiab.supabase.co"
const supabaseKey = "sb_publishable_G_y2dTmNj9nGIvu750MlKQ_jjjgxu-t"
const supabase = createBrowserClient(supabaseUrl, supabaseKey)

const ADMIN_EMAILS = ['agricb83@gmail.com']; 

const Icons = {
  Activity: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  AlertCircle: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>,
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 5v14M5 12h14"/></svg>,
  X: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M18 6 6 18M6 6l12 12"/></svg>,
  Share: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Camera: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>,
  Download: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>,
  Chart: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>,
  Info: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>,
  Copy: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Map: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
  MessageSquare: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
  Bulb: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>,
  Star: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Trophy: () => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>,
  Ball: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/><path d="M12 12 4.93 4.93"/><path d="M19.07 4.93 12 12"/><path d="M12 12v10"/><path d="M12 2v10"/></svg>,
  Shield: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
}

const LEVEL_SYSTEM = [
  { name: 'Rookie', rank: '루키', emoji: '🐣', min: 0, color: 'bg-gradient-to-br from-slate-700 to-slate-600', glow: 'shadow-none', desc: '운동의 세계에 첫 발을 내딛은 신인' },
  { name: 'Beginner', rank: '비기너', emoji: '🌱', min: 15, color: 'bg-gradient-to-br from-emerald-600 to-teal-500', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.4)]', desc: '기초 체력을 다지며 성장하는 단계' },
  { name: 'Semi-Pro', rank: '세미 프로', emoji: '🏃', min: 50, color: 'bg-gradient-to-br from-blue-600 to-indigo-500', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.4)]', desc: '꾸준함이 몸에 배어가는 유망주' },
  { name: 'Pro', rank: '프로', emoji: '🔥', min: 100, color: 'bg-gradient-to-br from-red-600 to-orange-500', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.5)]', desc: '자기 관리가 확실한 지역구 에이스' },
  { name: 'World Class', rank: '월드 클래스', emoji: '💎', min: 200, color: 'bg-gradient-to-br from-purple-600 via-fuchsia-500 to-pink-500', glow: 'shadow-[0_0_25px_rgba(192,38,211,0.6)]', desc: '모두가 인정하는 압도적 퍼포먼스' },
  { name: 'Legend', rank: '레전드', emoji: '👑', min: 400, color: 'bg-gradient-to-br from-yellow-500 via-amber-400 to-yellow-600', glow: 'shadow-[0_0_30px_rgba(245,158,11,0.7)] ring-2 ring-yellow-300', desc: '명예의 전당에 오를 살아있는 전설' }
];

const REHAB_TIPS = [
  "🤕 발목 삐끗(염좌) 직후엔 RICE! 휴식(Rest), 냉찜질(Ice), 압박(Compression), 거상(Elevation)을 기억하세요.",
  "🦵 햄스트링은 다치기 쉽습니다. 운동 전 폼롤러보다 동적 스트레칭(다리 흔들기 등)이 훨씬 효과적입니다.",
  "💊 통증 점수 5점 이상이면 '근성'이 아니라 '미련'입니다. 즉시 운동을 멈추고 휴식을 취하세요.",
  "💧 근육 경련(쥐)이 자주 난다면 마그네슘과 수분 부족일 수 있습니다. 운동 중 이온음료를 틈틈이 섭취하세요.",
  "🏋️‍♂️ 스쿼트 시 무릎 통증이 있다면? 발목 가동성과 고관절 유연성 부족이 원인일 확률이 높습니다.",
  "🛌 수면은 최고의 아나볼릭 스테로이드입니다. 손상된 조직은 수면 중 분비되는 호르몬으로 회복됩니다. 최소 7시간 숙면을 권장합니다.",
  "🧊 급성 손상(붓고 열감)에는 48시간 이내 냉찜질, 만성 통증(뻐근함)에는 온찜질이 기본 원칙입니다.",
  "🧘 허리가 아플 땐 윗몸일으키기 절대 금지! 맥길(McGill)의 빅3 코어 운동(컬업, 사이드 플랭크, 버드독)을 추천합니다.",
  "🏃‍♂️ 아킬레스건염 예방을 위해서는 계단 끝에 서서 뒤꿈치를 천천히 내리는 편심성 수축(Eccentric) 운동이 필수적입니다.",
  "🦶 족저근막염(발바닥 통증)이 있다면, 기상 직후 첫발을 딛기 전 침대에서 발바닥 스트레칭을 꼭 해주세요.",
  "🙆‍♂️ 어깨 충돌증후군이 의심될 때는 팔을 머리 위로 올리는 동작을 피하고, 하부 승모근과 전거근 강화에 집중해야 합니다.",
  "🦴 관절에서 나는 단순한 '뚝' 소리는 괜찮지만, '통증'을 동반한 소리라면 연골 손상 신호일 수 있으니 검진이 필요합니다.",
  "🩹 테이핑(키네시오)은 관절을 고정하는 것이 아니라 근막 공간을 늘려 혈류 파트너 보조 수단입니다.",
  "⚡ 운동 후 발생하는 근육통(DOMS)은 24~72시간에 최고조에 달합니다. 폼롤링과 가벼운 유산소(액티브 리커버리)가 회복을 돕습니다.",
  "🏋️‍♀️ 웨이트 트레이닝 시 호흡을 꾹 참는 발살바 호흡은 코어를 강하게 잡지만, 뇌압과 혈압을 급상승시키므로 횟수를 조절하세요.",
  "🔄 재활의 완성은 '통증이 없는 것'이 아니라 '부상 이전의 퍼포먼스를 내는 것'입니다. 조급해하지 말고 점진적 과부하 원칙을 지키세요.",
  "🏃‍♀️ 전방십자인대 재활 중이라면 대퇴사두근(앞벅지)뿐만 아니라 햄스트링(뒷벅지)의 근력 비율을 꼭 맞추어야 재파열을 막습니다.",
  "🦵 장경인대 증후군(무릎 바깥쪽 통증)은 폼롤러로 인대를 직접 문지르기보다 엉덩이(중둔근) 근력을 강화하는 것이 근본적인 해결책입니다.",
  "⚡ 요추 전방전위증 환자는 허리를 젖히는 신전(Extension) 동작을 최소화하고, 코어를 단단하게 잡은 상태로 흉추의 가동성을 살려야 합니다.",
  "🍎 부상 회복기에는 콜라겐 합성을 위해 충분한 단백질과 비타민 C 섭취가 인대 및 건 회복에 큰 도움을 줍니다."
];

const getLevel = (count: number) => {
  for (let i = LEVEL_SYSTEM.length - 1; i >= 0; i--) {
    if (count >= LEVEL_SYSTEM[i].min) {
        const nextLevel = LEVEL_SYSTEM[i + 1];
        return { 
            ...LEVEL_SYSTEM[i], 
            next: nextLevel ? nextLevel.min : 9999,
            nextName: nextLevel ? nextLevel.rank : '만렙 달성!'
        };
    }
  }
  return { ...LEVEL_SYSTEM[0], next: 15, nextName: '비기너' };
};

const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-20 bg-slate-900/50 rounded-2xl"></div>
    <div className="flex justify-between items-end">
        <div className="space-y-2">
            <div className="h-8 w-48 bg-slate-900/50 rounded-lg"></div>
            <div className="h-4 w-32 bg-slate-900/50 rounded-lg"></div>
        </div>
        <div className="h-10 w-24 bg-slate-900/50 rounded-xl"></div>
    </div>
    <div className="h-24 bg-slate-900/50 rounded-3xl"></div>
    <div className="h-40 bg-slate-900/50 rounded-3xl"></div>
    <div className="h-72 bg-slate-900/50 rounded-3xl"></div>
    <div className="h-56 bg-slate-900/50 rounded-3xl"></div>
    <div className="h-64 bg-slate-900/50 rounded-3xl"></div>
  </div>
)

export default function Dashboard() {
  const router = useRouter()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState("")
  
  const [isAdmin, setIsAdmin] = useState(false);
  
  const dataReportRef = useRef<HTMLDivElement>(null)
  const shareCardRef = useRef<HTMLDivElement>(null)
  const [shareData, setShareData] = useState<any>(null)
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false)
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false)
  
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false)
  const [suggestionText, setSuggestionText] = useState("")
  const [todayTip, setTodayTip] = useState("")
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false) 

  const [streak, setStreak] = useState(0)
  const [myLevel, setMyLevel] = useState<any>(getLevel(0))
  const [prevLevelName, setPrevLevelName] = useState<string | null>(null) 
  const [isLevelUpCelebrationOpen, setIsLevelUpCelebrationOpen] = useState(false) 

  const [todayCondition, setTodayCondition] = useState<'good' | 'normal' | 'bad' | null>(null)
  const [stats, setStats] = useState<any[]>([]) 
  const [heatmapRange, setHeatmapRange] = useState<'1w' | '1m' | '6m' | '1y' | 'all'>('all')
  const [chartData, setChartData] = useState<any[]>([]) 
  
  const [matchStats, setMatchStats] = useState({ win: 0, draw: 0, lose: 0, goals: 0, assists: 0, total: 0 });

  const [gears, setGears] = useState<any[]>([]);
  const [gearStats, setGearStats] = useState<any[]>([]); 
  const [selectedGearId, setSelectedGearId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [logType, setLogType] = useState<'workout' | 'rehab' | 'match'>('workout') 
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [score, setScore] = useState(5)
  const [goals, setGoals] = useState(0)
  const [assists, setAssists] = useState(0)
  const [matchResult, setMatchResult] = useState<'win' | 'draw' | 'lose' | 'none'>('none')

  const [selectedParts, setSelectedParts] = useState<string[]>([])
  const [isPublic, setIsPublic] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)

  const bodyParts = ["목", "승모근", "어깨", "가슴", "등", "복근", "허리", "삼두", "이두", "전완근", "손목", "손", "엉덩이", "고관절", "허벅지(앞)", "허벅지(뒤)(햄스트링)", "무릎", "종아리", "발목", "발"]

  useEffect(() => { 
    router.refresh(); 
    fetchData(true); 
    setTodayTip(REHAB_TIPS[Math.floor(Math.random() * REHAB_TIPS.length)]);
  }, [])

  const fetchData = async (isFirstLoad = false) => {
    if (isFirstLoad) setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) { router.replace('/login'); return; }

    if (user.email && ADMIN_EMAILS.includes(user.email)) {
        setIsAdmin(true);
    }

    const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single()
    setUserName(profile?.username || user.email?.split("@")[0] || "선수")
    
    const { data: logData } = await supabase.from('logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    const { data: condData } = await supabase.from('daily_conditions').select('*').eq('user_id', user.id).order('created_at', { ascending: true })
    const { data: gearData } = await supabase.from('gears').select('*').eq('user_id', user.id).order('created_at', { ascending: false });

    if (logData) { 
        setLogs(logData);
        const newLevel = getLevel(logData.length);
        
        if (!isFirstLoad && prevLevelName && newLevel.name !== prevLevelName) {
            setIsLevelUpCelebrationOpen(true);
            triggerConfetti(); 
        }
        setMyLevel(newLevel);
        setPrevLevelName(newLevel.name);

        calculateStreak(logData); analyzeLogs(logData); calculateStats(logData); processChartData(logData, condData || []);
        
        const matches = logData.filter(l => l.log_type === 'match');
        setMatchStats({ 
            win: matches.filter(l => l.match_result === 'win').length, 
            draw: matches.filter(l => l.match_result === 'draw').length, 
            lose: matches.filter(l => l.match_result === 'lose').length, 
            goals: matches.reduce((acc, l) => acc + (l.goals || 0), 0), 
            assists: matches.reduce((acc, l) => acc + (l.assists || 0), 0), 
            total: matches.length 
        });

        if (gearData) {
            setGears(gearData);
            setGearStats(gearData.map(g => ({ ...g, usage: logData.filter(l => l.gear_id === g.id).length })).sort((a, b) => b.usage - a.usage));
        }
    }
    
    const today = new Date().toISOString().split('T')[0]
    const { data: todayCond } = await supabase.from('daily_conditions').select('*').eq('user_id', user.id).gte('created_at', `${today}T00:00:00`).limit(1)
    if (todayCond && todayCond.length > 0) setTodayCondition(todayCond[0].status)
    setLoading(false)
  }

  const triggerConfetti = () => {
    const duration = 3000; const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  }

  const processChartData = (logs: any[], conditions: any[]) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d.toISOString().split('T')[0];
    });
    setChartData(last7Days.map(date => {
        const dayLogs = logs.filter(l => l.created_at.startsWith(date));
        const avgScore = dayLogs.length > 0 ? dayLogs.reduce((acc, cur) => acc + cur.pain_score, 0) / dayLogs.length : 0;
        const dayCond = conditions.filter(c => c.created_at.startsWith(date)).pop();
        let condScore = 0; 
        if (dayCond) { if (dayCond.status === 'good') condScore = 10; else if (dayCond.status === 'normal') condScore = 6; else if (dayCond.status === 'bad') condScore = 3; }
        return { date: date.slice(5), score: Number(avgScore.toFixed(1)), condition: condScore };
    }));
  };

  const calculateStats = (data: any[]) => {
    if (!data || data.length === 0) {
        setStats([{ subject: '열정', A: 20, fullMark: 100 }, { subject: '강도', A: 20, fullMark: 100 }, { subject: '활동량', A: 20, fullMark: 100 }, { subject: '밸런스', A: 20, fullMark: 100 }, { subject: '관리', A: 20, fullMark: 100 }, { subject: '컨디션', A: 20, fullMark: 100 }]); return;
    }
    const uniqueDays = new Set(data.map(l => new Date(l.created_at).toDateString())).size;
    const workoutLogs = data.filter(l => l.log_type === 'workout' || l.log_type === 'match');
    const avgScore = workoutLogs.length > 0 ? workoutLogs.reduce((acc, cur) => acc + cur.pain_score, 0) / workoutLogs.length : 0;
    const usedParts = new Set();
    data.forEach(l => { const match = (l.content || '').match(/^\[(.*?)\]/); if(match) match[1].split(', ').forEach((p: string) => usedParts.add(p)); });
    const rehabRatio = data.filter(l => l.log_type === 'rehab').length / data.length;

    setStats([
        { subject: '열정', full: '꾸준함', A: Math.min(uniqueDays * 5, 100), fullMark: 100 },
        { subject: '강도', full: '평균강도', A: Math.min(avgScore * 12, 100), fullMark: 100 },
        { subject: '활동량', full: '총볼륨', A: Math.min(data.length * 2, 100), fullMark: 100 },
        { subject: '밸런스', full: '다양성', A: Math.min(usedParts.size * 8, 100), fullMark: 100 },
        { subject: '관리', full: '부상방지', A: (rehabRatio > 0 && rehabRatio < 0.4) ? 95 : (rehabRatio === 0 ? 60 : 80), fullMark: 100 },
        { subject: '컨디션', full: '신체상태', A: 75 + (data.length > 5 ? 10 : 0), fullMark: 100 },
    ]);
  };

  const analyzeLogs = (data: any[]) => {
    if (data.length === 0) return;
    const rehabLogs = data.filter(l => l.log_type === 'rehab');
    const partCounts: {[key: string]: number} = {};
    let totalPain = 0;
    rehabLogs.forEach(log => {
        totalPain += log.pain_score;
        const match = (log.content || '').match(/^\[(.*?)\]/);
        if (match) match[1].split(', ').forEach((p: string) => { partCounts[p] = (partCounts[p] || 0) + 1; });
    });

    const sortedParts = Object.entries(partCounts).sort((a, b) => b[1] - a[1]);
    const worstPart = sortedParts.length > 0 ? sortedParts[0][0] : '없음';
    const avgPain = rehabLogs.length > 0 ? (totalPain / rehabLogs.length).toFixed(1) : '0';

    let advice = "부상 없이 건강하게 운동하고 계시네요! 👍";
    if (rehabLogs.length > 0) {
        if (Number(avgPain) >= 8) advice = "🚨 평균 통증 점수가 매우 높습니다! 무리한 운동은 멈추고, 충분한 휴식이나 점검을 권장합니다.";
        else if (Number(avgPain) >= 5) advice = "⚠️ 통증이 지속되고 있습니다. 운동 강도를 낮추고 충분한 스트레칭이 필요합니다.";
        else if (worstPart.includes("무릎")) advice = "🦵 무릎에 부하가 많이 가고 있네요. 대퇴사두근 강화 운동과 햄스트링 스트레칭을 루틴에 추가해보세요.";
        else if (worstPart.includes("허리")) advice = "🧘 허리가 불편하시군요. 코어 운동(플랭크, 버드독)을 강화하고, 허리를 과하게 꺾는 동작은 피하세요.";
        else if (worstPart.includes("발목")) advice = "🦶 발목 불안정성이 의심됩니다. 밸런스 운동과 밴드를 이용한 발목 강화 운동이 도움됩니다.";
        else if (worstPart.includes("어깨")) advice = "🙆‍♂️ 어깨 충돌을 조심하세요. 회전근개 강화와 흉추 가동성 운동을 추천합니다.";
    }
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

  const handleCopyLog = (log: any) => {
    if (!log) return;
    setTitle(log.title || ''); setScore(log.pain_score); setLogType(log.log_type);
    if (log.log_type === 'match') { setGoals(log.goals || 0); setAssists(log.assists || 0); setMatchResult(log.match_result || 'none'); }
    const match = (log.content || '').match(/^\[([^\]]*)\]\s*([\s\S]*)/);
    if (match) { setSelectedParts(match[1].split(', ')); setContent(match[2]); } 
    else { setContent(log.content || ''); setSelectedParts([]); }
    setIsModalOpen(true); toast.success("기록을 복사했습니다! (날짜는 오늘)");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) { 
        const file = e.target.files[0]; 
        setMediaFile(file); 
        setMediaPreview(URL.createObjectURL(file)); 
    }
  }

  const handleAddLog = async () => {
    if (!title.trim()) return toast.error("제목을 입력해주세요!")
    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      try {
        let mediaUrl = null; let mediaType = 'image';
        if (mediaFile) {
            let fileToUpload = mediaFile;
            
            if (mediaFile.type.startsWith('image')) {
                const compressOptions = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true,
                };
                
                try {
                    const compressToast = toast.loading("이미지 최적화 중... 🗜️");
                    fileToUpload = await imageCompression(mediaFile, compressOptions);
                    toast.dismiss(compressToast);
                } catch (compressError) {
                    console.error("이미지 압축 실패, 원본으로 진행합니다.", compressError);
                }

                const checkToast = toast.loading("AI가 이미지를 검사 중입니다... 🕵️‍♂️");
                try {
                    const model = await nsfwjs.load();
                    const img = new Image(); img.src = URL.createObjectURL(fileToUpload);
                    await new Promise((resolve) => (img.onload = resolve));
                    const predictions = await model.classify(img);
                    
                    const isBad = predictions.some(p => 
                        (p.className === 'Porn' || p.className === 'Hentai') && p.probability > 0.85
                    );
                    
                    toast.dismiss(checkToast);
                    if (isBad) {
                        toast.error("🚫 부적절한 이미지가 감지되어 업로드할 수 없습니다.");
                        setUploading(false); return; 
                    }
                } catch(aiError) { 
                    toast.dismiss(checkToast); 
                    console.error("AI 모델 로딩 실패", aiError); 
                }
            }

            const fileExt = fileToUpload.name.split('.').pop();
            const filePath = `${user.id}/${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('images').upload(filePath, fileToUpload);
            if (uploadError) throw uploadError;
            const { data } = supabase.storage.from('images').getPublicUrl(filePath);
            mediaUrl = data.publicUrl; mediaType = fileToUpload.type.startsWith('video') ? 'video' : 'image';
        }
        
        const partsString = selectedParts.length > 0 ? `[${selectedParts.join(', ')}] ` : ''
        const { error } = await supabase.from('logs').insert({ 
            user_id: user.id, title, content: partsString + content, pain_score: score, log_type: logType, is_public: isPublic, 
            image_url: mediaUrl, media_type: mediaType, created_at: new Date().toISOString(), goals: logType === 'match' ? goals : 0,
            assists: logType === 'match' ? assists : 0, match_result: logType === 'match' ? matchResult : 'none', gear_id: selectedGearId
        })
        if (error) throw error;
        toast.success("기록 저장 완료! 🎉"); setIsModalOpen(false); 
        setTitle(''); setContent(''); setScore(5); setSelectedParts([]); setMediaFile(null); setMediaPreview(null); 
        setGoals(0); setAssists(0); setMatchResult('none'); setLogType('workout'); setSelectedGearId(null);
        fetchData(false)
      } catch (e: any) { toast.error("저장 실패: " + e.message) }
    }
    setUploading(false)
  }

  const handleSendSuggestion = async () => {
    if(!suggestionText.trim()) return toast.error("내용을 입력해주세요!");
    const t = toast.loading("전송 중...");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("로그인이 필요합니다.", { id: t });
    const { error } = await supabase.from('suggestions').insert({ content: suggestionText, user_id: user.id });
    if(error) toast.error("전송 실패 ㅠ " + error.message, { id: t });
    else { toast.success("소중한 의견 감사합니다! 💌", { id: t }); setSuggestionText(""); setIsSuggestionOpen(false); }
  }

  const handleDeleteLog = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    const { error } = await supabase.from('logs').delete().eq('id', id)
    if (!error) { toast.success('삭제 완료!'); setLogs(logs.filter(l => l.id !== id)) }
  }

  const handleAdminForceDelete = async (id: string) => {
    if (!confirm('🚨 [CEO 권한] 이 게시물을 즉시 영구 삭제하시겠습니까?')) return;
    const { error } = await supabase.from('logs').delete().eq('id', id);
    if (!error) { 
        toast.success('관리자 권한으로 철퇴를 내렸습니다! 💥'); 
        setLogs(logs.filter(l => l.id !== id)); 
    } else {
        toast.error('삭제 실패! (Supabase 정책 확인 필요)');
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm("🚨 정말 탈퇴하시겠습니까?\n\n모든 훈련 기록, 라인업 전술, 프로필 정보가 영구적으로 삭제되며 절대 복구할 수 없습니다.")) return;
    const t = toast.loading("데이터 영구 삭제 중...");
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.rpc('delete_user');
      if (error) toast.error("탈퇴 실패. 다시 시도해주세요.", { id: t });
      else { await supabase.auth.signOut(); toast.success("회원 탈퇴 완료. 그동안 감사했습니다!", { id: t }); router.replace('/login'); }
    }
  };

  const togglePart = (part: string) => {
    if (selectedParts.includes(part)) setSelectedParts(selectedParts.filter(p => p !== part))
    else setSelectedParts([...selectedParts, part])
  }

  // 🚨 [최종 병기] 1. Double Render Hack (아이폰 캐시 깨우기) + 2. Native Share API (아이폰 전용 공유창 띄우기)
  const handleShareClick = async (log: any) => {
    const t = toast.loading("카드 디자인 중... 🎨");
    
    // 복잡한 변환 다 버리고, 원본 URL 그대로 사용 (가장 빠름)
    setShareData(log);

    // 모달이 화면에 뜨고 안정화될 시간 0.5초 부여
    setTimeout(async () => {
      if (shareCardRef.current) {
        try {
          // 🚨 [꼼수 1] 첫 번째 캡처는 그냥 버림! (이때 아이폰이 몰래 사진을 불러와서 캐싱함)
          await toPng(shareCardRef.current, { cacheBust: false, pixelRatio: 2 });
          
          // 🚨 두 번째 캡처가 진짜! (이미지가 완벽하게 로드된 상태에서 찍힘)
          const dataUrl = await toPng(shareCardRef.current, { 
              cacheBust: false, 
              pixelRatio: 2, 
              backgroundColor: '#0f172a'
          });

          // 🚨 [꼼수 2] 아이폰(Safari)은 강제 다운로드(link.click)를 막기 때문에, 네이티브 공유창을 띄워줌!
          if (navigator.share) {
            try {
              const blob = await (await fetch(dataUrl)).blob();
              const file = new File([blob], 'moveplaza_card.png', { type: 'image/png' });
              toast.dismiss(t);
              await navigator.share({
                files: [file],
                title: 'MOVEPLAZA Activity',
              });
            } catch (err) {
              // 유저가 공유창을 그냥 닫은 경우 (에러 아님)
              toast.dismiss(t);
            }
          } else {
            // PC나 안드로이드 등은 원래대로 즉시 다운로드
            const link = document.createElement('a'); 
            link.download = `moveplaza_magazine_${Date.now()}.png`; 
            link.href = dataUrl; 
            link.click();
            toast.success("저장 완료! 📸", { id: t });
          }
        } catch (error: any) { 
          console.error("캡처 에러: ", error);
          toast.error("저장 실패 ㅠ 다시 시도해주세요.", { id: t }); 
        }
        setShareData(null); 
      }
    }, 500); 
  }

  // 데이터 리포트 다운로드도 동일하게 공유창 띄우기로 호환성 확보
  const handleDownloadImage = async () => {
    if (!dataReportRef.current) return; 
    const t = toast.loading("활동 데이터 리포트 생성 중... 📸");
    setTimeout(async () => {
      try {
        if(!dataReportRef.current) return;
        const element = dataReportRef.current;
        
        await toPng(element, { cacheBust: false, pixelRatio: 2, backgroundColor: '#ffffff' }); // 더블 렌더링 꼼수
        const dataUrl = await toPng(element, { cacheBust: false, pixelRatio: 2, backgroundColor: '#ffffff', width: element.scrollWidth, height: element.scrollHeight, style: { padding: '20px', background: '#ffffff' } });
        
        if (navigator.share) {
            try {
                const blob = await (await fetch(dataUrl)).blob();
                const file = new File([blob], 'moveplaza_report.png', { type: 'image/png' });
                toast.dismiss(t);
                await navigator.share({
                    files: [file],
                    title: 'MOVEPLAZA Report',
                });
            } catch (err) { toast.dismiss(t); }
        } else {
            const link = document.createElement('a'); link.download = `${userName}_Activity_Report_${Date.now()}.png`; link.href = dataUrl; document.body.appendChild(link); link.click(); document.body.removeChild(link);
            toast.success("데이터 리포트 저장 완료! 📊", { id: t });
        }
      } catch (e) { toast.error("저장 실패 ㅠ 화면 캡처를 이용해주세요.", { id: t, duration: 5000 }); }
    }, 500);
  }

  const getFilteredRehabLogs = () => {
    const now = new Date();
    return logs.filter(log => {
      if (log.log_type !== 'rehab') return false;
      if (heatmapRange === 'all') return true;
      const cutoff = new Date();
      if (heatmapRange === '1w') cutoff.setDate(now.getDate() - 7);
      else if (heatmapRange === '1m') cutoff.setMonth(now.getMonth() - 1);
      else if (heatmapRange === '6m') cutoff.setMonth(now.getMonth() - 6);
      else if (heatmapRange === '1y') cutoff.setFullYear(now.getFullYear() - 1);
      return new Date(log.created_at) >= cutoff;
    });
  };

  const rehabLogs = getFilteredRehabLogs();
  const bodyPartCounts = rehabLogs.reduce((acc: any, log: any) => { 
      if (log.body_part) acc[log.body_part] = (acc[log.body_part] || 0) + 1; 
      const match = (log.content || '').match(/^\[(.*?)\]/); 
      if (match) match[1].split(', ').forEach((p: string) => acc[p] = (acc[p] || 0) + 1); 
      return acc; 
  }, {} as any)
  const getSeverityColor = (count: number) => { if (count >= 5) return "bg-red-500/80 text-white border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]"; if (count >= 3) return "bg-orange-500/80 text-white border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]"; if (count >= 1) return "bg-yellow-500/80 text-white border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]"; return "bg-slate-800 text-slate-400 border-slate-700"; }
  const filteredLogs = selectedDate ? logs.filter(l => new Date(l.created_at).toDateString() === selectedDate.toDateString()) : logs

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white pb-32 selection:bg-blue-500 selection:text-white">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1e293b', color: '#fff' } }} />
      
      <div className="absolute top-0 left-[-9999px] z-[-9999] opacity-0 pointer-events-none">
        <div ref={dataReportRef} className="w-[800px] bg-white text-slate-900 p-10 font-sans tracking-tight" style={{ minHeight: '1122px' }}>
          <div className="border-b-4 border-slate-900 pb-4 mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-black mb-2 tracking-tighter">PERSONAL ACTIVITY LOG</h1>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Training & Condition Summary</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-blue-600">MOVEPLAZA</p>
            </div>
          </div>
          <div className="flex justify-between items-center bg-slate-100 p-6 rounded-xl mb-8">
            <div>
                <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">Athlete Name</p>
                <p className="text-3xl font-black">{userName}</p>
            </div>
            <div className="text-right">
                <p className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-widest">Report Date</p>
                <p className="text-xl font-bold">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 mb-10">
              <div className="border-2 border-slate-200 p-6 rounded-2xl bg-white shadow-sm">
                  <h3 className="font-black text-xl mb-4 border-b-2 border-slate-100 pb-2 flex items-center gap-2">📊 시즌 활동 요약</h3>
                  <div className="space-y-3 text-base font-bold text-slate-700">
                      <div className="flex justify-between"><span>총 훈련/운동 기록</span> <span className="text-slate-900">{logs.filter(l=>l.log_type==='workout').length}회</span></div>
                      <div className="flex justify-between"><span>총 실전 경기 수</span> <span className="text-slate-900">{matchStats.total}경기</span></div>
                      <div className="flex justify-between"><span>시즌 성적</span> <span className="text-blue-600">{matchStats.win}승 {matchStats.draw}무 {matchStats.lose}패</span></div>
                      <div className="flex justify-between"><span>시즌 공격포인트</span> <span className="text-yellow-600">{matchStats.goals}골 {matchStats.assists}도움</span></div>
                  </div>
              </div>
              <div className="border-2 border-red-100 p-6 rounded-2xl bg-red-50 shadow-sm">
                  <h3 className="font-black text-xl mb-4 border-b-2 border-red-200 pb-2 text-red-600 flex items-center gap-2">🩹 통증 및 관리 요약</h3>
                  <div className="space-y-3 text-base font-bold text-slate-700">
                      <div className="flex justify-between"><span>통증/관리 기록 수</span> <span className="text-slate-900">{rehabLogs.length}건</span></div>
                      <div className="flex justify-between items-start"><span className="shrink-0">주요 불편 부위</span> <span className="text-red-600 text-right">{analysisData?.worstPart || '없음'}</span></div>
                      <div className="flex justify-between"><span>본인 체감 평균 통증</span> <span className="text-slate-900">{analysisData?.avgPain || 0} / 10점</span></div>
                  </div>
              </div>
          </div>
          <h3 className="font-black text-2xl mb-4">📋 최근 상세 기록 내역 <span className="text-base text-slate-400 font-bold ml-2">(최대 15건)</span></h3>
          <div className="border-2 border-slate-900 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-900 text-white text-sm">
                        <th className="p-4 font-bold w-28">일자</th>
                        <th className="p-4 font-bold w-20 text-center">분류</th>
                        <th className="p-4 font-bold">훈련/경기/통증 상세 내용</th>
                        <th className="p-4 font-bold text-center w-24">통증/강도</th>
                    </tr>
                </thead>
                <tbody className="bg-white">
                    {logs.slice(0, 15).map((log, index) => (
                        <tr key={log.id} className={index !== 14 ? "border-b border-slate-200" : ""}>
                            <td className="p-4 font-medium text-slate-600 text-sm whitespace-nowrap">{new Date(log.created_at).toLocaleDateString()}</td>
                            <td className="p-4 text-center font-black text-sm">
                                {log.log_type === 'workout' ? <span className="text-blue-600">훈련</span> : (log.log_type === 'match' ? <span className="text-yellow-600">경기</span> : <span className="text-red-600">재활</span>)}
                            </td>
                            <td className="p-4">
                                <p className="font-black text-slate-900 mb-1">{log.title}</p>
                                <p className="text-slate-600 text-sm break-all">
                                    {log.log_type === 'match' ? <span className="font-bold text-slate-800">[결과: {log.match_result === 'win' ? '승' : (log.match_result === 'lose' ? '패' : '무')}] {log.goals}득점 {log.assists}도움 - </span> : ''}
                                    {log.content}
                                </p>
                            </td>
                            <td className="p-4 text-center">
                                <span className={`inline-block px-3 py-1 rounded-lg font-black text-sm ${log.pain_score >= 6 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                                    {log.pain_score} / 10
                                </span>
                            </td>
                        </tr>
                    ))}
                    {logs.length === 0 && (
                        <tr><td colSpan={4} className="p-8 text-center text-slate-400 font-bold">기록이 없습니다.</td></tr>
                    )}
                </tbody>
            </table>
          </div>
          <div className="mt-12 pt-6 border-t-2 border-slate-100 text-center">
            <p className="text-sm font-bold text-red-500 mb-1">⚠️ 본 리포트는 사용자가 직접 기록한 주관적인 운동 및 통증 수치를 요약한 것입니다.</p>
            <p className="text-xs font-bold text-slate-500">의학적 진단서나 소견서가 아니며, 병원 진료 시 참고용 데이터로만 활용해 주시기 바랍니다.</p>
          </div>
        </div>
      </div>
      
      {shareData && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-[-50] opacity-100 pointer-events-none">
          <div ref={shareCardRef} className="w-[450px] h-[650px] relative bg-slate-950 overflow-hidden font-sans">
            {shareData.image_url ? (
              <>
                {/* 🚨 img 태그 대신 <div>의 backgroundImage로 변경 (아이폰 Safari 렌더링 호환성 200% 상승) */}
                <div 
                  className="absolute inset-0 w-full h-full z-0" 
                  style={{
                    backgroundImage: `url('${shareData.image_url}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent z-0"></div>
              </>
            ) : (
              <div className={`absolute inset-0 w-full h-full bg-gradient-to-br ${shareData.log_type === 'match' ? 'from-yellow-900 to-slate-950' : (shareData.log_type === 'rehab' ? 'from-red-900 to-slate-950' : 'from-blue-900 to-slate-950')} z-0`}>
                  <div className="absolute inset-0 flex flex-col justify-center items-center opacity-10 select-none">
                      {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-9xl font-black italic tracking-tighter text-white leading-none">
                              {shareData.log_type === 'match' ? 'MATCH' : (shareData.log_type === 'rehab' ? 'REHAB' : 'WORKOUT')}
                          </span>
                      ))}
                  </div>
              </div>
            )}
            
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
                <div className="flex items-center gap-2">
                    <div className="bg-slate-900/60 p-1.5 rounded-lg border border-white/10">
                        <span className="font-black text-white text-lg">M</span>
                    </div>
                    <span className="font-black text-white tracking-widest text-xs drop-shadow-md">MOVEPLAZA</span>
                </div>
                <span className="text-white/90 font-bold text-sm bg-slate-900/60 px-3 py-1 rounded-full border border-white/10">
                    {new Date(shareData.created_at).toLocaleDateString()}
                </span>
            </div>
            <div className="absolute bottom-0 left-0 w-full p-8 z-10 flex flex-col gap-2">
                <div className="self-start px-4 py-1.5 rounded-full bg-slate-900/60 border border-white/20 text-[10px] font-black text-white uppercase tracking-widest mb-2 shadow-lg">
                    {shareData.log_type === 'workout' ? '⚡ TRAINING SESSION' : (shareData.log_type === 'match' ? '⚽ MATCH DAY' : '❤️‍🩹 RECOVERY')}
                </div>
                <div className="mb-4">
                      <h1 className="text-4xl font-black text-white leading-none mb-2 line-clamp-2 drop-shadow-xl uppercase italic tracking-tight">
                          {shareData.title}
                      </h1>
                      <p className="text-white/80 text-sm font-medium line-clamp-2 drop-shadow-md max-w-[80%]">
                          {shareData.content}
                      </p>
                </div>
                <div className="border-t border-white/30 pt-4 flex justify-between items-end">
                    <div className="flex flex-col gap-1 opacity-70">
                        <span className="text-[9px] font-mono tracking-widest text-white">ATHLETE DATA RECORD</span>
                        <div className="flex gap-[2px] h-4 items-end">
                            {[...Array(20)].map((_, i) => (
                                <div key={i} className={`bg-white w-[2px] ${Math.random() > 0.5 ? 'h-full' : 'h-1/2'}`}></div>
                            ))}
                        </div>
                    </div>
                    <div className="text-right">
                        {shareData.log_type === 'match' ? (
                            <div>
                                <span className={`text-5xl font-black italic tracking-tighter drop-shadow-2xl ${shareData.match_result === 'win' ? 'text-blue-400' : (shareData.match_result === 'lose' ? 'text-red-400' : 'text-slate-200')}`}>
                                    {shareData.match_result === 'win' ? 'WIN' : (shareData.match_result === 'lose' ? 'LOSE' : 'DRAW')}
                                </span>
                                <div className="text-white font-bold text-lg mt-[-5px] drop-shadow-md">
                                    {shareData.goals}G {shareData.assists}A
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-end justify-end leading-none">
                                <span className="text-[80px] font-black text-white tracking-tighter drop-shadow-2xl">
                                    {shareData.pain_score}
                                </span>
                                <span className="text-2xl font-bold text-white/60 mb-3 ml-1 drop-shadow-md">/10</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/5 transition-all">
        <div className="max-w-md mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}><div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-[0_0_15px_rgba(37,99,235,0.5)]">M</div><span className="text-xl font-black tracking-tight text-white">MOVEPLAZA</span></div>
          {isAdmin && <span className="ml-auto text-[10px] bg-red-600 text-white px-2 py-1 rounded-md font-black animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.8)]">👑 CEO 모드</span>}
        </div>
      </header>

      {loading ? (
        <main className="max-w-md mx-auto px-5 pt-8 pb-32">
            <DashboardSkeleton />
        </main>
      ) : (
        <main className="max-w-md mx-auto px-5 pt-8 space-y-8 animate-slide-up bg-slate-950">
            <section className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex items-start gap-3">
                <div className="text-yellow-500 mt-0.5"><Icons.Bulb /></div>
                <div>
                    <h4 className="text-xs font-black text-yellow-500 mb-1 uppercase tracking-wide">Daily Rehab Tip</h4>
                    <p className="text-sm font-bold text-slate-200 leading-relaxed">{todayTip}</p>
                </div>
            </section>

            <section>
                <div className="flex justify-between items-end">
                    <div><h2 className="text-3xl font-extrabold text-white leading-tight">안녕하세요,<br/><span className="text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">{userName}</span>님!</h2><p className="text-slate-400 font-bold mt-2 text-sm">오늘도 부상 없이 득근해볼까요? 💪</p></div>
                    <button onClick={() => setIsAnalysisOpen(true)} className="bg-slate-800 border border-white/10 text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-700 transition flex items-center gap-1 shadow-sm"><Icons.Chart /> AI 분석</button>
                </div>
            </section>

            {matchStats.total > 0 && (
                <section className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-3xl p-6 relative overflow-hidden shadow-2xl border border-white/10">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-[50px] -mr-10 -mt-10"></div>
                    <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2"><Icons.Ball /> SEASON STATS</h3>
                    <div className="grid grid-cols-3 gap-2 text-center mb-6">
                        <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                            <p className="text-xs text-blue-200 font-bold mb-1">경기 수</p>
                            <p className="text-2xl font-black text-white">{matchStats.total}</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                            <p className="text-xs text-blue-200 font-bold mb-1">공격포인트</p>
                            <p className="text-2xl font-black text-white">{matchStats.goals + matchStats.assists}</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                            <p className="text-xs text-blue-200 font-bold mb-1">승률</p>
                            <p className="text-2xl font-black text-white">{matchStats.total > 0 ? Math.round((matchStats.win / matchStats.total) * 100) : 0}%</p>
                        </div>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold bg-black/20 p-3 rounded-xl">
                        <span className="text-blue-400">{matchStats.win}승</span>
                        <span className="text-slate-400">{matchStats.draw}무</span>
                        <span className="text-red-400">{matchStats.lose}패</span>
                        <span className="w-[1px] h-4 bg-white/20 mx-2"></span>
                        <span className="text-yellow-400">{matchStats.goals}골</span>
                        <span className="text-emerald-400">{matchStats.assists}도움</span>
                    </div>
                </section>
            )}

            {gearStats.length > 0 && (
                <section className="bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 border border-white/5 shadow-sm overflow-hidden">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <h3 className="text-lg font-black text-white flex items-center gap-2">장비 컨디션 👟</h3>
                            <p className="text-xs font-bold text-slate-400 mt-1">마모된 스터드와 쿠셔닝은 부상의 지름길!</p>
                        </div>
                    </div>
                    <div className="flex overflow-x-auto gap-4 pb-2 custom-scrollbar snap-x">
                        {gearStats.map(gear => {
                            const maxUsage = 50;
                            const isWarning = gear.usage >= maxUsage;
                            const isCaution = gear.usage >= 30 && gear.usage < maxUsage;
                            const percentage = Math.min(100, (gear.usage / maxUsage) * 100);
                            const statusColor = isWarning ? 'bg-red-500' : isCaution ? 'bg-yellow-500' : 'bg-blue-500';
                            const statusText = isWarning ? 'text-red-400' : isCaution ? 'text-yellow-400' : 'text-blue-400';
                            const statusBg = isWarning ? 'bg-red-500/10 border-red-500/20' : isCaution ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-slate-800 border-white/5';

                            return (
                                <div key={gear.id} className={`snap-start shrink-0 w-64 rounded-2xl p-4 border ${statusBg} transition-all`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{gear.brand}</p>
                                            <p className="text-sm font-black text-white truncate w-40">{gear.name}</p>
                                        </div>
                                        <span className="px-2 py-1 bg-slate-950 rounded-md text-[10px] font-bold text-slate-300 border border-white/10">{gear.stud_type}</span>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-slate-400">착용 횟수</span>
                                            <span className={`${statusText}`}>{gear.usage} <span className="text-slate-500 text-[10px]">/ 권장 {maxUsage}회</span></span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5 relative">
                                            <div className={`absolute top-0 left-0 h-full ${statusColor} transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
                                        </div>
                                        {isWarning && (
                                            <p className="text-[10px] font-bold text-red-400 mt-2 flex items-center gap-1 animate-pulse">
                                                <Icons.AlertCircle /> 스터드 마모 점검 요망!
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </section>
            )}

            <section className="mb-4">
                <Link href="/lineup" className="block w-full bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl p-5 shadow-lg border border-white/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px] -mr-5 -mt-5 group-hover:scale-110 transition"></div>
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-black text-white italic tracking-wider">LINEUP BUILDER</h3>
                            <p className="text-xs text-green-100 font-bold mt-1">나만의 베스트 11 전술판 만들기 ⚽</p>
                        </div>
                        <div className="text-3xl group-hover:rotate-12 transition">📋</div>
                    </div>
                </Link>
            </section>

            <section className="mb-4">
                <Link href="/self-check" className="block w-full bg-gradient-to-r from-red-600 to-pink-600 rounded-3xl p-5 shadow-lg border border-white/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px] -mr-5 -mt-5 group-hover:scale-110 transition"></div>
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-black text-white italic tracking-wider">SELF CHECK</h3>
                            <p className="text-xs text-red-100 font-bold mt-1">병원 가야 할까? 1분 자가 진단 🏥</p>
                        </div>
                        <div className="text-3xl group-hover:rotate-12 transition">🩺</div>
                    </div>
                </Link>
            </section>

            <section className="grid grid-cols-1 gap-4">
                <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl p-5 border border-white/5 flex items-center justify-between shadow-sm">
                    <div><h2 className="font-extrabold text-white text-sm mb-1">오늘 컨디션 👋</h2><p className="text-slate-400 font-bold text-xs">부상 방지 체크!</p></div>
                    <div className="flex gap-2">{['good', 'normal', 'bad'].map((status) => (<button key={status} onClick={() => handleConditionCheck(status as any)} className={`flex items-center justify-center w-10 h-10 rounded-xl border-2 transition-all ${todayCondition === status ? (status === 'good' ? 'bg-green-500/20 border-green-500 scale-110' : status === 'normal' ? 'bg-yellow-500/20 border-yellow-500 scale-110' : 'bg-red-500/20 border-red-500 scale-110') : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}><span className="text-lg">{status === 'good' ? '😆' : status === 'normal' ? '🙂' : '😷'}</span></button>))}</div>
                </div>
                
                <div className={`rounded-3xl p-6 shadow-lg border-2 border-white/10 relative overflow-hidden text-white ${myLevel.color} ${myLevel.glow}`}>
                    <div className="relative z-10 flex justify-between items-end">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-2xl">{myLevel.emoji}</span>
                                <span className="font-black text-xl uppercase italic tracking-wider">{myLevel.name}</span>
                            </div>
                            <p className="font-bold text-white/90 text-xs mb-3">현재 등급: {myLevel.rank}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-3xl font-black">{streak}</span>
                                <span className="text-sm font-bold opacity-80">일 연속! 🔥</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <button onClick={() => setIsLevelModalOpen(true)} className="absolute top-0 right-0 p-2 text-white/70 hover:text-white"><Icons.Info /></button>
                            <p className="text-xs font-bold opacity-70 mb-1">다음 {myLevel.nextName}까지</p>
                            <div className="w-24 h-1.5 bg-black/20 rounded-full mt-1 overflow-hidden">
                                <div className="h-full bg-white/90 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (logs.length / myLevel.next) * 100)}%` }}></div>
                            </div>
                            <p className="text-lg font-black mt-1">{Math.max(0, myLevel.next - logs.length)}회</p>
                        </div>
                    </div>
                </div>
            </section>

            {logs.length > 0 && (
                <section className="bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 border border-white/5 relative overflow-hidden shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-black text-white">나의 선수 스탯 ⚽</h3>
                        <span className="text-xs font-bold text-slate-500 bg-slate-800 px-2 py-1 rounded-lg border border-white/5">LIVE</span>
                    </div>
                    <div className="h-64 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats}>
                                <PolarGrid stroke="#334155" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="My Stats" dataKey="A" stroke="#3b82f6" strokeWidth={3} fill="#3b82f6" fillOpacity={0.4} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#60a5fa' }} formatter={(val, name, props) => [val, props.payload.full]} labelStyle={{display: 'none'}} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </section>
            )}

            <section className="bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 border border-white/5 relative overflow-hidden transition-all shadow-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 rounded-full blur-[80px] opacity-20 -mr-10 -mt-10 pointer-events-none"></div>
                <div className="flex flex-col gap-4 mb-6 relative z-10">
                    <div className="flex justify-between items-end">
                        <div>
                            <h3 className="text-lg font-black text-white flex items-center gap-2">부상 히트맵 <span className="text-red-500 animate-pulse"><Icons.AlertCircle /></span></h3>
                            <p className="text-xs font-bold text-slate-400 mt-1">최근 통증 부위 (재활 기록만)</p>
                        </div>
                        <div className="text-right">
                            <span className="block text-3xl font-black text-white">{rehabLogs.length}</span>
                            <span className="text-xs font-bold text-slate-400">건의 통증</span>
                        </div>
                    </div>
                    <div className="flex bg-slate-800 p-1 rounded-xl">
                        {['1w', '1m', '6m', '1y', 'all'].map((range) => (
                            <button key={range} onClick={() => setHeatmapRange(range as any)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${heatmapRange === range ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>
                                {range === '1w' ? '1주' : range === '1m' ? '1달' : range === '6m' ? '6달' : range === '1y' ? '1년' : '전체'}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 relative z-10">
                    {Object.keys(bodyPartCounts).length === 0 ? (
                        <p className="text-xs text-slate-500 font-bold w-full text-center py-4">해당 기간에 통증 기록이 없습니다. 👍</p>
                    ) : (
                        bodyParts.map((part) => { 
                            const count = bodyPartCounts[part] || 0; 
                            if (count === 0) return null;
                            return (
                                <div key={part} className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-300 ${getSeverityColor(count)}`}>
                                    {part} <span className="ml-1 opacity-90 text-[10px]">({count})</span>
                                </div>
                            ) 
                        })
                    )}
                </div>
            </section>

            <section className="bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-white/5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-extrabold text-white">컨디션 & 운동부하 분석 📉</h3>
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-1 rounded">최근 7일</span>
                </div>
                <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                        <XAxis dataKey="date" tick={{fontSize:10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="left" orientation="left" domain={[0, 12]} hide />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 12]} hide />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} labelStyle={{ color: '#cbd5e1', fontWeight: 'bold' }} formatter={(value: any, name: any) => { if (name === '컨디션') return [value === 10 ? '좋음' : value === 6 ? '보통' : '나쁨', name]; return [`${value}점`, name]; }} />
                        <Legend verticalAlign="top" height={36} iconSize={8} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                        <Bar yAxisId="left" dataKey="condition" name="컨디션" barSize={20} fill="#facc15" radius={[4, 4, 0, 0]} fillOpacity={0.3} />
                        <Line yAxisId="right" type="monotone" dataKey="score" name="운동강도/통증" stroke="#3b82f6" strokeWidth={3} dot={{r:3, fill:'#3b82f6'}} activeDot={{r:6, fill:'#fff'}} />
                    </ComposedChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 text-center">💡 컨디션(노란색)이 낮을 때 운동강도(파란선)가 높으면 부상 위험!</p>
            </section>

            <section>
                <div className="flex justify-between items-center mb-4 px-1">
                    <h3 className="text-xl font-black text-white">활동 캘린더 📅</h3>
                </div>
                <ActivityCalendar logs={logs} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
            </section>

            <section>
                <div className="flex justify-between items-center mb-4 px-1 mt-6">
                    <h3 className="text-xl font-black text-white">{selectedDate ? `${selectedDate.getMonth()+1}월 ${selectedDate.getDate()}일 기록` : '최근 활동'}</h3>
                    <div className="flex gap-2">
                        <button onClick={handleDownloadImage} className="text-xs bg-slate-800 border border-white/10 text-slate-300 px-2 py-1 rounded-lg font-bold hover:bg-slate-700 shadow-md flex items-center gap-1 transition">
                            📋 데이터 리포트 저장
                        </button>
                        {selectedDate && <button onClick={() => setSelectedDate(null)} className="text-xs bg-blue-600 text-white px-2 py-1 rounded-lg font-bold">전체보기</button>}
                    </div>
                </div>
                
                <div className="space-y-3">{filteredLogs.length === 0 ? (<div className="text-center py-12 bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-800"><p className="text-slate-500 font-bold text-sm">기록이 없습니다.</p><button onClick={() => setIsModalOpen(true)} className="mt-4 text-blue-400 font-black text-sm hover:underline">+ 첫 기록 남기기</button></div>) : (filteredLogs.slice(0, 10).map((log) => { 
                    const isWorkout = log.log_type === 'workout' || log.log_type === 'match'; 
                    const isMatch = log.log_type === 'match';
                    return (<div key={log.id} className="bg-slate-900/50 backdrop-blur-sm p-4 rounded-2xl border border-white/5 flex flex-col gap-3 transition hover:bg-slate-800 cursor-default shadow-sm">
                        
                        {/* 🚨 위쪽: 아이콘 + 제목/내용 영역 */}
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 border border-white/5 ${isMatch ? 'bg-yellow-500/10 text-yellow-400' : (isWorkout ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400')}`}>
                                {log.image_url ? <img src={log.image_url} crossOrigin="anonymous" alt="인증" className="w-full h-full object-cover" /> : (isMatch ? <Icons.Trophy /> : (isWorkout ? <Icons.Activity /> : <Icons.AlertCircle />))}
                            </div>
                            <div className="flex-1">
                                <div className="font-black text-white text-sm mb-0.5">{log.title}</div>
                                <div className="text-xs font-bold text-slate-500 line-clamp-1">{isMatch ? `⚽ ${log.goals}골 ${log.assists}어시 (${log.match_result === 'win' ? '승' : (log.match_result === 'lose' ? '패' : '무')})` : log.content}</div>
                            </div>
                        </div>
                        
                        {/* 🚨 아래쪽: 숨겨져 있던 버튼들 항상 보이도록 꺼내놓음 (모바일 친화적) */}
                        <div className="flex items-center justify-between border-t border-white/5 pt-3">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                {/* 👑 어드민 철퇴 버튼 */}
                                {isAdmin && <button onClick={() => handleAdminForceDelete(log.id)} className="p-1.5 text-white bg-red-600 hover:bg-red-500 rounded-lg transition shadow-sm text-[10px] font-black" title="관리자 권한 즉시 삭제">철퇴 🔨</button>}
                                
                                <button onClick={() => handleShareClick(log)} className="p-2 text-pink-400 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 rounded-full transition shadow-sm flex items-center gap-1" title="카드 만들기">
                                    <Icons.Share /> <span className="text-[10px] font-bold hidden sm:inline">카드</span>
                                </button>
                                <button onClick={() => handleCopyLog(log)} className="p-2 text-slate-400 bg-slate-800/80 hover:text-green-400 hover:bg-slate-700 rounded-full transition" title="복사해서 쓰기"><Icons.Copy /></button>
                                <button onClick={() => handleDeleteLog(log.id)} className="p-2 text-slate-400 bg-slate-800/80 hover:text-red-400 hover:bg-slate-700 rounded-full transition" title="삭제"><Icons.Trash /></button>
                            </div>
                            <div className="text-right ml-1">
                                <div className={`font-black text-lg ${log.pain_score > 7 ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'text-white'}`}>{log.pain_score}</div>
                                <div className="text-[10px] font-bold text-slate-500 mt-[-2px]">점</div>
                            </div>
                        </div>
                    </div>) 
                }))}</div>
            </section>

            <section className="mt-12 mb-4 text-center">
                <div className="flex justify-center items-center gap-4 mb-4">
                    <button onClick={() => setIsDisclaimerOpen(true)} className="text-[10px] text-slate-500 font-bold hover:text-slate-300 transition flex items-center gap-1"><Icons.Info /> 약관 및 이용정책</button>
                    <span className="text-slate-700 text-[10px]">|</span>
                    <button onClick={() => setIsSuggestionOpen(true)} className="text-[10px] text-blue-500/70 font-bold hover:text-blue-400 transition flex items-center gap-1"><Icons.MessageSquare /> 개발자 건의하기</button>
                </div>
                <button onClick={handleDeleteAccount} className="text-[10px] text-red-500/50 font-bold hover:text-red-500 transition underline underline-offset-2">회원 탈퇴 (데이터 영구 삭제)</button>
            </section>
        </main>
      )}

      <div className="fixed bottom-28 right-6 z-40"><button onClick={() => setIsModalOpen(true)} className="w-16 h-16 bg-blue-600 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.6)] flex items-center justify-center text-white hover:bg-blue-500 transition transform hover:scale-110 active:scale-95"><Icons.Plus /></button></div>
      
      <AnimatePresence>
        {isLevelUpCelebrationOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md" onClick={() => setIsLevelUpCelebrationOpen(false)}>
                <motion.div initial={{ scale: 0.5, y: 100 }} animate={{ scale: 1, y: 0, rotate: [0, 10, -10, 0] }} transition={{ type: "spring", damping: 15 }} className="relative max-w-sm w-full text-center p-8 rounded-3xl border-2 border-white/20 bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] opacity-50 animate-pulse-slow ${myLevel.color.replace('bg-gradient-to-br', 'bg')}`}></div>
                    <div className="relative z-10">
                        <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-yellow-400 mx-auto mb-4 drop-shadow-[0_0_30px_rgba(250,204,21,0.8)]"><Icons.Trophy /></motion.div>
                        <h2 className="text-3xl font-black text-white mb-2 uppercase italic tracking-tight drop-shadow-lg">Level Up!</h2>
                        <p className="text-slate-300 font-bold text-lg mb-8">축하합니다! 새로운 등급 달성!</p>
                        <div className={`p-6 rounded-3xl border-2 border-white/30 shadow-2xl transform hover:scale-105 transition-all duration-500 ${myLevel.color} ${myLevel.glow}`}>
                            <div className="flex flex-col items-center gap-2"><span className="text-6xl drop-shadow-md animate-bounce-slow">{myLevel.emoji}</span><h3 className="text-3xl font-black text-white uppercase italic tracking-wider drop-shadow-lg">{myLevel.name}</h3><p className="text-sm font-bold text-white/90">{myLevel.rank}</p></div>
                        </div>
                    </div>
                    <button onClick={() => setIsLevelUpCelebrationOpen(false)} className="mt-8 w-full py-4 bg-white text-black font-extrabold rounded-xl hover:bg-slate-200 transition shadow-lg relative z-10">멋져요! 😎</button>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
      
      {isLevelModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setIsLevelModalOpen(false)}>
            <div className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
                <button onClick={() => setIsLevelModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white z-10"><Icons.X /></button>
                <div className="text-center mb-6">
                    <h3 className="text-2xl font-black text-white mb-1 flex items-center justify-center gap-2">🏆 등급 시스템 가이드</h3>
                    <p className="text-xs text-slate-400 font-bold">기록을 쌓아 최고의 선수가 되어보세요!</p>
                </div>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                    {LEVEL_SYSTEM.map((level) => (
                        <div key={level.name} className={`p-4 rounded-2xl border flex items-center justify-between transition-all duration-300 ${myLevel.name === level.name ? `bg-slate-800 border-white/20 ${level.glow}` : 'bg-slate-900/50 border-white/5 opacity-70 grayscale hover:grayscale-0'}`}>
                            <div className="flex items-center gap-4"><div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg ${level.color} text-white`}>{level.emoji}</div><div><div className="flex items-center gap-2"><h4 className={`font-black text-base ${myLevel.name === level.name ? 'text-white' : 'text-slate-300'}`}>{level.rank}</h4>{myLevel.name === level.name && <span className="text-[10px] bg-white text-black px-1.5 py-0.5 rounded-md font-extrabold animate-pulse">ME</span>}</div><p className="text-[10px] text-slate-400 font-bold mt-0.5">{level.desc}</p></div></div>
                            <div className="text-right"><p className="text-[10px] font-bold text-slate-500 mb-0.5">필요 기록</p><p className="text-lg font-black text-white italic">{level.min}<span className="text-xs not-italic ml-0.5 text-slate-500">회+</span></p></div>
                        </div>
                    ))}
                </div>
                <div className="mt-6"><button onClick={() => setIsLevelModalOpen(false)} className="w-full py-4 bg-white text-black font-extrabold rounded-xl hover:bg-slate-200 transition shadow-lg">도전하겠습니다 🔥</button></div>
            </div>
        </div>
      )}

      {isSuggestionOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setIsSuggestionOpen(false)}>
            <div className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <button onClick={() => setIsSuggestionOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><Icons.X /></button>
                <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">💌 개발자에게 건의하기</h3>
                <p className="text-xs text-slate-400 font-bold mb-4">"이 기능 추가해주세요!" 또는 "이거 불편해요 ㅠ"<br/>자유롭게 남겨주시면 빠르게 반영하겠습니다!</p>
                <textarea value={suggestionText} onChange={(e) => setSuggestionText(e.target.value)} className="w-full h-32 bg-slate-800 text-white p-4 rounded-xl border border-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm font-medium" placeholder="내용을 입력해주세요..." />
                <button onClick={handleSendSuggestion} className="mt-4 w-full py-3 bg-blue-600 text-white font-extrabold rounded-xl hover:bg-blue-500 transition shadow-lg">보내기 🚀</button>
            </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
          <div className="bg-slate-900 border border-white/10 w-full max-w-md h-[90vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-slide-up-modal">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-slate-900"><h3 className="font-extrabold text-lg text-white">새로운 기록 남기기 ✍️</h3><button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-full transition text-slate-400"><Icons.X /></button></div>
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-900 custom-scrollbar">
                <div className="flex bg-slate-800 p-1 rounded-xl">
                    <button onClick={() => setLogType('workout')} className={`flex-1 py-3 rounded-lg font-extrabold text-xs sm:text-sm transition ${logType === 'workout' ? 'bg-slate-700 text-blue-400 shadow-sm' : 'text-slate-500'}`}>💪 훈련</button>
                    <button onClick={() => setLogType('match')} className={`flex-1 py-3 rounded-lg font-extrabold text-xs sm:text-sm transition ${logType === 'match' ? 'bg-slate-700 text-yellow-400 shadow-sm' : 'text-slate-500'}`}>⚽ 경기</button>
                    <button onClick={() => setLogType('rehab')} className={`flex-1 py-3 rounded-lg font-extrabold text-xs sm:text-sm transition ${logType === 'rehab' ? 'bg-slate-700 text-red-400 shadow-sm' : 'text-slate-500'}`}>🏥 재활</button>
                </div>
                <div><label className="block text-sm font-bold text-slate-400 mb-1">제목</label><input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-4 bg-slate-800 text-white rounded-xl font-bold border-none focus:ring-2 focus:ring-blue-500 placeholder-slate-600" placeholder="제목 입력 (예: 조기축구, 하체훈련)" /></div>
                
                {logType === 'match' && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-yellow-500 mb-2">경기 결과</label>
                            <div className="flex gap-2">
                                <button onClick={() => setMatchResult('win')} className={`flex-1 py-2 rounded-lg font-bold border ${matchResult === 'win' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>승리</button>
                                <button onClick={() => setMatchResult('draw')} className={`flex-1 py-2 rounded-lg font-bold border ${matchResult === 'draw' ? 'bg-slate-600 text-white border-slate-500' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>무승부</button>
                                <button onClick={() => setMatchResult('lose')} className={`flex-1 py-2 rounded-lg font-bold border ${matchResult === 'lose' ? 'bg-red-600 text-white border-red-500' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>패배</button>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-bold text-yellow-500 mb-1">골 (득점)</label>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setGoals(Math.max(0, goals - 1))} className="w-8 h-8 bg-slate-800 rounded-lg text-white font-bold">-</button>
                                    <span className="text-xl font-black text-white">{goals}</span>
                                    <button onClick={() => setGoals(goals + 1)} className="w-8 h-8 bg-slate-800 rounded-lg text-white font-bold">+</button>
                                </div>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-bold text-yellow-500 mb-1">어시스트 (도움)</label>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setAssists(Math.max(0, assists - 1))} className="w-8 h-8 bg-slate-800 rounded-lg text-white font-bold">-</button>
                                    <span className="text-xl font-black text-white">{assists}</span>
                                    <button onClick={() => setAssists(assists + 1)} className="w-8 h-8 bg-slate-800 rounded-lg text-white font-bold">+</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2">장비 선택 (오늘 신은 축구화)</label>
                    <select value={selectedGearId || ''} onChange={(e) => setSelectedGearId(e.target.value || null)} className="w-full p-4 bg-slate-800 text-white rounded-xl font-bold border-none focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                        <option value="">선택 안함</option>
                        {gears.map((gear) => (<option key={gear.id} value={gear.id}>{gear.brand} {gear.name} ({gear.stud_type})</option>))}
                    </select>
                </div>

                <div><label className="block text-sm font-bold text-slate-400 mb-2">사진/영상 추가</label><div className="flex items-center gap-3"><label className="w-20 h-20 bg-slate-800 rounded-xl flex items-center justify-center cursor-pointer border-2 border-dashed border-slate-700 hover:border-blue-500 hover:bg-blue-500/10 transition overflow-hidden text-slate-500">{mediaPreview ? <img src={mediaPreview} className="w-full h-full object-cover" /> : <Icons.Camera />}<input type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} /></label><span className="text-xs text-slate-500 font-bold">{mediaFile ? "파일 선택됨 ✅" : "운동 인증샷이나 통증 부위를 찍어보세요."}</span></div></div>
                <div><label className="block text-sm font-bold text-slate-400 mb-2">관련 부위 (선택)</label><BodyMap selectedParts={selectedParts} togglePart={togglePart} type={logType === 'match' ? 'workout' : logType} /></div>
                <div><label className="block text-sm font-bold text-slate-400 mb-1">메모 / 내용</label><textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full p-4 h-32 bg-slate-800 text-white rounded-xl border-none focus:ring-2 focus:ring-blue-500 resize-none placeholder-slate-600" placeholder="경기 내용이나 특이사항을 적어주세요." /></div>
                <div><div className="flex justify-between mb-2"><span className="font-bold text-slate-400">{logType === 'rehab' ? '통증 점수' : '훈련 강도 (RPE)'}</span><span className={`font-black text-xl ${score > 7 ? 'text-red-500' : 'text-blue-500'}`}>{score}</span></div><input type="range" min="0" max="10" value={score} onChange={(e) => setScore(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" /></div>
                <div className="flex items-center gap-3 p-4 bg-slate-800 rounded-xl border border-white/5"><input type="checkbox" id="public" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="w-5 h-5 rounded text-blue-600 bg-slate-700 border-slate-600 focus:ring-blue-500"/><label htmlFor="public" className="text-sm font-bold text-slate-300 cursor-pointer">광장에 자랑하기 (공개)</label></div>
            </div>
            <div className="p-4 border-t border-white/5 bg-slate-900"><button onClick={handleAddLog} disabled={uploading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:bg-blue-500 transition disabled:opacity-50">{uploading ? '저장 중...' : '기록 저장 완료 ✨'}</button></div>
          </div>
        </div>
      )}

      {/* 🚨 업그레이드된 약관 및 정책 모달 */}
      {isDisclaimerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setIsDisclaimerOpen(false)}>
            <div className="bg-slate-900 border border-white/10 w-full max-w-md max-h-[85vh] overflow-y-auto rounded-3xl p-6 shadow-2xl relative custom-scrollbar" onClick={e => e.stopPropagation()}>
                <button onClick={() => setIsDisclaimerOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition"><Icons.X /></button>
                
                <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
                    📜 이용약관 및 정책
                </h3>
                
                <div className="space-y-6 text-sm text-slate-300 leading-relaxed pb-4">
                    <div className="bg-red-500/10 p-5 rounded-2xl border border-red-500/20">
                        <h4 className="font-black text-red-400 mb-2 flex items-center gap-2"><Icons.AlertCircle /> 의학적 면책 공지</h4>
                        <p className="text-slate-200 text-xs font-bold leading-relaxed">
                            본 서비스(MOVEPLAZA)가 제공하는 자가 진단, AI 분석 결과 및 재활 팁은 사용자의 주관적 데이터를 바탕으로 한 <span className="text-red-400 font-black">단순 참고용 정보</span>입니다. 어떠한 경우에도 전문 의료 기관의 진단, 처방 및 치료를 대신할 수 없으며, 본 앱의 정보를 바탕으로 취한 행동에 대한 법적 책임은 사용자 본인에게 있습니다. 심각한 통증이나 부상이 의심될 경우 반드시 의사와 상담하십시오.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h4 className="font-black text-white flex items-center gap-2"><Icons.Shield /> 광장(커뮤니티) 이용 규칙</h4>
                        <ul className="list-disc pl-5 text-xs text-slate-400 font-bold space-y-1.5">
                            <li>모든 공개 게시물 및 업로드된 미디어(사진/영상)에 대한 법적 책임은 <span className="text-white">작성자 본인</span>에게 있습니다.</li>
                            <li>타인을 비방하거나 욕설, 혐오 표현을 포함한 글은 무통보 삭제될 수 있습니다.</li>
                            <li><span className="text-blue-400">AI 기반 이미지 필터링 시스템</span>이 작동 중이며, 선정적이거나 부적절한 이미지 업로드 시도 시 계정 이용이 영구 정지될 수 있습니다.</li>
                            <li>유저 신고가 3회 이상 누적된 게시물은 자동으로 블라인드(숨김) 처리됩니다.</li>
                        </ul>
                    </div>

                    <div className="space-y-2 border-t border-white/10 pt-4">
                        <h4 className="font-black text-white">데이터 보관 및 파기</h4>
                        <p className="text-xs text-slate-400 font-bold leading-relaxed">
                            사용자가 회원 탈퇴를 요청할 경우, 기록된 모든 훈련 데이터, 프로필, 전술판 설정 및 커뮤니티 게시물은 즉각적으로 DB에서 <span className="text-red-400 font-black">영구 삭제</span>되며 복구할 수 없습니다. 
                        </p>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 sticky bottom-0 bg-slate-900">
                    <button onClick={() => setIsDisclaimerOpen(false)} className="w-full py-4 bg-blue-600 text-white font-extrabold rounded-xl hover:bg-blue-500 transition shadow-lg">
                        위 내용을 모두 확인 및 동의합니다
                    </button>
                </div>
            </div>
        </div>
      )}

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
                    {Number(analysisData.avgPain) >= 8 && (
                        <a href="https://map.naver.com/p/search/정형외과" target="_blank" rel="noreferrer" className="block w-full py-3 mt-2 bg-red-600 hover:bg-red-500 text-white font-bold text-center rounded-xl animate-pulse shadow-lg transition flex items-center justify-center gap-2">
                            <Icons.Map /> 🏥 근처 정형외과 찾기 (네이버)
                        </a>
                    )}
                    <button onClick={() => { setIsAnalysisOpen(false); setIsDisclaimerOpen(true); }} className="text-[10px] text-slate-500 underline text-center w-full hover:text-slate-300 mt-2">⚠️ 분석 결과는 의료적 진단이 아닙니다. (면책 조항 보기)</button>
                </div>
                <button onClick={() => setIsAnalysisOpen(false)} className="mt-4 w-full py-3 bg-slate-800 text-white border border-white/10 font-bold rounded-xl hover:bg-slate-700 transition">닫기</button>
            </div>
        </div>
      )}
      
      <BottomNav />
    </div>
  )
}