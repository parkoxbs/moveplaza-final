'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from "@supabase/ssr"; 
import toast, { Toaster } from 'react-hot-toast';

const supabaseUrl = "https://okckpesbufkqhmzcjiab.supabase.co";
const supabaseKey = "sb_publishable_G_y2dTmNj9nGIvu750MlKQ_jjjgxu-t";
const supabase = createBrowserClient(supabaseUrl, supabaseKey);

// 약관 모달 컴포넌트
function LegalModal({ title, content, onClose }: { title: string, content: React.ReactNode, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-extrabold text-lg text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 font-bold text-xl px-2">✕</button>
        </div>
        <div className="p-6 overflow-y-auto text-sm text-gray-600 space-y-4 leading-relaxed whitespace-pre-line">{content}</div>
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="w-full bg-blue-900 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition">확인했습니다</button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  
  // 상태 관리
  const [isSignUp, setIsSignUp] = useState(false); 
  const [step, setStep] = useState<'FORM' | 'OTP'>('FORM'); 
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); 

  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [agreed, setAgreed] = useState(false);

  // 타이머 로직
  useEffect(() => {
    if (step === 'OTP' && timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [step, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // 1. 로그인 & 회원가입 폼 제출 함수
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSignUp) {
      // 🟢 [로그인 모드] 비밀번호로 즉시 로그인
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);

      if (error) {
        toast.error("로그인 실패: 이메일이나 비밀번호를 확인해주세요.");
      } else {
        toast.success("환영합니다! ⚽");
        setTimeout(() => window.location.replace('/dashboard'), 500);
      }
    } else {
      // 🔵 [회원가입 모드] 인증번호 발송
      if (!agreed) return toast.error("필수 약관에 동의해주세요!");
      if (password.length < 6) return toast.error("비밀번호는 6자리 이상이어야 합니다.");
      
      setLoading(true);
      const { error } = await supabase.auth.signUp({ email, password });
      setLoading(false);

      if (error) {
        toast.error("회원가입 실패: " + error.message);
      } else {
        toast.success("메일로 가입 인증번호를 보냈습니다!");
        setStep('OTP'); 
        setTimeLeft(180); 
      }
    }
  };

  // 2. 가입 시 인증번호 확인 함수
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (timeLeft === 0) return toast.error("인증 시간이 만료되었습니다. 처음부터 다시 시도해주세요.");
    
    setLoading(true);
    // signup 타입으로 OTP 검증
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'signup' });
    setLoading(false);

    if (error) {
      toast.error("인증번호가 틀렸습니다.");
    } else {
      toast.success("회원가입 완료! 환영합니다 ⚽");
      setTimeout(() => window.location.replace('/dashboard'), 500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 selection:bg-blue-500">
      <Toaster position="top-center" />
      <div className="max-w-md w-full bg-slate-900 p-8 rounded-3xl shadow-2xl space-y-6 border border-white/10 relative overflow-hidden">
        
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-full blur-[80px] opacity-20 pointer-events-none -mt-10 -mr-10"></div>

        <div className="text-center relative z-10">
          <h1 className="text-3xl font-black text-white italic tracking-tight">MOVEPLAZA</h1>
          <p className="text-slate-400 font-bold mt-2 text-sm">
            {step === 'OTP' ? '이메일 인증' : (isSignUp ? '선수 등록 (회원가입)' : '라커룸 입장 (로그인)')}
          </p>
        </div>

        {step === 'FORM' ? (
          <form onSubmit={handleAuth} className="space-y-5 relative z-10">
            <div>
              <label className="block text-sm font-extrabold text-slate-300 mb-2">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 bg-slate-800 border border-white/10 rounded-xl focus:border-blue-500 outline-none text-white font-bold placeholder-slate-500 transition"
                placeholder="name@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-extrabold text-slate-300 mb-2">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 bg-slate-800 border border-white/10 rounded-xl focus:border-blue-500 outline-none text-white font-bold placeholder-slate-500 transition"
                placeholder="6자리 이상 입력"
                required
                minLength={6}
              />
            </div>

            {isSignUp && (
              <div className="flex items-start gap-3 text-sm text-slate-300 font-medium bg-slate-800/50 p-4 rounded-xl border border-white/5">
                <input type="checkbox" id="agree" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 w-5 h-5 accent-blue-600 rounded" />
                <div className="leading-snug">
                  <label htmlFor="agree" className="cursor-pointer">(필수) 아래 약관에 모두 동의합니다.</label>
                  <div className="mt-2 flex flex-col gap-1 text-xs">
                    <button type="button" onClick={() => setShowTerms(true)} className="text-left text-blue-400 font-bold hover:underline">📄 이용약관 보기</button>
                    <button type="button" onClick={() => setShowPrivacy(true)} className="text-left text-blue-400 font-bold hover:underline">🔒 개인정보 처리방침</button>
                  </div>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-lg font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] transition disabled:opacity-50 mt-2">
              {loading ? '처리 중...' : (isSignUp ? '인증번호 받고 가입하기' : '로그인')}
            </button>

            <div className="text-center pt-2">
              <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-slate-400 hover:text-white font-bold text-sm transition underline underline-offset-4">
                {isSignUp ? '이미 계정이 있나요? 로그인' : '처음이신가요? 선수 등록 (회원가입)'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-5 relative z-10">
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div className="text-center bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl mb-6">
                <p className="text-sm font-bold text-blue-300 mb-1">{email}</p>
                <p className="text-xs text-slate-400">위 메일로 보낸 6자리 숫자를 입력해주세요.</p>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <label className="block text-sm font-extrabold text-slate-300">인증번호 6자리</label>
                  <span className={`text-sm font-bold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
                {/* 👇 6자리 입력 가능하게 수정 */}
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} 
                  maxLength={6}
                  className="w-full p-4 bg-slate-800 border border-white/10 rounded-xl focus:border-blue-500 outline-none text-white font-black text-center text-2xl tracking-[0.5em] transition"
                  placeholder="000000"
                  required
                />
              </div>

              <button type="submit" disabled={loading || timeLeft === 0 || otp.length < 6} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-lg font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] transition disabled:opacity-50">
                {loading ? '확인 중...' : '가입 완료하기'}
              </button>
            </form>

            <button 
              type="button" 
              onClick={(e) => { 
                e.preventDefault();
                setStep('FORM'); 
                setOtp(''); 
                setPassword(''); 
              }} 
              className="w-full text-slate-400 text-sm font-bold hover:text-white transition mt-2"
            >
              ← 뒤로 가기 (이메일 다시 입력)
            </button>
          </div>
        )}
      </div>

      {showTerms && <LegalModal title="이용약관" onClose={() => setShowTerms(false)} content={
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
      } />}
      {showPrivacy && <LegalModal title="개인정보 처리방침" onClose={() => setShowPrivacy(false)} content={
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
      } />}
    </div>
  );
}