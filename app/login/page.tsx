'use client';

import { useState } from 'react';
import { supabase } from '../supabase'; 
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  
  // 상태 관리
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); // 로그인 모드 vs 회원가입 모드
  const [agreed, setAgreed] = useState(false); // 약관 동의
  const [showTerms, setShowTerms] = useState(false); // 약관 팝업
  const [loading, setLoading] = useState(false);

  // 📧 이메일 로그인/회원가입 처리
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreed) return alert("❌ 약관에 동의해주세요!");
    if (!email || !password) return alert("이메일과 비밀번호를 입력해주세요.");

    setLoading(true);

    try {
      if (isSignUp) {
        // 회원가입
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) throw error;
        alert("✅ 가입 인증 메일을 보냈습니다!\n이메일함을 확인하고 링크를 클릭해주세요.");
        setIsSignUp(false); // 가입 후 로그인 모드로 전환
      } else {
        // 로그인
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push('/dashboard'); // 로그인 성공 시 이동
      }
    } catch (error: any) {
      alert("⚠️ 에러 발생: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 🌐 소셜 로그인 처리
  const handleSocialLogin = async (provider: 'google' | 'kakao') => {
    if (!agreed) return alert("❌ 약관에 동의해야 로그인할 수 있습니다.");
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (error: any) {
      alert("로그인 에러: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-10">
      
      {/* 1. 로고 */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-slate-900 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg">
          <span className="text-3xl font-black text-white">M</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">MOVEPLAZA</h1>
        <p className="text-slate-500 font-bold mt-2">Athlete Performance System</p>
      </div>

      {/* 2. 로그인 카드 */}
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 w-full max-w-md">
        
        {/* 상단 탭 (로그인 vs 회원가입) */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button 
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
            >
                로그인
            </button>
            <button 
                onClick={() => setIsSignUp(true)}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
            >
                회원가입
            </button>
        </div>

        {/* 2-1. 필수 동의 체크박스 */}
        <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-start gap-3">
            <input 
              type="checkbox" 
              id="agree" 
              checked={agreed} 
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="agree" className="text-sm text-slate-600 font-medium cursor-pointer select-none leading-relaxed">
              <span className="text-red-500 font-bold">[필수]</span> 개인정보 수집 및 이용에 동의합니다.
            </label>
          </div>
          <button 
            onClick={() => setShowTerms(true)}
            className="text-xs text-slate-400 font-bold underline mt-2 ml-8 hover:text-blue-500"
          >
            내용 자세히 보기 📄
          </button>
        </div>

        {/* 2-2. 이메일 폼 */}
        <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
            <div>
                <input 
                    type="email" 
                    placeholder="이메일 주소" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                />
            </div>
            <div>
                <input 
                    type="password" 
                    placeholder="비밀번호 (6자 이상)" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                />
            </div>
            <button 
                type="submit" 
                disabled={loading || !agreed}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg ${loading || !agreed ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 hover:scale-[1.02]'}`}
            >
                {loading ? '처리 중...' : (isSignUp ? '이메일로 가입하기 ✨' : '로그인하기 🚀')}
            </button>
        </form>

        {/* 구분선 */}
        <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-slate-400 font-bold">또는 소셜 로그인</span></div>
        </div>

        {/* 2-3. 소셜 버튼 */}
        <div className="space-y-3">
          <button
            onClick={() => handleSocialLogin('kakao')}
            disabled={!agreed || loading}
            className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-3 transition-all ${
              agreed 
                ? 'bg-[#FEE500] text-[#000000] hover:bg-[#FDD835] shadow-sm hover:shadow-md' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
             <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C5.925 3 1 6.925 1 11.775C1 14.85 3.075 17.55 6.15 19.05L5.1 22.8C5.025 23.1 5.325 23.325 5.625 23.175L10.2 20.175C10.8 20.25 11.4 20.325 12 20.325C18.075 20.325 23 16.425 23 11.55C23 6.75 18.075 3 12 3Z" /></svg>
             카카오로 시작
          </button>
          <button
            onClick={() => handleSocialLogin('google')}
            disabled={!agreed || loading}
            className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-3 border transition-all ${
              agreed 
                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm hover:shadow-md' 
                : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
            구글로 시작
          </button>
        </div>
      </div>

      <p className="text-slate-400 text-xs mt-8 font-bold">
        © 2026 MOVEPLAZA. All rights reserved.
      </p>

      {/* 3. 약관 팝업 (내용 동일) */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-slide-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-lg text-slate-900">개인정보 처리방침</h3>
              <button onClick={() => setShowTerms(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>
            <div className="p-6 h-80 overflow-y-auto text-sm text-slate-600 leading-relaxed space-y-4">
              <p><strong className="text-slate-900">1. 수집하는 개인정보 항목</strong><br/>MOVEPLAZA는 간편 로그인을 통해 아래의 정보를 수집합니다.<br/>- 필수항목: 이메일 주소, 닉네임(이름), 프로필 사진</p>
              <p><strong className="text-slate-900">2. 개인정보의 수집 및 이용목적</strong><br/>- 서비스 이용에 따른 본인 식별 및 가입 의사 확인<br/>- 운동/재활 기록 저장 및 분석 서비스 제공<br/>- 커뮤니티 이용 시 프로필 표시</p>
              <p><strong className="text-slate-900">3. 보유 및 이용기간</strong><br/>- 회원 탈퇴 시까지 보유하며, 탈퇴 요청 시 지체 없이 파기합니다.</p>
              <p><strong className="text-slate-900">4. 동의 거부 권리</strong><br/>- 귀하는 개인정보 수집 동의를 거부할 권리가 있습니다. 다만, 동의하지 않을 경우 로그인이 불가능하여 서비스 이용이 제한됩니다.</p>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                * 본 앱은 포트폴리오 및 테스트 목적으로 제작되었으며, 실제 상업적 용도로 사용되지 않을 수 있습니다.
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
              <button 
                onClick={() => { setShowTerms(false); setAgreed(true); }}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold w-full"
              >
                확인하고 동의하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}