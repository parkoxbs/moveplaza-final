"use client"

import { useEffect, useState, useRef } from "react"
import { createBrowserClient } from "@supabase/ssr"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast, { Toaster } from 'react-hot-toast'
import 'react-calendar/dist/Calendar.css'
import { LineChart, Line, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend } from 'recharts'
import { toPng } from 'html-to-image'
import jsPDF from 'jspdf'
import BodyMap from "..//components/BodyMap"
import { motion, AnimatePresence } from "framer-motion"
import confetti from 'canvas-confetti'
import BottomNav from "..//components/BottomNav"

const supabaseUrl = "https://okckpesbufkqhmzcjiab.supabase.co"
const supabaseKey = "sb_publishable_G_y2dTmNj9nGIvu750MlKQ_jjjgxu-t"

const supabase = createBrowserClient(supabaseUrl, supabaseKey)

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
  Info: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>,
  Copy: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Map: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
  MessageSquare: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
  Bulb: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>,
  Star: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Trophy: () => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>,
  Ball: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/><path d="M12 12 4.93 4.93"/><path d="M19.07 4.93 12 12"/><path d="M12 12v10"/><path d="M12 2v10"/></svg>
}

// 레벨 시스템 정의
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
  "💊 통증 점수 5점 이상이면 '근성'이 아니라 '미련'입니다. 즉시 운동을 멈추세요.",
  "💧 근육 경련이 자주 난다면 마그네슘 부족일 수 있습니다. 물과 이온음료를 충분히 드세요.",
  "🏋️‍♂️ 스쿼트 할 때 무릎 소리가 나면서 아프다면? 자세보다 고관절 유연성부터 체크해보세요.",
  "🛌 잠이 보약입니다. 근육은 헬스장이 아니라 침대에서 자랍니다. 7시간 이상 주무세요!",
  "🧊 운동 직후 붓기가 있다면 온찜질 절대 금지! 혈관이 확장되어 붓기가 더 심해집니다.",
  "🧘 허리가 아플 땐 윗몸일으키기 금지! 플랭크나 버드독 같은 코어 운동을 하세요."
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

