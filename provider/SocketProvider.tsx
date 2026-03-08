"use client"

import { useSocketLastMessage } from "@/hooks/useLastMessage"
import { useSocket } from "@/hooks/useSocket"
import { useSocketMessage } from "@/hooks/useSocketMessage"
import { useChatStore } from "@/store/useChatStore"
import { ReactNode } from "react"

const SocketProvider = ({children } :{children:ReactNode}) => {
  const currentUserId = useChatStore(s => s.currentUserId)

  useSocket(currentUserId || undefined)
  useSocketMessage()
  useSocketLastMessage()

  return children
}

export default SocketProvider