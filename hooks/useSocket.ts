// hooks/useSocket.ts
"use client"

import { useEffect } from "react"
import { useSocketStore } from "@/store/useSocketStore"

export const useSocket = (userId?: string) => {
  const connect = useSocketStore(s => s.connect)
  const disconnect = useSocketStore(s => s.disconnect)

  useEffect(() => {
    if (!userId) return

    connect(userId)

    return () => {
      disconnect()
    }
  }, [userId])
}