'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

const supabaseUrl = "https://okckpesbufkqhmzcjiab.supabase.co"
const supabaseKey = "sb_publishable_G_y2dTmNj9nGIvu750MlKQ_jjjgxu-t"
const supabase = createBrowserClient(supabaseUrl, supabaseKey)

const Icons = {
  ArrowLeft: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>,
  Shoe: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 14h20"/><path d="M2 14c0 3.31 2.69 6 6 6h12a2 2 0 0 0 2-2v-4"/><path d="M2 14c0-3.31 2.69-6 6-6h12a2 2 0 0 1 2 2v4"/><path d="M10 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2"/></svg>,
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
};

export default function GearPage() {
  const router = useRouter();
  const [gears, setGears] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 입력 폼 상태
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('Nike');
  const [studType, setStudType] = useState('FG');

  // 스탯 데이터
  const [gearStats, setGearStats] = useState<any>({});

  useEffect(() => {
    fetchGears();
  }, []);

  const fetchGears = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace('/login'); return; }

    // 1. 장비 목록 가져오기
    const { data: gearData } = await supabase.from('gears').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    
    // 2. 로그 데이터 가져와서 장비별 스탯 계산
    const { data: logs } = await supabase.from('logs').select('gear_id, goals, assists, match_result').eq('user_id', user.id).not('gear_id', 'is', null);

    if (gearData) setGears(gearData);
    
    // 스탯 계산 로직
    const stats: any = {};
    if (logs) {
        logs.forEach(log => {
            if (!stats[log.gear_id]) stats[log.gear_id] = { matches: 0, goals: 0, wins: 0 };
            stats[log.gear_id].matches += 1;
            stats[log.gear_id].goals += (log.goals || 0);
            if (log.match_result === 'win') stats[log.gear_id].wins += 1;
        });
    }
    setGearStats(stats);
    setLoading(false);
  };

  const handleAddGear = async () => {
    if (!name.trim()) return toast.error("모델명을 입력해주세요!");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('gears').insert({
        user_id: user.id,
        name, brand, stud_type: studType
    });

    if (error) toast.error("저장 실패 ㅠ");
    else {
        toast.success("축구화 등록 완료! 👟");
        setIsModalOpen(false);
        setName('');
        fetchGears();
    }
  };

  const handleDeleteGear = async (id: string) => {
      if(!confirm("정말 삭제하시겠습니까?")) return;
      await supabase.from('gears').delete().eq('id', id);
      toast.success("삭제되었습니다.");
      fetchGears();
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white pb-20">
      <Toaster position="top-center" />
      
      {/* 헤더 */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-white/5 p-4 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-white"><Icons.ArrowLeft /></button>
        <span className="font-black text-lg">MY GEARS 👟</span>
        <div className="w-6"></div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4">
        
        {/* 등록 버튼 */}
        <button onClick={() => setIsModalOpen(true)} className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl font-black shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] transition">
            <Icons.Plus /> 새 축구화 등록하기
        </button>

        {/* 장비 리스트 */}
        {loading ? <p className="text-center text-slate-500 py-10">로딩 중...</p> : (
            gears.length === 0 ? (
                <div className="text-center py-20 text-slate-500 font-bold border-2 border-dashed border-slate-800 rounded-3xl">
                    등록된 축구화가 없습니다.<br/>첫 번째 무기를 등록해보세요! ⚔️
                </div>
            ) : (
                gears.map(gear => {
                    const stat = gearStats[gear.id] || { matches: 0, goals: 0, wins: 0 };
                    const winRate = stat.matches > 0 ? Math.round((stat.wins / stat.matches) * 100) : 0;
                    
                    return (
                        <div key={gear.id} className="bg-slate-900 border border-white/10 rounded-2xl p-5 relative overflow-hidden group">
                            
                            {/* 🔥 [수정됨] 삭제 버튼: 모바일(기본)에선 항상 보이고, PC(md 이상)에선 호버 시 보임 */}
                            <div className="absolute top-0 right-0 p-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition z-10">
                                <button onClick={() => handleDeleteGear(gear.id)} className="text-slate-500 hover:text-red-500 transition-colors p-2">
                                    <Icons.Trash />
                                </button>
                            </div>
                            
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className={`text-[10px] font-black px-2 py-1 rounded uppercase mb-2 inline-block ${gear.brand === 'Nike' ? 'bg-orange-500 text-white' : (gear.brand === 'Adidas' ? 'bg-white text-black' : 'bg-slate-700 text-slate-300')}`}>{gear.brand}</span>
                                    <h3 className="text-lg font-black text-white">{gear.name}</h3>
                                    <p className="text-xs text-slate-400 font-bold">{gear.stud_type} 스터드</p>
                                </div>
                                <div className="text-4xl opacity-20 group-hover:opacity-100 group-hover:scale-110 transition duration-500">👟</div>
                            </div>

                            {/* 스탯 바 */}
                            <div className="grid grid-cols-3 gap-2 bg-black/20 rounded-xl p-3 text-center">
                                <div><p className="text-xs text-slate-500 font-bold">경기</p><p className="text-lg font-black text-white">{stat.matches}</p></div>
                                <div><p className="text-xs text-slate-500 font-bold">골</p><p className="text-lg font-black text-yellow-400">{stat.goals}</p></div>
                                <div><p className="text-xs text-slate-500 font-bold">승률</p><p className="text-lg font-black text-blue-400">{winRate}%</p></div>
                            </div>
                        </div>
                    )
                })
            )
        )}
      </main>

      {/* 등록 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setIsModalOpen(false)}>
            <div className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-3xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                <h3 className="font-black text-white text-lg mb-4">새 장비 등록</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">브랜드</label>
                        <div className="flex bg-slate-800 rounded-xl p-1">
                            {['Nike', 'Adidas', 'Puma', 'Mizuno', 'Other'].map(b => (
                                <button key={b} onClick={() => setBrand(b)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${brand === b ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>{b}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">모델명</label>
                        <input value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-slate-800 rounded-xl text-white font-bold" placeholder="예: 머큐리얼 베이퍼 15 엘리트" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">스터드 타입</label>
                        <select value={studType} onChange={e => setStudType(e.target.value)} className="w-full p-3 bg-slate-800 rounded-xl text-white font-bold">
                            <option value="FG">FG (천연잔디용)</option>
                            <option value="AG">AG (인조잔디용)</option>
                            <option value="HG">HG (맨땅용)</option>
                            <option value="TF">TF (풋살화/터프화)</option>
                            <option value="SG">SG (쇠뽕/질척한 잔디)</option>
                        </select>
                    </div>
                    <button onClick={handleAddGear} className="w-full py-4 bg-blue-600 rounded-xl font-black text-white mt-2">등록완료</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}