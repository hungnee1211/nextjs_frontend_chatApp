import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
// This function can be marked `async` if using `await` inside
export function proxy(request: NextRequest) {

  const accessToken = request.cookies.get('accessToken')?.value
  const refreshToken = request.cookies.get('refreshToken')?.value

  

  // CHỈ redirect khi MẤT CẢ HAI token
  // Nếu mất Access nhưng còn Refresh -> Cho qua để Client tự Refresh
  if (accessToken) {
  return NextResponse.next();
}

if (!accessToken && refreshToken) {
  return NextResponse.next();
}

  // Chỉ khi mất cả hai mới đá ra signin
  if (!accessToken && !refreshToken) {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  return NextResponse.next()
}

 
// Alternatively, you can use a default export:
// export default function proxy(request: NextRequest) { ... }
 
export const config = {
  matcher: [
    /*
      Áp dụng cho TẤT CẢ route
      NGOẠI TRỪ:
      - _next (static, image)
      - favicon
      - file tĩnh: png, jpg, jpeg, svg, gif, webp
      - css, js, map
      - signin, signup (public page)
    */
    '/((?!_next/static|_next/image|favicon.ico|signin|signup|.*\\.(?:png|jpg|jpeg|svg|gif|webp|css|js|map)$).*)',
  ],
}