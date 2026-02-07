"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js" 
import Link from "next/link"

// 👇 1. Supabase 주소와 키를 여기에 붙여넣으세요!
const supabaseUrl = "https://okckpesbufkqhmzcjiab.supabase.co"
const supabaseKey = "sb_publishable_G_y2dTmNj9nGIvu750MlKQ_jjjgxu-t"

const supabase = createClient(supabaseUrl, supabaseKey)

// 아이콘 직접 생성 (에러 방지용)
const Icons = {
  Activity: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
  ),
  AlertCircle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
  ),
  ChevronRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="m9 18 6-6-6-6"/></svg>
  )
}

export default function Dashboard() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState("")

  // 부위 목록
  const bodyParts = [
    "목", "승모근", "어깨", "가슴", "등", "복근", "허리",
    "삼두", "이두", "전완근", "손목", "손",
    "엉덩이", "고관절", "허벅지(앞)", "허벅지(뒤)", "무릎", "종아리", "발목", "발"
  ]

  useEffect(() => {
    const fetchData = async () => {
      // 사용자 정보 가져오기
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      setUserName(user.email?.split("@")[0] || "사용자")

      // 로그 데이터 가져오기
      const { data } = await supabase
        .from('logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data) {
        setLogs(data)
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  // 👇 [핵심 수정] 강력한 필터링 적용!
  // type이 'workout'이거나, 'intensity(강도)' 데이터가 있으면 무조건 제외!
  const rehabLogs = logs.filter((log: any) => {
    if (log.type === 'workout') return false // 운동이면 제외
    if (log.intensity) return false        // 강도가 있으면 운동으로 간주하고 제외
    if (log.type === 'rehab') return true  // 재활이면 포함
    return log.pain_level > 0              // 통증 수치가 있으면 포함
  })

  // 부위별 카운트 계산
  const bodyPartCounts = rehabLogs.reduce((acc: any, log: any) => {
    if (log.body_part) {
      acc[log.body_part] = (acc[log.body_part] || 0) + 1
    }
    return acc
  }, {} as any)

  // 색상 결정 함수
  const getSeverityColor = (count: number) => {
    if (count >= 5) return "bg-red-100 text-red-700 border-red-200"
    if (count >= 3) return "bg-orange-100 text-orange-700 border-orange-200"
    if (count >= 1) return "bg-yellow-100 text-yellow-700 border-yellow-200"
    return "bg-gray-50 text-gray-400 border-gray-100"
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white px-6 py-4 shadow-sm flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">MOVEPLAZA</h1>
        <div className="flex gap-4 text-sm font-medium text-gray-500">
          <span>광장</span>
          <span>내 정보</span>
          <button onClick={async () => {
             await supabase.auth.signOut()
             window.location.href = '/login'
          }}>
            로그아웃
          </button>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* 인사말 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900">
            안녕하세요, <br />
            <span className="text-blue-600">{userName}</span>님!
          </h2>
          <p className="text-gray-500 mt-1">오늘도 데이터를 쌓아볼까요?</p>
        </section>

        {/* 부상 히트맵 */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                부상 히트맵 <span className="text-red-500"><Icons.AlertCircle /></span>
              </h3>
              <p className="text-xs text-gray-400">최근 통증 부위 분석 (재활 기록만)</p>
            </div>
            <span className="text-2xl font-black text-red-500">{rehabLogs.length}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {bodyParts.map((part) => {
              const count = bodyPartCounts[part] || 0
              return (
                <div
                  key={part}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${getSeverityColor(count)}`}
                >
                  {part} {count > 0 && <span className="ml-1 opacity-70">{count}</span>}
                </div>
              )
            })}
          </div>
          
          <div className="mt-6 flex gap-3 text-[10px] text-gray-400 justify-end">
             <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-200"></div>안전</span>
             <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-400"></div>주의</span>
             <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-400"></div>경고</span>
             <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div>위험</span>
          </div>
        </section>

        {/* 최근 활동 */}
        <section>
          <div className="flex justify-between items-end mb-4 px-1">
            <h3 className="text-lg font-bold text-gray-900">최근 활동</h3>
            <Link href="/logs" className="text-xs text-gray-400 flex items-center gap-1">
              전체보기 <Icons.ChevronRight />
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-10 text-gray-400">로딩 중...</div>
            ) : logs.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-400 text-sm">아직 기록이 없습니다.</p>
                <Link href="/record">
                  <button className="mt-3 text-blue-600 font-bold text-sm">+ 첫 기록 남기기</button>
                </Link>
              </div>
            ) : (
              logs.slice(0, 5).map((log) => {
                // 보여줄 때는 DB에 있는 type을 그대로 믿고 표시 (아이콘 구분용)
                const isWorkout = log.type === 'workout' || log.intensity;
                return (
                  <div key={log.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isWorkout ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                        {isWorkout ? <Icons.Activity /> : <Icons.AlertCircle />}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm">
                          {isWorkout ? '운동 기록' : '재활/통증 기록'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {log.body_part || '전신'} · {log.pain_level ? `통증 ${log.pain_level}` : `강도 ${log.intensity}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 font-medium">
                      {new Date(log.created_at).toLocaleDateString()}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>
      </main>

      {/* 기록 버튼 */}
      <Link href="/record">
        <button className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full shadow-xl shadow-blue-600/30 flex items-center justify-center text-white hover:scale-105 transition-transform">
          <span className="text-2xl font-light mb-1">+</span>
        </button>
      </Link>
    </div>
  )
}