// 스켈레톤 로딩 UI
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
  
  const reportRef = useRef<HTMLDivElement>(null)
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
    
    if (!user) { 
        router.replace('/login'); 
        return; 
    }

    const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single()
    setUserName(profile?.username || user.email?.split("@")[0] || "선수")
    
    const { data: logData } = await supabase.from('logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    const { data: condData } = await supabase.from('daily_conditions').select('*').eq('user_id', user.id).order('created_at', { ascending: true })
    
    const { data: gearData } = await supabase.from('gears').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (gearData) setGears(gearData);

    if (logData) { 
        setLogs(logData);
        const newLevel = getLevel(logData.length);
        
        if (!isFirstLoad && prevLevelName && newLevel.name !== prevLevelName) {
            setIsLevelUpCelebrationOpen(true);
            triggerConfetti(); 
        }
        setMyLevel(newLevel);
        setPrevLevelName(newLevel.name);

        calculateStreak(logData); 
        analyzeLogs(logData); 
        calculateStats(logData); 
        processChartData(logData, condData || []);
        
        const matches = logData.filter(l => l.log_type === 'match');
        const win = matches.filter(l => l.match_result === 'win').length;
        const draw = matches.filter(l => l.match_result === 'draw').length;
        const lose = matches.filter(l => l.match_result === 'lose').length;
        const totalGoals = matches.reduce((acc, l) => acc + (l.goals || 0), 0);
        const totalAssists = matches.reduce((acc, l) => acc + (l.assists || 0), 0);
        setMatchStats({ win, draw, lose, goals: totalGoals, assists: totalAssists, total: matches.length });
    }
    
    const today = new Date().toISOString().split('T')[0]
    const { data: todayCond } = await supabase.from('daily_conditions').select('*').eq('user_id', user.id).gte('created_at', `${today}T00:00:00`).limit(1)
    if (todayCond && todayCond.length > 0) setTodayCondition(todayCond[0].status)
    setLoading(false)
  }

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
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
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
    });

    const processed = last7Days.map(date => {
        const dayLogs = logs.filter(l => l.created_at.startsWith(date));
        const avgScore = dayLogs.length > 0 
            ? dayLogs.reduce((acc, cur) => acc + cur.pain_score, 0) / dayLogs.length 
            : 0;

        const dayCond = conditions.filter(c => c.created_at.startsWith(date)).pop();
        let condScore = 0; 
        if (dayCond) {
            if (dayCond.status === 'good') condScore = 10;
            else if (dayCond.status === 'normal') condScore = 6;
            else if (dayCond.status === 'bad') condScore = 3;
        }

        return {
            date: date.slice(5),
            score: Number(avgScore.toFixed(1)),
            condition: condScore
        };
    });

    setChartData(processed);
  };

  const calculateStats = (data: any[]) => {
    if (!data || data.length === 0) {
        setStats([
            { subject: '열정', A: 20, fullMark: 100 },
            { subject: '강도', A: 20, fullMark: 100 },
            { subject: '활동량', A: 20, fullMark: 100 },
            { subject: '밸런스', A: 20, fullMark: 100 },
            { subject: '관리', A: 20, fullMark: 100 },
            { subject: '컨디션', A: 20, fullMark: 100 },
        ]);
        return;
    }
    const uniqueDays = new Set(data.map(l => new Date(l.created_at).toDateString())).size;
    const consistency = Math.min(uniqueDays * 5, 100); 
    
    const workoutLogs = data.filter(l => l.log_type === 'workout' || l.log_type === 'match');
    const avgScore = workoutLogs.length > 0 
        ? workoutLogs.reduce((acc, cur) => acc + cur.pain_score, 0) / workoutLogs.length 
        : 0;
    const intensity = Math.min(avgScore * 12, 100);

    const volume = Math.min(data.length * 2, 100);
    const usedParts = new Set();
    data.forEach(l => {
        const match = (l.content || '').match(/^\[(.*?)\]/);
        if(match) match[1].split(', ').forEach((p: string) => usedParts.add(p));
    });
    const balance = Math.min(usedParts.size * 8, 100);
    const rehabCount = data.filter(l => l.log_type === 'rehab').length;
    const rehabRatio = rehabCount / data.length;
    let care = 50;
    if (rehabRatio > 0 && rehabRatio < 0.4) care = 95; 
    else if (rehabRatio === 0) care = 60; 
    else care = 80; 
    const physical = 75 + (data.length > 5 ? 10 : 0);

    setStats([
        { subject: '열정', full: '꾸준함', A: consistency, fullMark: 100 },
        { subject: '강도', full: '평균강도', A: intensity, fullMark: 100 },
        { subject: '활동량', full: '총볼륨', A: volume, fullMark: 100 },
        { subject: '밸런스', full: '다양성', A: balance, fullMark: 100 },
        { subject: '관리', full: '부상방지', A: care, fullMark: 100 },
        { subject: '컨디션', full: '신체상태', A: physical, fullMark: 100 },
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
        if (Number(avgPain) >= 8) {
            advice = "🚨 평균 통증 점수가 매우 높습니다! 무리한 운동은 멈추고, 전문 의료기관 방문을 강력히 권장합니다.";
        } else if (Number(avgPain) >= 5) {
            advice = "⚠️ 통증이 지속되고 있습니다. 운동 강도를 낮추고 충분한 휴식과 스트레칭이 필요합니다.";
        } else if (worstPart.includes("무릎")) {
            advice = "🦵 무릎에 부하가 많이 가고 있네요. 대퇴사두근 강화 운동과 햄스트링 스트레칭을 루틴에 추가해보세요.";
        } else if (worstPart.includes("허리")) {
            advice = "🧘 허리가 불편하시군요. 코어 운동(플랭크, 버드독)을 강화하고, 허리를 과하게 꺾는 동작은 피하세요.";
        } else if (worstPart.includes("발목")) {
            advice = "🦶 발목 불안정성이 의심됩니다. 밸런스 운동과 밴드를 이용한 발목 강화 운동이 도움됩니다.";
        } else if (worstPart.includes("어깨")) {
            advice = "🙆‍♂️ 어깨 충돌을 조심하세요. 회전근개 강화와 흉추 가동성 운동을 추천합니다.";
        }
    } else {
        advice = "🔥 부상 기록이 없습니다! 아주 훌륭합니다. 이대로 꾸준히 득근하세요!";
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
    setTitle(log.title || ''); 
    setScore(log.pain_score);
    setLogType(log.log_type);
    
    if (log.log_type === 'match') {
        setGoals(log.goals || 0);
        setAssists(log.assists || 0);
        setMatchResult(log.match_result || 'none');
    }

    const contentText = (log.content || '') as string;
    const match = contentText.match(/^\[([^\]]*)\]\s*([\s\S]*)/);
    if (match) {
        const parts = match[1].split(', ');
        setSelectedParts(parts);
        setContent(match[2]);
    } else {
        setContent(contentText);
        setSelectedParts([]);
    }
    setIsModalOpen(true);
    toast.success("기록을 복사했습니다! (날짜는 오늘)");
  };

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
        
        const { error } = await supabase.from('logs').insert({ 
            user_id: user.id, 
            title, 
            content: partsString + content, 
            pain_score: score, 
            log_type: logType, 
            is_public: isPublic, 
            image_url: mediaUrl, 
            media_type: mediaType, 
            created_at: new Date().toISOString(),
            goals: logType === 'match' ? goals : 0,
            assists: logType === 'match' ? assists : 0,
            match_result: logType === 'match' ? matchResult : 'none',
            gear_id: selectedGearId
        })
        if (error) throw error;
        toast.success("기록 저장 완료! 🎉"); 
        setIsModalOpen(false); 
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
    const { error } = await supabase.from('suggestions').insert({ content: suggestionText });
    if(error) {
        toast.error("전송 실패 ㅠ", { id: t });
    } else {
        toast.success("소중한 의견 감사합니다! 💌", { id: t });
        setSuggestionText("");
        setIsSuggestionOpen(false);
    }
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

  // 👇 [최종 수정] 매거진 커버 스타일 (중앙 비우고 하단 집중)
  const handleShareClick = async (log: any) => {
    setShareData(log)
    const t = toast.loading("카드 디자인 중... 🎨")
    
    setTimeout(async () => {
      if (shareCardRef.current) {
        try {
          const dataUrl = await toPng(shareCardRef.current, { 
            cacheBust: true, 
            pixelRatio: 2, 
            backgroundColor: '#0f172a',
            skipAutoScale: true
          })
          
          const link = document.createElement('a');
          link.download = `moveplaza_poster_${Date.now()}.png`;
          link.href = dataUrl;
          link.click();
          
          toast.success("저장 완료! 📸", { id: t });
        } catch (error) { 
          console.error(error); 
          toast.error("저장 실패 ㅠ 다시 시도해주세요.", { id: t }); 
        }
        setShareData(null); 
      } else {
        toast.error("오류: 카드를 찾을 수 없습니다.", { id: t });
      }
    }, 1500); 
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

  const getFilteredRehabLogs = () => {
    const now = new Date();
    return logs.filter(log => {
      if (log.log_type !== 'rehab') return false;
      const logDate = new Date(log.created_at);
      if (heatmapRange === 'all') return true;
      const cutoff = new Date();
      if (heatmapRange === '1w') cutoff.setDate(now.getDate() - 7);
      else if (heatmapRange === '1m') cutoff.setMonth(now.getMonth() - 1);
      else if (heatmapRange === '6m') cutoff.setMonth(now.getMonth() - 6);
      else if (heatmapRange === '1y') cutoff.setFullYear(now.getFullYear() - 1);
      return logDate >= cutoff;
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
      
      {/* 👇 [최종 수정] 매거진 커버 스타일 (중앙 비우고 하단 집중) */}
      {shareData && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-[-50] opacity-100 pointer-events-none">
          <div ref={shareCardRef} className="w-[450px] h-[650px] relative bg-slate-950 overflow-hidden font-sans">
            
            {/* 1. 배경 이미지 (전체 화면 꽉 채움) */}
            {shareData.image_url ? (
              <>
                <img src={shareData.image_url} className="absolute inset-0 w-full h-full object-cover z-0" crossOrigin="anonymous" alt="배경" />
                {/* 하단 그라데이션 (글씨 잘 보이게) */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30 z-0"></div>
              </>
            ) : (
              // 이미지가 없을 때의 대체 배경
              <div className={`absolute inset-0 w-full h-full bg-gradient-to-br ${shareData.log_type === 'match' ? 'from-yellow-900 to-slate-950' : (shareData.log_type === 'rehab' ? 'from-red-900 to-slate-950' : 'from-blue-900 to-slate-950')} z-0`}>
                  {/* 거대한 배경 텍스트 패턴 */}
                  <div className="absolute inset-0 flex flex-col justify-center items-center opacity-10 select-none">
                      {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-9xl font-black italic tracking-tighter text-white leading-none">
                              {shareData.log_type === 'match' ? 'MATCH' : (shareData.log_type === 'rehab' ? 'REHAB' : 'WORKOUT')}
                          </span>
                      ))}
                  </div>
              </div>
            )}

            {/* 2. 상단 바 (로고 & 날짜) */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
                <div className="flex items-center gap-2">
                    <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-lg border border-white/10">
                        <span className="font-black text-white text-lg">M</span>
                    </div>
                    <span className="font-black text-white tracking-widest text-xs drop-shadow-md">MOVEPLAZA</span>
                </div>
                <span className="text-white/90 font-bold text-sm bg-black/30 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                    {new Date(shareData.created_at).toLocaleDateString()}
                </span>
            </div>

            {/* 3. 하단 정보 영역 (핵심 정보 몰아넣기) */}
            <div className="absolute bottom-0 left-0 w-full p-8 z-10 flex flex-col gap-2">
                
                {/* 뱃지 */}
                <div className="self-start px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-[10px] font-black text-white uppercase tracking-widest mb-2 shadow-lg">
                    {shareData.log_type === 'workout' ? '⚡ TRAINING SESSION' : (shareData.log_type === 'match' ? '⚽ MATCH DAY' : '❤️‍🩹 RECOVERY')}
                </div>

                {/* 제목 & 내용 */}
                <div className="mb-4">
                     <h1 className="text-4xl font-black text-white leading-none mb-2 line-clamp-2 drop-shadow-xl uppercase italic tracking-tight">
                         {shareData.title}
                     </h1>
                     <p className="text-white/80 text-sm font-medium line-clamp-2 drop-shadow-md max-w-[80%]">
                         {shareData.content}
                     </p>
                </div>

                {/* 하단 스탯 (우측 하단에 크게 배치) */}
                <div className="border-t border-white/30 pt-4 flex justify-between items-end">
                    <div className="flex flex-col gap-1 opacity-70">
                        <span className="text-[9px] font-mono tracking-widest text-white">ATHLETE DATA RECORD</span>
                        {/* 바코드 */}
                        <div className="flex gap-[2px] h-4 items-end">
                            {[...Array(20)].map((_, i) => (
                                <div key={i} className={`bg-white w-[2px] ${Math.random() > 0.5 ? 'h-full' : 'h-1/2'}`}></div>
                            ))}
                        </div>
                    </div>

                    {/* 메인 스코어/결과 */}
                    <div className="text-right">
                        {shareData.log_type === 'match' ? (
                            <div>
                                <span className={`text-5xl font-black italic tracking-tighter drop-shadow-2xl ${shareData.match_result === 'win' ? 'text-blue-400' : (shareData.match_result === 'lose' ? 'text-red-400' : 'text-slate-200')}`}>
                                    {shareData.match_result === 'win' ? 'WIN' : (shareData.match_result === 'lose' ? 'LOSE' : 'DRAW')}
                                </span>
                                <div className="text-white font-bold text-lg mt-[-5px]">
                                    {shareData.goals}G {shareData.assists}A
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-end justify-end leading-none">
                                <span className="text-[80px] font-black text-white tracking-tighter drop-shadow-2xl">
                                    {shareData.pain_score}
                                </span>
                                <span className="text-2xl font-bold text-white/60 mb-3 ml-1">/10</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

          </div>
        </div>
      )}

      {/* ✅ 헤더 수정: 상단 메뉴 삭제 (하단바로 이동) */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/5 transition-all">
        <div className="max-w-md mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}><div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-[0_0_15px_rgba(37,99,235,0.5)]">M</div><span className="text-xl font-black tracking-tight text-white">MOVEPLAZA</span></div>
        </div>
      </header>

      {loading ? (
        <main className="max-w-md mx-auto px-5 pt-8 pb-32">
            <DashboardSkeleton />
        </main>
      ) : (
        <main className="max-w-md mx-auto px-5 pt-8 space-y-8 animate-slide-up bg-slate-950" ref={reportRef}>
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
                    <button onClick={() => setIsAnalysisOpen(true)} className="bg-slate-800 border border-white/10 text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-700 transition flex items-center gap-1"><Icons.Chart /> AI 분석</button>
                </div>
            </section>

            {/* 🆕 1번: 경기 스탯 카드 (기록이 있을 때만 보임) */}
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

            {/* 👇 기존 라인업 빌더 버튼 */}
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

            {/* 👇 [여기!] 자가 체크 버튼 추가 */}
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
                <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl p-5 border border-white/5 flex items-center justify-between">
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

            {/* 레이더 차트 등 다른 섹션들은 그대로 유지... */}
            {logs.length > 0 && (
                <section className="bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 border border-white/5 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-black text-white">나의 선수 스탯 ⚽</h3>
                        <span className="text-xs font-bold text-slate-500 bg-slate-800 px-2 py-1 rounded-lg">LIVE</span>
                    </div>
                    <div className="h-64 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats}>
                                <PolarGrid stroke="#334155" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="My Stats" dataKey="A" stroke="#3b82f6" strokeWidth={3} fill="#3b82f6" fillOpacity={0.5} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#60a5fa' }} formatter={(val, name, props) => [val, props.payload.full]} labelStyle={{display: 'none'}} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </section>
            )}

            <section className="bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 border border-white/5 relative overflow-hidden transition-all">
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

            <section className="bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-white/5">
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
                <div className="flex justify-between items-center mb-4 px-1"><h3 className="text-xl font-black text-white">{selectedDate ? `${selectedDate.getMonth()+1}월 ${selectedDate.getDate()}일 기록` : '최근 활동'}</h3><div className="flex gap-2"><button onClick={handleDownloadPDF} className="text-xs bg-slate-800 border border-white/10 text-slate-300 px-2 py-1 rounded-lg font-bold hover:bg-slate-700">📄 리포트 저장</button>{selectedDate && <button onClick={() => setSelectedDate(null)} className="text-xs bg-slate-700 text-white px-2 py-1 rounded-lg font-bold">전체보기</button>}</div></div>
                <div className="space-y-3">{filteredLogs.length === 0 ? (<div className="text-center py-12 bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-800"><p className="text-slate-500 font-bold text-sm">기록이 없습니다.</p><button onClick={() => setIsModalOpen(true)} className="mt-4 text-blue-400 font-black text-sm hover:underline">+ 첫 기록 남기기</button></div>) : (filteredLogs.slice(0, 10).map((log) => { 
                    const isWorkout = log.log_type === 'workout' || log.log_type === 'match'; 
                    // 🆕 로그 리스트에 경기 정보 표시
                    const isMatch = log.log_type === 'match';
                    
                    return (<div key={log.id} className="bg-slate-900/50 backdrop-blur-sm p-5 rounded-2xl border border-white/5 flex items-center justify-between transition hover:bg-slate-800 cursor-default group">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 border border-white/5 ${isMatch ? 'bg-yellow-500/10 text-yellow-400' : (isWorkout ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400')}`}>
                                {log.image_url ? <img src={log.image_url} alt="인증" className="w-full h-full object-cover" /> : (isMatch ? <Icons.Trophy /> : (isWorkout ? <Icons.Activity /> : <Icons.AlertCircle />))}
                            </div>
                            <div>
                                <div className="font-black text-white text-sm mb-0.5">{log.title}</div>
                                <div className="text-xs font-bold text-slate-500 line-clamp-1">
                                    {isMatch ? `⚽ ${log.goals}골 ${log.assists}어시 (${log.match_result === 'win' ? '승' : (log.match_result === 'lose' ? '패' : '무')})` : log.content}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3"><button onClick={() => handleCopyLog(log)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-green-500 hover:bg-green-500/10 rounded-full transition" title="복사해서 쓰기"><Icons.Copy /></button><button onClick={() => handleShareClick(log)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-pink-500 hover:bg-pink-500/10 rounded-full transition"><Icons.Share /></button><button onClick={() => handleDeleteLog(log.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition"><Icons.Trash /></button><div className="text-right"><div className={`font-black text-lg ${log.pain_score > 7 ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'text-white'}`}>{log.pain_score}</div><div className="text-[10px] font-bold text-slate-500">점</div></div></div></div>) }))}</div>
            </section>

            <section className="mt-8 mb-4 text-center">
                <button onClick={() => setIsDisclaimerOpen(true)} className="text-[10px] text-slate-600 font-bold hover:text-slate-400 flex items-center justify-center gap-1 mx-auto transition"><Icons.Info /> 서비스 이용 약관 및 면책 조항</button>
                <span className="text-slate-700 text-[10px] mx-2">|</span>
                <button onClick={() => setIsSuggestionOpen(true)} className="text-[10px] text-slate-500 font-bold hover:text-blue-400 flex items-center justify-center gap-1 transition"><Icons.MessageSquare /> 개발자에게 건의하기</button>
            </section>
        </main>
      )}

      {/* 👇 [수정됨] 기록 추가 버튼 위치를 하단바 위로 조정 (bottom-28) */}
      <div className="fixed bottom-28 right-6 z-40"><button onClick={() => setIsModalOpen(true)} className="w-16 h-16 bg-blue-600 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.6)] flex items-center justify-center text-white hover:bg-blue-500 transition transform hover:scale-110 active:scale-95"><Icons.Plus /></button></div>
      
      {/* 모달 등 하단 UI는 그대로 유지 */}
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
      
      {/* 등급 가이드 모달 */}
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

      {/* 기록 추가 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
          <div className="bg-slate-900 border border-white/10 w-full max-w-md h-[90vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-slide-up-modal">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-slate-900"><h3 className="font-extrabold text-lg text-white">새로운 기록 남기기 ✍️</h3><button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-full transition text-slate-400"><Icons.X /></button></div>
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-900">
               
               {/* 🆕 탭 3개로 변경됨 */}
               <div className="flex bg-slate-800 p-1 rounded-xl">
                   <button onClick={() => setLogType('workout')} className={`flex-1 py-3 rounded-lg font-extrabold text-xs sm:text-sm transition ${logType === 'workout' ? 'bg-slate-700 text-blue-400 shadow-sm' : 'text-slate-500'}`}>💪 운동</button>
                   <button onClick={() => setLogType('match')} className={`flex-1 py-3 rounded-lg font-extrabold text-xs sm:text-sm transition ${logType === 'match' ? 'bg-slate-700 text-yellow-400 shadow-sm' : 'text-slate-500'}`}>⚽ 경기</button>
                   <button onClick={() => setLogType('rehab')} className={`flex-1 py-3 rounded-lg font-extrabold text-xs sm:text-sm transition ${logType === 'rehab' ? 'bg-slate-700 text-red-400 shadow-sm' : 'text-slate-500'}`}>🏥 재활</button>
               </div>

               <div><label className="block text-sm font-bold text-slate-400 mb-1">제목</label><input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-4 bg-slate-800 text-white rounded-xl font-bold border-none focus:ring-2 focus:ring-blue-500 placeholder-slate-600" placeholder="제목 입력 (예: 조기축구, 하체운동)" /></div>
               
               {/* 🆕 경기(Match) 탭일 때만 보이는 입력창 */}
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

               {/* 🆕 장비 선택 (모든 탭에서 보임) */}
               <div>
                   <label className="block text-sm font-bold text-slate-400 mb-2">장비 선택 (오늘 신은 축구화)</label>
                   <select 
                        value={selectedGearId || ''} 
                        onChange={(e) => setSelectedGearId(e.target.value || null)} 
                        className="w-full p-4 bg-slate-800 text-white rounded-xl font-bold border-none focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                   >
                       <option value="">선택 안함</option>
                       {gears.map((gear) => (
                           <option key={gear.id} value={gear.id}>
                               {gear.brand} {gear.name} ({gear.stud_type})
                           </option>
                       ))}
                   </select>
               </div>

               <div><label className="block text-sm font-bold text-slate-400 mb-2">사진/영상 추가</label><div className="flex items-center gap-3"><label className="w-20 h-20 bg-slate-800 rounded-xl flex items-center justify-center cursor-pointer border-2 border-dashed border-slate-700 hover:border-blue-500 hover:bg-blue-500/10 transition overflow-hidden text-slate-500">{mediaPreview ? <img src={mediaPreview} className="w-full h-full object-cover" /> : <Icons.Camera />}<input type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} /></label><span className="text-xs text-slate-500 font-bold">{mediaFile ? "파일 선택됨 ✅" : "운동 인증샷이나 통증 부위를 찍어보세요."}</span></div></div>
               
               <div>
                 <label className="block text-sm font-bold text-slate-400 mb-2">관련 부위 (선택)</label>
                 <BodyMap selectedParts={selectedParts} togglePart={togglePart} type={logType === 'match' ? 'workout' : logType} />
               </div>

               <div><label className="block text-sm font-bold text-slate-400 mb-1">메모 / 내용</label><textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full p-4 h-32 bg-slate-800 text-white rounded-xl border-none focus:ring-2 focus:ring-blue-500 resize-none placeholder-slate-600" placeholder="경기 내용이나 특이사항을 적어주세요." /></div>
               <div><div className="flex justify-between mb-2"><span className="font-bold text-slate-400">{logType === 'rehab' ? '통증 점수' : '운동 강도 (RPE)'}</span><span className={`font-black text-xl ${score > 7 ? 'text-red-500' : 'text-blue-500'}`}>{score}</span></div><input type="range" min="0" max="10" value={score} onChange={(e) => setScore(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" /></div>
               <div className="flex items-center gap-3 p-4 bg-slate-800 rounded-xl border border-white/5"><input type="checkbox" id="public" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="w-5 h-5 rounded text-blue-600 bg-slate-700 border-slate-600"/><label htmlFor="public" className="text-sm font-bold text-slate-300 cursor-pointer">광장에 자랑하기 (공개)</label></div>
            </div>
            <div className="p-4 border-t border-white/5 bg-slate-900"><button onClick={handleAddLog} disabled={uploading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:bg-blue-500 transition disabled:opacity-50">{uploading ? '저장 중...' : '기록 저장 완료 ✨'}</button></div>
          </div>
        </div>
      )}

      {/* 면책/분석 등 나머지 모달 유지 */}
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
      
      {/* 👇 [추가] 하단 탭바 (Fixed Bottom Nav) */}
      <BottomNav />
    </div>
  )
}