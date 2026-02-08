'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from "@supabase/supabase-js"; 
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { toPng } from 'html-to-image';
import toast, { Toaster } from 'react-hot-toast';

// 👇 1. Supabase 주소와 키 입력
const supabaseUrl = "https://okckpesbufkqhmzcjiab.supabase.co"
const supabaseKey = "sb_publishable_G_y2dTmNj9nGIvu750MlKQ_jjjgxu-t"
const supabase = createClient(supabaseUrl, supabaseKey)

// 아이콘
const Icons = {
  Download: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>,
  ArrowLeft: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>,
  Siren: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 12a5 5 0 0 1 5-5v0a5 5 0 0 1 5 5v6H7v-6Z"/><path d="M5 20a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2H5v-2Z"/><path d="M21 12h1"/><path d="M18.5 4.5 18 5"/><path d="M2 12h1"/><path d="M12 2v1"/><path d="m4.929 4.929.707.707"/><path d="M12 7v5"/></svg>
}

export default function StatsPage() {
  const router = useRouter();
  const reportRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [injuryData, setInjuryData] = useState<any[]>([]);
  const [ratioData, setRatioData] = useState<any[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [worstPart, setWorstPart] = useState("");

  useEffect(() => {
    fetchGlobalData();
  }, []);

  const fetchGlobalData = async () => {
    // 🌍 모든 유저의 기록을 가져옴 (보안상 민감한 정보는 제외하고 통계만 냄)
    const { data: allLogs } = await supabase.from('logs').select('log_type, content, pain_score');
    
    if (allLogs) {
        setTotalLogs(allLogs.length);
        processInjuryData(allLogs);
        processRatioData(allLogs);
    }
    setLoading(false);
  };

  const processInjuryData = (logs: any[]) => {
    const rehabLogs = logs.filter(l => l.log_type === 'rehab');
    const partCounts: {[key: string]: number} = {};

    rehabLogs.forEach(log => {
        const match = (log.content || '').match(/^\[(.*?)\]/);
        if (match) {
            match[1].split(', ').forEach((p: string) => {
                partCounts[p] = (partCounts[p] || 0) + 1;
            });
        }
    });

    // Top 5 정렬
    const sorted = Object.entries(partCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

    setInjuryData(sorted);
    if (sorted.length > 0) setWorstPart(sorted[0].name);
  };

  const processRatioData = (logs: any[]) => {
    const workout = logs.filter(l => l.log_type === 'workout').length;
    const rehab = logs.filter(l => l.log_type === 'rehab').length;
    setRatioData([
        { name: '득근 (운동)', value: workout, color: '#3b82f6' },
        { name: '재활 (통증)', value: rehab, color: '#ef4444' },
    ]);
  };

  const handleShare = async () => {
    if (!reportRef.current) return;
    const t = toast.loading("이미지 생성 중...");
    try {
        const dataUrl = await toPng(reportRef.current, { cacheBust: true, pixelRatio: 2, backgroundColor: '#0f172a' });
        const link = document.createElement('a');
        link.download = 'moveplaza_trend.png';
        link.href = dataUrl;
        link.click();
        toast.success("저장 완료! 인스타에 공유해보세요 📸", { id: t });
    } catch (e) {
        toast.error("저장 실패", { id: t });
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-bold">데이터 분석 중... 📊</div>;

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white pb-20">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1e293b', color: '#fff' } }} />
      
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/5 p-4 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-white"><Icons.ArrowLeft /></button>
        <span className="font-black text-lg">Moveplaza Data Lab 🧪</span>
        <div className="w-6"></div> 
      </header>

      <main className="max-w-md mx-auto p-6 space-y-8 animate-slide-up">
        
        <div className="text-center space-y-2">
            <h1 className="text-2xl font-extrabold">전체 유저 부상 리포트</h1>
            <p className="text-slate-400 text-sm font-medium">현재 총 <span className="text-blue-500 font-bold">{totalLogs}</span>개의 데이터가 분석되었습니다.</p>
        </div>

        {/* 📸 캡처 영역 시작 */}
        <div ref={reportRef} className="space-y-6 bg-slate-950 p-4 rounded-3xl border border-transparent">
            
            {/* 1. 부상 랭킹 차트 */}
            <section className="bg-slate-900 border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 rounded-full blur-[80px] opacity-20 -mr-10 -mt-10 pointer-events-none"></div>
                <h3 className="text-lg font-black mb-1 flex items-center gap-2">🚨 최다 부상 부위 TOP 5</h3>
                <p className="text-xs text-slate-400 mb-6">유저들이 가장 많이 호소한 통증 부위입니다.</p>
                
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={injuryData} layout="vertical" margin={{ left: 10, right: 10 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={60} tick={{ fill: '#fff', fontWeight: 'bold', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                            <Bar dataKey="count" barSize={24} radius={[0, 12, 12, 0]}>
                                {injuryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : index === 1 ? '#f97316' : '#3b82f6'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* 2. 인사이트 카드 */}
            <section className="bg-gradient-to-br from-blue-900/50 to-slate-900 border border-blue-500/30 rounded-3xl p-6 text-center shadow-lg">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white mb-4 shadow-lg animate-pulse">
                    <Icons.Siren />
                </div>
                <h3 className="text-xl font-black text-white mb-2">이번 주 주의보: <span className="text-yellow-400 underline decoration-4 decoration-yellow-400/30">{worstPart}</span></h3>
                <p className="text-sm text-slate-300 font-medium leading-relaxed">
                    현재 가장 많은 유저들이 <strong>'{worstPart}'</strong> 통증을 기록했습니다.<br/>
                    운동 전 충분한 스트레칭과 보호대 착용을 권장합니다!
                </p>
                <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Moveplaza Official Analysis</p>
                </div>
            </section>

            {/* 3. 운동 vs 재활 비율 */}
            <section className="bg-slate-900 border border-white/10 rounded-3xl p-6 flex items-center justify-between">
                <div>
                    <h3 className="font-black text-white mb-1">운동 vs 재활 비율</h3>
                    <p className="text-xs text-slate-400">우리 유저들의 활동 성향</p>
                    <div className="mt-4 space-y-1">
                        {ratioData.map((entry, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs font-bold">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                                <span className="text-slate-300">{entry.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="w-32 h-32 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={ratioData} innerRadius={25} outerRadius={50} paddingAngle={5} dataKey="value">
                                {ratioData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-xl font-black text-white">VS</span>
                    </div>
                </div>
            </section>

        </div>
        {/* 📸 캡처 영역 끝 */}

        <button 
            onClick={handleShare}
            className="w-full py-4 bg-white text-slate-900 font-extrabold rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-slate-200 transition flex items-center justify-center gap-2"
        >
            <Icons.Download /> 이미지로 저장하기 (인스타 공유)
        </button>

      </main>
    </div>
  );
}