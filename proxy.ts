import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// PHẢI đổi tên từ 'proxy' thành 'middleware'
export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value
  const refreshToken = request.cookies.get('refreshToken')?.value
  const { pathname } = request.nextUrl

  // 1. Nếu đã có token (đã đăng nhập) mà người dùng cố vào /signin hoặc /signup
  if ((accessToken || refreshToken) && (pathname === '/signin' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 2. Nếu CHƯA đăng nhập (thiếu cả 2 token) và đang truy cập các trang bảo mật
  // (Matcher đã lọc sẵn các trang public, nên ở đây chỉ cần check token)
  if (!accessToken && !refreshToken && pathname !== '/signin' && pathname !== '/signup') {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  // Các trường hợp còn lại (đang trong quá trình refresh hoặc đã có token) cho đi tiếp
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
      Áp dụng cho TẤT CẢ route trừ các file tĩnh và các trang public
    */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|css|js|map)$).*)',
  ],
}