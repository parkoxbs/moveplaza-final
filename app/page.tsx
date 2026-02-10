"use client"

import Link from "next/link"
import { motion } from "framer-motion"

// 아이콘
const Icons = {
  ArrowRight: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
  Activity: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  Shield: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>,
  Trophy: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-white selection:bg-blue-500 selection:text-white overflow-hidden">
      
      {/* 🌌 배경 효과 (오로라) */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-700"></div>
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        
        {/* 네비게이션 */}
        <nav className="h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-[0_0_15px_rgba(37,99,235,0.5)]">M</div>
            <span className="text-xl font-black tracking-tight">MOVEPLAZA</span>
          </div>
          <Link href="/login" className="text-sm font-bold text-slate-300 hover:text-white transition">로그인</Link>
        </nav>

        {/* 1️⃣ 히어로 섹션 */}
        <section className="pt-20 pb-32 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }}
          >
            {/* 🏅 핵심 문구 배지 */}
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-blue-500/30 text-blue-400 text-xs font-bold mb-8 shadow-lg backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
              엘리트 축구선수 출신 물리치료학과 학생이 직접 개발 👨‍⚕️⚽
            </span>

            <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
              부상 없이 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">롱런</span>하는<br/>
              선수가 되세요.
            </h1>
            <p className="text-lg md:text-xl text-slate-400 font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
              자신의 몸 상태를 모르면 전성기는 짧아집니다.<br/>
              데이터 기반의 컨디션 관리로 최고의 퍼포먼스를 유지하세요.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:bg-blue-500 transition transform hover:scale-105 flex items-center justify-center gap-2">
                내 선수 데이터 만들기 🚀 <Icons.ArrowRight />
              </Link>
              <Link href="/community" className="w-full sm:w-auto px-8 py-4 bg-slate-900 border border-white/10 text-white font-bold rounded-2xl hover:bg-slate-800 transition flex items-center justify-center">
                광장 구경하기 👀
              </Link>
            </div>
          </motion.div>
        </section>

        {/* 2️⃣ 개발자 스토리 섹션 (강조!) */}
        <section className="py-20 border-t border-white/5">
          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-[80px] pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-800 rounded-full flex items-center justify-center text-5xl md:text-6xl border-4 border-slate-700 shadow-xl shrink-0">
                🩺
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-black mb-3 text-white">
                  "선수의 마음은 선수가 가장 잘 압니다."
                </h2>
                <p className="text-slate-400 font-medium leading-relaxed mb-6 text-sm md:text-base">
                  안녕하세요, <strong>Moveplaza</strong> 개발자입니다.<br/>
                  저는 <strong>엘리트 축구선수 출신</strong>이자 현재 <strong>물리치료학과</strong>에 재학 중인 학생입니다.<br/><br/>
                  부상으로 인한 아쉬움, 재활의 고통을 누구보다 잘 알기에<br/>
                  후배, 동료 선수들이 <strong>데이터로 부상을 예방</strong>하길 바라는 마음으로 만들었습니다.
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  <span className="px-3 py-1 bg-slate-800 rounded-lg text-xs font-bold text-blue-400 border border-blue-500/20">#엘리트선수출신</span>
                  <span className="px-3 py-1 bg-slate-800 rounded-lg text-xs font-bold text-emerald-400 border border-emerald-500/20">#물리치료전공</span>
                  <span className="px-3 py-1 bg-slate-800 rounded-lg text-xs font-bold text-purple-400 border border-purple-500/20">#부상방지전문</span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* 3️⃣ 기능 소개 섹션 */}
        <section className="py-20 grid md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="bg-slate-900/50 border border-white/5 p-8 rounded-3xl hover:bg-slate-900 transition hover:border-blue-500/30 group"
          >
            <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition"><Icons.Activity /></div>
            <h3 className="text-xl font-black mb-2">데이터 기반 분석</h3>
            <p className="text-slate-400 text-sm leading-relaxed">운동 강도, 컨디션, 통증 데이터를 분석하여 부상 위험을 사전에 감지하고 경고합니다.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="bg-slate-900/50 border border-white/5 p-8 rounded-3xl hover:bg-slate-900 transition hover:border-red-500/30 group"
          >
            <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition"><Icons.Shield /></div>
            <h3 className="text-xl font-black mb-2">부상 히트맵 & 재활</h3>
            <p className="text-slate-400 text-sm leading-relaxed">자주 다치는 부위를 시각화하고, 물리치료학 기반의 전문적인 재활 팁을 제공합니다.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            className="bg-slate-900/50 border border-white/5 p-8 rounded-3xl hover:bg-slate-900 transition hover:border-yellow-500/30 group"
          >
            <div className="w-12 h-12 bg-yellow-500/20 text-yellow-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition"><Icons.Trophy /></div>
            <h3 className="text-xl font-black mb-2">시즌 스탯 & 랭킹</h3>
            <p className="text-slate-400 text-sm leading-relaxed">경기 기록(골/어시스트)을 관리하고, 활동량에 따라 프로~레전드 등급으로 승급하세요.</p>
          </motion.div>
        </section>

        {/* 4️⃣ 하단 CTA */}
        <section className="py-32 text-center border-t border-white/5">
          <h2 className="text-3xl md:text-4xl font-black mb-8">이제, 증명할 차례입니다.</h2>
          <Link href="/login" className="inline-flex items-center justify-center px-10 py-5 bg-white text-slate-950 font-black text-lg rounded-2xl shadow-2xl hover:bg-slate-200 transition transform hover:-translate-y-1">
            지금 바로 시작하기 ⚡️
          </Link>
          <p className="mt-6 text-slate-500 text-xs font-bold">회원가입은 3초면 끝납니다.</p>
        </section>

        <footer className="py-8 text-center text-slate-600 text-xs font-medium border-t border-white/5">
          © 2026 Moveplaza. Created by Physical Therapy Student.
        </footer>

      </div>
    </div>
  )
}