'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('회원가입 성공! 이제 로그인해주세요.');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/dashboard');
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl space-y-6 border border-gray-200">
        
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-black">
            {isSignUp ? '회원가입' : '로그인'}
          </h1>
          <p className="text-black font-medium mt-2">
            Moveplaza 훈련 일지 시작하기
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-base font-bold text-black mb-1">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none text-black font-bold placeholder-gray-500"
              placeholder="name@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-base font-bold text-black mb-1">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none text-black font-bold placeholder-gray-500"
              placeholder="6자리 이상 입력"
              required
              minLength={6}
            />
          </div>

          {isSignUp && (
            <div className="flex items-start gap-2 text-sm text-black font-medium bg-gray-50 p-3 rounded-lg border border-gray-300">
              <input type="checkbox" id="agree" required className="mt-1 w-5 h-5" />
              <label htmlFor="agree" className="leading-snug">
                (필수) <span className="font-bold text-blue-700">이용약관</span> 및 
                <span className="font-bold text-blue-700"> 개인정보 처리방침</span>에 동의합니다.
                <br/>
                <span className="text-xs text-red-600 block mt-1 font-bold">
                  * 주의: 본 서비스는 의료 진단이나 처방 목적이 아니며, 단순 기록용 도구임을 인지했습니다.
                </span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white text-lg font-bold py-4 rounded-xl shadow-md transition disabled:opacity-50"
          >
            {loading ? '처리 중...' : (isSignUp ? '동의하고 가입하기' : '로그인하기')}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-700 hover:underline font-bold text-base"
          >
            {isSignUp ? '이미 계정이 있나요? 로그인하기' : '계정이 없나요? 회원가입하기'}
          </button>
        </div>
      </div>
    </div>
  );
}