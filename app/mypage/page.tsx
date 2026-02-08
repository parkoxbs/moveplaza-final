'use client';

import { useEffect, useState } from 'react';
import { createClient } from "@supabase/supabase-js"; // 👈 여기 수정됨
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast'; // 👈 알림창 추가

// 👇 1. Supabase 주소와 키를 여기에 붙여넣으세요! (대시보드랑 똑같이)
const supabaseUrl = "https://okckpesbufkqhmzcjiab.supabase.co"
const supabaseKey = "sb_publishable_G_y2dTmNj9nGIvu750MlKQ_jjjgxu-t"

// 👈 파일 내부에서 직접 생성 (에러 방지)
const supabase = createClient(supabaseUrl, supabaseKey)

export default function MyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // 👤 프로필 상태들
  const [id, setId] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [sport, setSport] = useState('');
  const [position, setPosition] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    getProfile();
  }, []);

  // 📥 내 정보 불러오기
  const getProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    setId(user.id);

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setUsername(data.username || '');
      setSport(data.sport || '');
      setPosition(data.position || '');
      setBio(data.bio || '');
      setAvatarUrl(data.avatar_url || null);
    }
    setLoading(false);
  };

  // 💾 프로필 저장하기
  const updateProfile = async () => {
    if (!id) return;
    setSaving(true);
    const noti = toast.loading("프로필 저장 중...");

    try {
      let finalAvatarUrl = avatarUrl;

      // 1. 새 프사 파일이 있으면 업로드
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `avatar_${id}_${Date.now()}.${fileExt}`;
        const filePath = `${id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('images') // 기존 이미지 버킷 사용
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('images').getPublicUrl(filePath);
        finalAvatarUrl = data.publicUrl;
      }

      // 2. DB 업데이트
      const updates = {
        id,
        username,
        sport,
        position,
        bio,
        avatar_url: finalAvatarUrl,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;

      toast.success("프로필이 멋지게 바뀌었어요! 😎", { id: noti });
      setAvatarUrl(finalAvatarUrl); // 화면 갱신
      setAvatarFile(null);

    } catch (error: any) {
      toast.error("저장 실패: " + error.message, { id: noti });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast('로그아웃 👋');
    router.push('/login');
  };

  // 📸 프사 미리보기 처리
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setAvatarFile(file);
    // 미리보기 URL 생성
    setAvatarUrl(URL.createObjectURL(file));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold">로딩 중... ⏳</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex items-center justify-center">
      {/* 알림창 표시용 */}
      <Toaster position="top-center" />

      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
        
        {/* 상단 배경 (꾸밈용) */}
        <div className="h-32 bg-blue-900 w-full relative">
          <button 
            onClick={() => router.push('/dashboard')}
            className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-sm font-bold backdrop-blur-sm"
          >
            ← 대시보드로
          </button>
        </div>

        <div className="px-8 pb-8">
          {/* 📸 프사 영역 (겹쳐서 배치) */}
          <div className="relative -mt-16 mb-6 flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="프사" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>
                )}
              </div>
              {/* 카메라 아이콘 (업로드 버튼) */}
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-md cursor-pointer hover:bg-blue-700 transition transform hover:scale-110">
                📷
              </label>
              <input 
                id="avatar-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          {/* 📝 입력 폼 */}
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-extrabold text-black">내 프로필 설정 🛠️</h1>
              <p className="text-gray-500 text-sm font-bold">다른 선수들에게 나를 소개해보세요.</p>
            </div>

            <div>
              <label className="block text-sm font-extrabold text-gray-700 mb-1">닉네임 / 이름</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="예: 손흥민"
                className="w-full p-3 border-2 border-gray-200 rounded-xl font-bold text-black focus:border-blue-500 focus:outline-none bg-gray-50 focus:bg-white"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-extrabold text-gray-700 mb-1">주 종목</label>
                <input 
                  type="text" 
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                  placeholder="예: 축구 ⚽"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl font-bold text-black focus:border-blue-500 focus:outline-none bg-gray-50 focus:bg-white"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-extrabold text-gray-700 mb-1">포지션</label>
                <input 
                  type="text" 
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="예: CB / DF"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl font-bold text-black focus:border-blue-500 focus:outline-none bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-extrabold text-gray-700 mb-1">한줄 소개 / 각오 🔥</label>
              <input 
                type="text" 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="예: 무릎 재활하고 필드 복귀하자!"
                className="w-full p-3 border-2 border-gray-200 rounded-xl font-bold text-black focus:border-blue-500 focus:outline-none bg-gray-50 focus:bg-white"
              />
            </div>

            <button 
              onClick={updateProfile}
              disabled={saving}
              className="w-full bg-blue-900 text-white font-extrabold py-4 rounded-xl shadow-lg hover:bg-blue-800 transition transform active:scale-95 disabled:opacity-70 mt-4"
            >
              {saving ? '저장 중... 💾' : '프로필 저장하기 ✨'}
            </button>

            <button 
              onClick={handleLogout}
              className="w-full text-gray-400 font-bold text-sm hover:text-red-500 py-2"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}