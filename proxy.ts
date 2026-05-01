// proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value
  const refreshToken = request.cookies.get('refreshToken')?.value
  const { pathname } = request.nextUrl

  // 1. Nếu ĐÃ CÓ token (đã đăng nhập) mà cố vào trang signin/signup
  // Phải redirect về trang chủ ngay lập tức
  if ((accessToken || refreshToken) && (pathname === '/signin' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 2. Nếu CHƯA CÓ token và truy cập trang bảo mật (không phải signin/signup)
  if (!accessToken && !refreshToken && pathname !== '/signin' && pathname !== '/signup') {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  // Cho phép đi tiếp cho các trường hợp còn lại (có token ở trang chủ, hoặc chưa token ở trang signin)
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
      Áp dụng cho tất cả route trừ:
      - _next (static, image)
      - favicon
      - các file tĩnh (png, jpg, css, v.v.)
    */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|css|js|map)$).*)',
  ],
}