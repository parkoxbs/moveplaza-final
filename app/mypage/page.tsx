'use client';

import { useEffect, useState } from 'react';
import { createClient } from "@supabase/supabase-js"; 
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast'; 

// 👇 1. Supabase 주소와 키를 입력하세요!
const supabaseUrl = "https://okckpesbufkqhmzcjiab.supabase.co"
const supabaseKey = "sb_publishable_G_y2dTmNj9nGIvu750MlKQ_jjjgxu-t"

const supabase = createClient(supabaseUrl, supabaseKey)

// ✅ [설정] 관리자 이메일 (이 이메일로 로그인해야 건의함이 보입니다)
const ADMIN_EMAIL = "agricb83@gmail.com"; 

const Icons = {
  Mail: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
  X: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
}

export default function MyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [id, setId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [sport, setSport] = useState('');
  const [position, setPosition] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // 🆕 건의함 관련 상태
  const [isAdmin, setIsAdmin] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isMailboxOpen, setIsMailboxOpen] = useState(false);

  useEffect(() => { getProfile(); }, []);

  const getProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("로그인이 필요합니다!"); router.push('/login'); return; }
    
    setId(user.id);
    setEmail(user.email || null);

    // 👑 관리자 여부 확인
    if (user.email === ADMIN_EMAIL) {
        setIsAdmin(true);
        fetchSuggestions();
    }

    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) {
      setUsername(data.username || '');
      setSport(data.sport || '');
      setPosition(data.position || '');
      setBio(data.bio || '');
      setAvatarUrl(data.avatar_url || null);
    }
    setLoading(false);
  };

  // 🆕 건의사항 가져오기 (관리자용)
  const fetchSuggestions = async () => {
    const { data } = await supabase.from('suggestions').select('*').order('created_at', { ascending: false });
    if (data) setSuggestions(data);
  }

  // 🆕 건의사항 삭제 (관리자용)
  const deleteSuggestion = async (id: number) => {
    if(!confirm("삭제하시겠습니까?")) return;
    await supabase.from('suggestions').delete().eq('id', id);
    toast.success("삭제 완료");
    fetchSuggestions(); // 목록 새로고침
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
    } catch (error: any) { toast.error("저장 실패: " + error.message, { id: noti }); } finally { setSaving(false); }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); toast('로그아웃 👋'); router.push('/login'); };
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (!e.target.files || e.target.files.length === 0) return; const file = e.target.files[0]; setAvatarFile(file); setAvatarUrl(URL.createObjectURL(file)); };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold bg-slate-950 text-white">로딩 중... ⏳</div>;

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 flex items-center justify-center font-sans">
      <Toaster position="top-center" toastOptions={{ style: { background: '#1e293b', color: '#fff' } }} />

      <div className="max-w-md w-full bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-white/10">
        
        {/* 상단 배경 */}
        <div className="h-32 bg-blue-900 w-full relative">
          <button 
            onClick={() => router.push('/dashboard')}
            className="absolute top-4 left-4 bg-black/20 hover:bg-black/40 text-white px-3 py-1 rounded-lg text-sm font-bold backdrop-blur-sm transition"
          >
            ← 대시보드로
          </button>
        </div>

        <div className="px-8 pb-8">
          {/* 프사 영역 */}
          <div className="relative -mt-16 mb-6 flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-slate-900 shadow-xl overflow-hidden bg-slate-800">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="프사" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-slate-500">👤</div>
                )}
              </div>
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-blue-500 transition transform hover:scale-110 border-2 border-slate-900">
                📷
              </label>
              <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
          </div>

          {/* 입력 폼 */}
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-extrabold text-white">내 프로필 설정 🛠️</h1>
              <p className="text-slate-400 text-sm font-bold">다른 선수들에게 나를 소개해보세요.</p>
            </div>

            <div>
              <label className="block text-sm font-extrabold text-slate-400 mb-1">닉네임 / 이름</label>
              <input 
                type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="예: 손흥민"
                className="w-full p-3 border border-white/10 rounded-xl font-bold text-white bg-slate-800 focus:border-blue-500 focus:outline-none placeholder-slate-600"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-extrabold text-slate-400 mb-1">주 종목</label>
                <input 
                  type="text" value={sport} onChange={(e) => setSport(e.target.value)} placeholder="예: 축구 ⚽"
                  className="w-full p-3 border border-white/10 rounded-xl font-bold text-white bg-slate-800 focus:border-blue-500 focus:outline-none placeholder-slate-600"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-extrabold text-slate-400 mb-1">포지션</label>
                <input 
                  type="text" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="예: CB"
                  className="w-full p-3 border border-white/10 rounded-xl font-bold text-white bg-slate-800 focus:border-blue-500 focus:outline-none placeholder-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-extrabold text-slate-400 mb-1">한줄 소개</label>
              <input 
                type="text" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="각오 한마디!"
                className="w-full p-3 border border-white/10 rounded-xl font-bold text-white bg-slate-800 focus:border-blue-500 focus:outline-none placeholder-slate-600"
              />
            </div>

            <button 
              onClick={updateProfile} disabled={saving}
              className="w-full bg-blue-600 text-white font-extrabold py-4 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:bg-blue-500 transition transform active:scale-95 disabled:opacity-70 mt-4"
            >
              {saving ? '저장 중... 💾' : '프로필 저장하기 ✨'}
            </button>

            {/* 👑 관리자 전용 버튼 (일반 유저에게는 안 보임) */}
            {isAdmin && (
                <button 
                    onClick={() => setIsMailboxOpen(true)}
                    className="w-full bg-slate-800 border border-white/10 text-slate-300 font-bold py-3 rounded-xl hover:bg-slate-700 hover:text-white transition flex items-center justify-center gap-2"
                >
                    <Icons.Mail /> 📬 건의함 확인 ({suggestions.length})
                </button>
            )}

            <button onClick={handleLogout} className="w-full text-slate-500 font-bold text-sm hover:text-red-500 py-2 transition">
              로그아웃
            </button>
          </div>
        </div>
      </div>

      {/* 📬 건의함 모달 (관리자용) */}
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