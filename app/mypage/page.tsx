'use client';

import { useEffect, useState } from 'react';
import { createClient } from "@supabase/supabase-js"; 
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast'; 

// 👇 1. Supabase 주소와 키를 입력하세요!
const supabaseUrl = "https://okckpesbufkqhmzcjiab.supabase.co"
const supabaseKey = "sb_publishable_G_y2dTmNj9nGIvu750MlKQ_jjjgxu-t"

const supabase = createClient(supabaseUrl, supabaseKey)

// ✅ [설정] 관리자 이메일
const ADMIN_EMAIL = "agricb83@gmail.com"; 

// 레벨 시스템 (대시보드와 동일하게 맞춤)
const LEVEL_SYSTEM = [
  { name: 'Rookie', rank: '루키', emoji: '🐣', min: 0, color: 'text-green-400', bg: 'bg-green-500/20' },
  { name: 'Beginner', rank: '비기너', emoji: '🌱', min: 15, color: 'text-teal-400', bg: 'bg-teal-500/20' },
  { name: 'Semi-Pro', rank: '세미 프로', emoji: '🏃', min: 50, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  { name: 'Pro', rank: '프로', emoji: '🔥', min: 100, color: 'text-red-400', bg: 'bg-red-500/20' },
  { name: 'World Class', rank: '월드 클래스', emoji: '💎', min: 200, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  { name: 'Legend', rank: '레전드', emoji: '👑', min: 400, color: 'text-yellow-400', bg: 'bg-yellow-500/20' }
];

const getLevel = (count: number) => {
  for (let i = LEVEL_SYSTEM.length - 1; i >= 0; i--) {
    if (count >= LEVEL_SYSTEM[i].min) return LEVEL_SYSTEM[i];
  }
  return LEVEL_SYSTEM[0];
};

const Icons = {
  Mail: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
  X: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  Edit: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
}

export default function MyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // 프로필 데이터
  const [id, setId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [sport, setSport] = useState('');
  const [position, setPosition] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // 스탯 데이터
  const [stats, setStats] = useState({ totalLogs: 0, goals: 0, assists: 0, matches: 0, winRate: 0 });

  // 수정 모드 상태
  const [isEditing, setIsEditing] = useState(false);

  // 건의함 관련 상태
  const [isAdmin, setIsAdmin] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isMailboxOpen, setIsMailboxOpen] = useState(false);

  useEffect(() => { getProfile(); }, []);

  const getProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("로그인이 필요합니다!"); router.push('/login'); return; }
    
    setId(user.id);
    setEmail(user.email || null);

    if (user.email === ADMIN_EMAIL) {
        setIsAdmin(true);
        fetchSuggestions();
    }

    // 1. 프로필 정보 가져오기
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) {
      setUsername(data.username || '');
      setSport(data.sport || '');
      setPosition(data.position || '');
      setBio(data.bio || '');
      setAvatarUrl(data.avatar_url || null);
    }

    // 2. 기록 데이터 가져와서 스탯 계산
    const { data: logs } = await supabase.from('logs').select('*').eq('user_id', user.id);
    if (logs) {
        const matches = logs.filter(l => l.log_type === 'match');
        const wins = matches.filter(l => l.match_result === 'win').length;
        
        setStats({
            totalLogs: logs.length,
            matches: matches.length,
            goals: matches.reduce((acc, cur) => acc + (cur.goals || 0), 0),
            assists: matches.reduce((acc, cur) => acc + (cur.assists || 0), 0),
            winRate: matches.length > 0 ? Math.round((wins / matches.length) * 100) : 0
        });
    }

    setLoading(false);
  };

  const fetchSuggestions = async () => {
    const { data } = await supabase.from('suggestions').select('*').order('created_at', { ascending: false });
    if (data) setSuggestions(data);
  }

  const deleteSuggestion = async (id: number) => {
    if(!confirm("삭제하시겠습니까?")) return;
    await supabase.from('suggestions').delete().eq('id', id);
    toast.success("삭제 완료");
    fetchSuggestions();
  }

  const updateProfile = async () => {
    if (!id) return;
    setSaving(true);
    const noti = toast.loading("프로필 저장 중...");
    try {
      let finalAvatarUrl = avatarUrl;
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `avatar_${id}_${Date.now()}.${fileExt}`;
        const filePath = `${id}/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('images').upload(filePath, avatarFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('images').getPublicUrl(filePath);
        finalAvatarUrl = data.publicUrl;
      }
      const updates = { id, username, sport, position, bio, avatar_url: finalAvatarUrl, updated_at: new Date() };
      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;
      toast.success("프로필 저장 완료! 😎", { id: noti });
      setAvatarUrl(finalAvatarUrl);
      setAvatarFile(null);
      setIsEditing(false); // 저장 후 수정 모드 종료
    } catch (error: any) { toast.error("저장 실패: " + error.message, { id: noti }); } finally { setSaving(false); }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); toast('로그아웃 👋'); router.push('/login'); };
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (!e.target.files || e.target.files.length === 0) return; const file = e.target.files[0]; setAvatarFile(file); setAvatarUrl(URL.createObjectURL(file)); };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold bg-slate-950 text-white">로딩 중... ⏳</div>;

  const myLevel = getLevel(stats.totalLogs);

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 flex items-center justify-center font-sans">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1e293b', color: '#fff' } }} />

      <div className="max-w-md w-full bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-white/10">
        
        {/* 상단 배경 */}
        <div className="h-32 bg-blue-900 w-full relative">
          <button onClick={() => router.push('/dashboard')} className="absolute top-4 left-4 bg-black/20 hover:bg-black/40 text-white px-3 py-1 rounded-lg text-sm font-bold backdrop-blur-sm transition">← 대시보드로</button>
          {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white px-3 py-1 rounded-lg text-sm font-bold backdrop-blur-sm transition flex items-center gap-1"><Icons.Edit /> 수정</button>
          )}
        </div>

        <div className="px-8 pb-8">
          
          {/* 1. 프로필 카드 섹션 */}
          <div className="relative -mt-16 mb-6 text-center">
            <div className="relative inline-block">
                <div className={`w-32 h-32 rounded-full border-4 border-slate-900 shadow-xl overflow-hidden bg-slate-800 flex items-center justify-center text-6xl ${myLevel.color}`}>
                    {avatarUrl ? <img src={avatarUrl} alt="프사" className="w-full h-full object-cover" /> : myLevel.emoji}
                </div>
                {isEditing && (
                    <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-blue-500 transition border-2 border-slate-900">📷</label>
                )}
                <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={!isEditing} />
                
                {!isEditing && (
                    <span className={`absolute bottom-0 right-0 px-3 py-1 rounded-full text-xs font-black border-2 border-slate-900 shadow-lg ${myLevel.bg} ${myLevel.color}`}>
                        {myLevel.rank}
                    </span>
                )}
            </div>
            
            {!isEditing && (
                <div className="mt-4">
                    <h1 className="text-2xl font-extrabold text-white">{username || '이름 없음'}</h1>
                    <p className="text-slate-400 text-sm font-bold mt-1">{sport || '종목 미설정'} · {position || '포지션 미설정'}</p>
                    {bio && <p className="text-slate-300 text-sm mt-3 px-4 py-2 bg-slate-800 rounded-xl inline-block">"{bio}"</p>}
                </div>
            )}
          </div>

          {/* 2. 시즌 스탯 섹션 (수정 모드 아닐 때만 보임) */}
          {!isEditing && (
              <div className="bg-slate-900 rounded-2xl border border-white/10 shadow-lg relative overflow-hidden mb-6 p-1">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 rounded-full blur-[40px]"></div>
                  <div className="bg-slate-950/50 p-4 rounded-xl text-center mb-1">
                      <h3 className="text-xs font-black text-slate-500 tracking-widest mb-3 uppercase">2026 Season Stats</h3>
                      <div className="flex justify-around items-center">
                          <div><p className="text-2xl font-black text-white">{stats.goals}</p><p className="text-[10px] text-slate-500 font-bold">GOALS</p></div>
                          <div><p className="text-2xl font-black text-white">{stats.assists}</p><p className="text-[10px] text-slate-500 font-bold">ASSISTS</p></div>
                          <div><p className="text-2xl font-black text-blue-400">{stats.winRate}%</p><p className="text-[10px] text-slate-500 font-bold">WIN RATE</p></div>
                      </div>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded-xl flex justify-between items-center px-6">
                      <span className="text-xs text-slate-400 font-bold">총 경기 수</span>
                      <span className="text-sm text-white font-black">{stats.matches} 경기</span>
                  </div>
              </div>
          )}

          {/* 3. 수정 폼 (수정 모드일 때만 보임) */}
          {isEditing && (
            <div className="space-y-5 animate-fade-in">
                <div>
                    <label className="block text-sm font-extrabold text-slate-400 mb-1">닉네임 / 이름</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-3 border border-white/10 rounded-xl font-bold text-white bg-slate-800 focus:border-blue-500 focus:outline-none" />
                </div>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-extrabold text-slate-400 mb-1">주 종목</label>
                        <input type="text" value={sport} onChange={(e) => setSport(e.target.value)} placeholder="예: 축구" className="w-full p-3 border border-white/10 rounded-xl font-bold text-white bg-slate-800 focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-extrabold text-slate-400 mb-1">포지션</label>
                        <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="예: FW" className="w-full p-3 border border-white/10 rounded-xl font-bold text-white bg-slate-800 focus:border-blue-500 focus:outline-none" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-extrabold text-slate-400 mb-1">한줄 소개</label>
                    <input type="text" value={bio} onChange={(e) => setBio(e.target.value)} className="w-full p-3 border border-white/10 rounded-xl font-bold text-white bg-slate-800 focus:border-blue-500 focus:outline-none" />
                </div>
                <div className="flex gap-2 pt-2">
                    <button onClick={() => setIsEditing(false)} className="flex-1 py-3 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700">취소</button>
                    <button onClick={updateProfile} disabled={saving} className="flex-[2] py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 shadow-lg">{saving ? '저장 중...' : '저장 완료'}</button>
                </div>
            </div>
          )}

          {/* 4. 하단 버튼들 */}
          {!isEditing && (
              <div className="mt-4 space-y-3">
                  {isAdmin && (
                      <button onClick={() => setIsMailboxOpen(true)} className="w-full bg-slate-800 border border-white/10 text-slate-300 font-bold py-3 rounded-xl hover:bg-slate-700 hover:text-white transition flex items-center justify-center gap-2">
                          <Icons.Mail /> 📬 건의함 확인 ({suggestions.length})
                      </button>
                  )}
                  <button onClick={handleLogout} className="w-full text-slate-500 font-bold text-sm hover:text-red-500 py-2 transition">로그아웃</button>
              </div>
          )}

        </div>
      </div>

      {/* 📬 건의함 모달 (관리자용) - 기존 코드 유지 */}
      {isMailboxOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setIsMailboxOpen(false)}>
            <div className="bg-slate-900 border border-white/10 w-full max-w-sm max-h-[80vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b border-white/10 flex justify-between items-center bg-slate-800/50">
                    <h3 className="font-black text-white text-lg flex items-center gap-2">📬 도착한 건의사항</h3>
                    <button onClick={() => setIsMailboxOpen(false)} className="text-slate-400 hover:text-white"><Icons.X /></button>
                </div>
                <div className="p-0 overflow-y-auto flex-1">
                    {suggestions.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 font-bold">아직 도착한 건의사항이 없습니다. 텅~ 🍃</div>
                    ) : (
                        suggestions.map((msg) => (
                            <div key={msg.id} className="p-5 border-b border-white/5 hover:bg-slate-800/30 transition group relative">
                                <p className="text-sm font-medium text-slate-200 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                <div className="mt-2 flex justify-between items-center">
                                    <span className="text-[10px] text-slate-500 font-bold">{new Date(msg.created_at).toLocaleString()}</span>
                                    <button onClick={() => deleteSuggestion(msg.id)} className="text-slate-600 hover:text-red-500 transition opacity-0 group-hover:opacity-100 p-1"><Icons.Trash /></button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="p-4 bg-slate-800/50 border-t border-white/10">
                    <button onClick={() => { fetchSuggestions(); toast.success("새로고침 완료"); }} className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl border border-white/10 hover:bg-slate-700 transition">새로고침 🔄</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}