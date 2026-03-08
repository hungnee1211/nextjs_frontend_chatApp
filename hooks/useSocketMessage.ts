"use client"

import { useEffect } from "react"
import { useSocketStore } from "@/store/useSocketStore"
import { useChatStore } from "@/store/useChatStore"

export const useSocketMessage = () => {

  const socket = useSocketStore((s) => s.socket)
  const addMessage = useChatStore((s) => s.addMessage)

  useEffect(() => {

    if (!socket) return

    const handleReceiveMessage = (message: any) => {
      addMessage(message)
    }

    socket.on("receive-message", handleReceiveMessage)

    return () => {
      socket.off("receive-message", handleReceiveMessage)
    }

  }, [socket, addMessage])

}