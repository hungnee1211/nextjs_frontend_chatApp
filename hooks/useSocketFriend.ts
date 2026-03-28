"use client"

import { useEffect } from "react"
import { useSocketStore } from "@/store/useSocketStore"
import { useFriendStore } from "@/store/useFriendStore"
import { useChatStore } from "@/store/useChatStore"
import { toast } from "sonner"

export const useSocketFriend = () => {
  const socket = useSocketStore(s => s.socket)

  const addIncomingRequest = useFriendStore(s => s.addIncomingRequest)

  const setConversations = useChatStore(s => s.setConversations)
  const conversations = useChatStore(s => s.conversations)

  useEffect(() => {
    if (!socket) return

    const handleFriendRequest = (request: any) => {
      addIncomingRequest(request)
      toast.info("Bạn có lời mời kết bạn mới!")
    }

    
    const handleNewConversation = (conversation: any) => {
      console.log("New conversation:", conversation)

    
      const exists = conversations.some(
        (c: any) => c._id === conversation._id
      )

      if (exists) return

      setConversations([conversation, ...conversations])

      toast.success("Bạn đã có cuộc trò chuyện mới!")
    }

    socket.on("new-friend-request", handleFriendRequest)
    socket.on("new-conversation", handleNewConversation)

    return () => {
      socket.off("new-friend-request", handleFriendRequest)
      socket.off("new-conversation", handleNewConversation)
    }

  }, [socket, addIncomingRequest, setConversations, conversations])
}