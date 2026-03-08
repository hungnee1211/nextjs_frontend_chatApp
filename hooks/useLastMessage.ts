"use client"

import { useEffect } from "react"
import { useSocketStore } from "@/store/useSocketStore"
import { useChatStore } from "@/store/useChatStore"

export const useSocketLastMessage = () => {

  const socket = useSocketStore(s => s.socket)
  const updateLastMessage = useChatStore(s => s.updateLastMessage)

  useEffect(() => {

    if (!socket) return

    socket.on("last-message", (data) => {

      const { conversationId, message } = data

      updateLastMessage(conversationId, message)

    })

    return () => {
      socket.off("last-message")
    }

  }, [socket, updateLastMessage])
}