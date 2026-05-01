import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value
  const refreshToken = request.cookies.get('refreshToken')?.value
  const { pathname } = request.nextUrl

  // 1. Nếu ĐÃ CÓ token mà lại đang đứng ở trang signin/signup
  // THÊM ĐOẠN NÀY ĐỂ CHUYỂN VỀ TRANG CHỦ SAU KHI LOGIN
  if ((accessToken || refreshToken) && (pathname === '/signin' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 2. Nếu MẤT CẢ HAI token và đang truy cập trang bảo mật (không phải signin/signup)
  if (!accessToken && !refreshToken && pathname !== '/signin' && pathname !== '/signup') {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  // Cho phép đi tiếp nếu đang có token hoặc đang ở trang login
  return NextResponse.next()
}

export const config = {
  matcher: [
    /* Áp dụng cho tất cả trừ file tĩnh */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|css|js|map)$).*)',
  ],
}