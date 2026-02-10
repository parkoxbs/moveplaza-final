import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// 👇 Supabase 주소와 키 (그대로 두시면 됩니다)
const supabaseUrl = "https://okckpesbufkqhmzcjiab.supabase.co"
const supabaseKey = "sb_publishable_G_y2dTmNj9nGIvu750MlKQ_jjjgxu-t"

// 🛠️ 수정된 부분: export default를 추가했습니다.
export default async function middleware(request: NextRequest) {
  // 1. 응답 객체 생성
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Supabase 클라이언트 생성 (쿠키 관리용)
  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. 현재 로그인된 유저 정보 가져오기
  const { data: { user } } = await supabase.auth.getUser()

  // 4. 로그인이 필요한 페이지들 (보호 구역 🛡️)
  const protectedPaths = ['/dashboard', '/community', '/stats', '/mypage']
  
  // 현재 가려는 페이지가 보호 구역인지 확인
  const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))

  // 🚨 상황 1: 로그인 안 했는데 보호 구역에 가려고 함 -> 로그인 페이지로 튕겨내기
  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 👋 상황 2: 이미 로그인했는데 또 로그인 페이지로 감 -> 대시보드로 보내주기
  if (user && request.nextUrl.pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return response
}

// 미들웨어가 적용될 경로 설정 (이미지, 정적 파일 등은 제외)
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}