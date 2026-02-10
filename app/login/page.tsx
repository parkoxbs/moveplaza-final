'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// 👇 여기가 핵심! 그냥 supabase-js가 아니라 'ssr' 패키지를 써야 쿠키가 저장됩니다.
import { createBrowserClient } from "@supabase/ssr"; 
import toast, { Toaster } from 'react-hot-toast';

// 👇 1. Supabase 주소와 키
const supabaseUrl = "https://okckpesbufkqhmzcjiab.supabase.co";
const supabaseKey = "sb_publishable_G_y2dTmNj9nGIvu750MlKQ_jjjgxu-t";

// 👇 브라우저 전용 클라이언트 생성 (쿠키 자동 관리)
const supabase = createBrowserClient(supabaseUrl, supabaseKey);

// 📜 [컴포넌트] 약관 보여주는 팝업창 (모달)
function LegalModal({ title, content, onClose }: { title: string, content: React.ReactNode, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-extrabold text-lg text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 font-bold text-xl px-2">✕</button>
        </div>
        <div className="p-6 overflow-y-auto text-sm text-gray-600 space-y-4 leading-relaxed whitespace-pre-line">
          {content}
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="w-full bg-blue-900 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition">
            확인했습니다
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // 1. 회원가입 로직
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success('✅ 회원가입 성공! 가입하신 이메일로 인증 메일을 보냈습니다. 확인해주세요.');
        setIsSignUp(false);
        setLoading(false);
      } else {
        // 2. 로그인 로직
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        toast.success("로그인 성공! 대시보드로 이동합니다. 🚀");

        // ✅ 쿠키가 확실히 저장된 후 페이지를 '새로고침'하며 이동
        setTimeout(() => {
            window.location.replace('/dashboard');
        }, 500); 
      }
    } catch (error: any) {
      toast.error("오류 발생: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <Toaster position="top-center" />
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl space-y-6 border border-gray-200 relative">
        
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-black">
            {isSignUp ? '회원가입' : '로그인'}
          </h1>
          <p className="text-gray-600 font-bold mt-2">
            Moveplaza 훈련 일지 시작하기
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-sm font-extrabold text-gray-700 mb-1">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-600 outline-none text-black font-bold placeholder-gray-400 transition"
              placeholder="name@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-extrabold text-gray-700 mb-1">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-600 outline-none text-black font-bold placeholder-gray-400 transition"
              placeholder="6자리 이상 입력"
              required
              minLength={6}
            />
          </div>

          {isSignUp && (
            <div className="flex items-start gap-3 text-sm text-gray-700 font-medium bg-gray-50 p-4 rounded-xl border border-gray-200">
              <input type="checkbox" id="agree" required className="mt-1 w-5 h-5 accent-blue-600" />
              <div className="leading-snug">
                <label htmlFor="agree">
                  (필수) 아래 약관에 모두 동의합니다.
                </label>
                <div className="mt-2 flex flex-col gap-1 text-xs">
                  <button 
                    type="button" 
                    onClick={() => setShowTerms(true)}
                    className="text-left text-blue-600 font-bold hover:underline"
                  >
                    📄 이용약관 보기 (의료 면책 조항 포함)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowPrivacy(true)}
                    className="text-left text-blue-600 font-bold hover:underline"
                  >
                    🔒 개인정보 처리방침 보기
                  </button>
                </div>
                <p className="text-[11px] text-red-500 mt-2 font-bold bg-red-50 p-1.5 rounded">
                  * 본 서비스는 기록용이며, 의사의 진료를 대신할 수 없습니다.
                </p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white text-lg font-bold py-4 rounded-xl shadow-lg transition transform active:scale-95 disabled:opacity-50"
          >
            {loading ? '처리 중...' : (isSignUp ? '동의하고 가입하기' : '로그인하기')}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-gray-500 hover:text-blue-700 hover:underline font-bold text-sm transition"
          >
            {isSignUp ? '이미 계정이 있나요? 로그인' : '계정이 없나요? 회원가입'}
          </button>
        </div>
      </div>

      {showTerms && (
        <LegalModal 
          title="이용약관 (Terms of Service)" 
          onClose={() => setShowTerms(false)}
          content={
            <>
              <p className="font-bold text-black mb-2">[제1조 목적]</p>
              본 약관은 Moveplaza(이하 "회사")가 제공하는 운동 기록 및 재활 관리 서비스(이하 "서비스")의 이용 조건을 규정합니다.

              <p className="font-bold text-red-600 mt-4 mb-2">[제2조 의료적 책임의 한계 (중요)]</p>
              1. 본 서비스는 사용자가 입력한 데이터를 바탕으로 통계를 제공하는 <strong>단순 기록 보조 도구</strong>입니다.<br/>
              2. 회사는 <strong>어떠한 경우에도 의료 행위(진단, 처방, 치료 등)를 제공하지 않습니다.</strong><br/>
              3. 서비스에서 제공되는 정보는 의사나 물리치료사의 전문적인 소견을 대체할 수 없습니다.<br/>
              4. 사용자는 신체적 이상을 느낄 경우 즉시 운동을 중단하고 전문 의료기관을 방문해야 합니다. 이를 무시하여 발생한 부상에 대해 회사는 책임을 지지 않습니다.

              <p className="font-bold text-black mt-4 mb-2">[제3조 사용자의 의무]</p>
              사용자는 본인의 신체 상태에 맞춰 무리하지 않는 선에서 서비스를 이용해야 하며, 타인의 정보를 도용하여 가입해서는 안 됩니다.
            </>
          }
        />
      )}

      {showPrivacy && (
        <LegalModal 
          title="개인정보 처리방침 (Privacy Policy)" 
          onClose={() => setShowPrivacy(false)}
          content={
            <>
              <p className="font-bold text-black mb-2">[수집하는 개인정보 항목]</p>
              - 필수항목: 이메일 주소, 비밀번호(암호화 저장)<br/>
              - 선택항목: 닉네임, 주 종목, 포지션, 프로필 사진, 신체 기록(통증 부위, 운동 강도 등)

              <p className="font-bold text-black mt-4 mb-2">[수집 및 이용 목적]</p>
              - 회원 식별 및 가입 의사 확인<br/>
              - 운동/재활 기록 저장 및 통계 제공<br/>
              - 커뮤니티(광장) 서비스 이용 시 작성자 표기

              <p className="font-bold text-black mt-4 mb-2">[보유 및 이용 기간]</p>
              - 회원은 언제든지 탈퇴를 요청할 수 있으며, 탈퇴 시 사용자의 개인정보는 지체 없이 파기됩니다.<br/>
              - 단, 관계 법령에 의해 보존이 필요한 경우 해당 기간 동안 보관될 수 있습니다.
              
              <p className="font-bold text-black mt-4 mb-2">[제3자 제공]</p>
              회사는 사용자의 동의 없이 개인정보를 외부에 제공하지 않습니다.
            </>
          }
        />
      )}

    </div>
  );
}