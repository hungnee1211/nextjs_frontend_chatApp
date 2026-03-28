"use client"

import { useChatSocket } from "@/hooks/useChatSocket"
import { useChatStore } from "@/store/useChatStore"
import { ReactNode } from "react"

const SocketProvider = ({ children }: { children: ReactNode }) => {
  const currentUserId = useChatStore(s => s.currentUserId)

  // CHỈ DÙNG DUY NHẤT MỘT HOOK NÀY
  // Nó sẽ tự lo: Kết nối, Ngắt kết nối, và Đăng ký mọi Listeners
  useChatSocket(currentUserId || undefined)

  return <>{children}</>
}

export default SocketProvider