import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const supabaseUrl = "https://okckpesbufkqhmzcjiab.supabase.co"
const supabaseKey = "sb_publishable_G_y2dTmNj9nGIvu750MlKQ_jjjgxu-t"

export default async function middleware(request: NextRequest) {
  // 1. 응답 객체 미리 생성 (쿠키 처리를 위해 필수)
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. 서버 클라이언트 생성 (쿠키 동기화)
  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // 요청과 응답 양쪽에 쿠키를 업데이트해줍니다. (이게 핵심!)
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

  // 3. 진짜 유저 정보 가져오기
  const { data: { user } } = await supabase.auth.getUser()

  // 4. 보호된 경로 설정 (로그인해야만 갈 수 있는 곳)
  const protectedPaths = ['/dashboard', '/community', '/stats', '/mypage', '/lineup']
  
  // 현재 경로 확인
  const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))
  const isAuthPage = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup'

  // 🚨 [차단] 로그인 안 했는데 보호된 곳 가려고 할 때
  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 👋 [안내] 이미 로그인했는데 로그인 페이지 가려고 할 때
  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // 변경된 쿠키가 담긴 response 반환 (매우 중요)
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}