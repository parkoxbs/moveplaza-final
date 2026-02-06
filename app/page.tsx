'use client';

import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-blue-500 selection:text-white">
      
      {/* 🌌 배경 효과 (오로라) */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px] opacity-20 animate-pulse delay-1000"></div>
      </div>

      {/* 헤더 */}
      <header className="relative z-50 max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-lg">M</div>
          <span className="text-xl font-black tracking-tighter">MOVEPLAZA</span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => router.push('/login')} className="text-sm font-bold text-slate-300 hover:text-white transition">로그인</button>
          <button onClick={() => router.push('/signup')} className="text-sm font-bold bg-white text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100 transition">시작하기</button>
        </div>
      </header>

      {/* 1️⃣ 히어로 섹션 (메인) */}
      <section className="relative z-10 pt-20 pb-32 px-6 text-center max-w-5xl mx-auto">
        <span className="inline-block py-1 px-3 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-wider mb-6 animate-slide-up">
          🚀 For Athletes & Physical Therapy Students
        </span>
        <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          당신의 퍼포먼스,<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">데이터로 증명하세요.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 font-medium mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
          감으로 하는 운동은 끝났습니다. <br className="md:hidden"/>
          정확한 통증 기록부터 3D 신체 분석까지,<br/>
          Moveplaza가 당신의 성장을 체계적으로 관리합니다.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <button onClick={() => router.push('/signup')} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition shadow-lg shadow-blue-600/30 transform hover:scale-105">
            지금 무료로 시작하기
          </button>
          <button onClick={() => router.push('/login')} className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition border border-slate-700">
            이미 계정이 있나요?
          </button>
        </div>
      </section>

      {/* 2️⃣ 기능 소개 (카드) */}
      <section className="relative z-10 py-24 bg-slate-800/50 border-t border-slate-700/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 카드 1 */}
            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-700 hover:border-blue-500/50 transition group">
              <div className="w-14 h-14 bg-blue-900/30 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition">🧍</div>
              <h3 className="text-xl font-bold mb-3">직관적인 3D 바디맵</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                더 이상 글로 적지 마세요. 아픈 부위를 터치하면 <span className="text-blue-400 font-bold">시각적인 데이터</span>로 저장됩니다.
              </p>
            </div>
            {/* 카드 2 */}
            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-700 hover:border-purple-500/50 transition group">
              <div className="w-14 h-14 bg-purple-900/30 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition">🔥</div>
              <h3 className="text-xl font-bold mb-3">강력한 동기부여</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                <span className="text-purple-400 font-bold">스트릭(연속 달성)</span>과 레벨 시스템으로 멈추지 않는 성장 엔진을 장착하세요.
              </p>
            </div>
            {/* 카드 3 */}
            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-700 hover:border-green-500/50 transition group">
              <div className="w-14 h-14 bg-green-900/30 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition">🏆</div>
              <h3 className="text-xl font-bold mb-3">명예의 전당 랭킹</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                혼자 하면 지칩니다. 동료들과 경쟁하고 <span className="text-green-400 font-bold">월드 클래스</span> 등급에 도전하세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3️⃣ 통계 섹션 (목업) */}
      <section className="relative z-10 py-32 px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-black mb-12">모든 데이터를 한눈에.</h2>
        <div className="max-w-5xl mx-auto bg-slate-800 rounded-3xl p-4 border border-slate-700 shadow-2xl overflow-hidden relative group">
           {/* 가짜 UI (이미지 대신 코드로 구현) */}
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-slate-900 to-transparent opacity-60 z-20"></div>
           <div className="grid grid-cols-12 gap-4 p-4 opacity-50 group-hover:opacity-100 transition duration-500 blur-sm group-hover:blur-0 transform group-hover:scale-105">
              <div className="col-span-8 bg-slate-700 h-64 rounded-2xl"></div>
              <div className="col-span-4 bg-slate-700 h-64 rounded-2xl"></div>
              <div className="col-span-4 bg-slate-700 h-40 rounded-2xl"></div>
              <div className="col-span-8 bg-slate-700 h-40 rounded-2xl"></div>
           </div>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
              <p className="text-2xl font-black text-white drop-shadow-lg">지금 바로 체험해보세요!</p>
           </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t border-slate-800 py-12 text-center text-slate-500 text-sm">
        <p>&copy; 2026 Moveplaza. All rights reserved.</p>
        <p className="mt-2">Designed for Elite Performers.</p>
      </footer>
    </div>
  );
}