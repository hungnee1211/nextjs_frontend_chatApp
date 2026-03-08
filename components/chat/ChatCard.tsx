"use client"

import { useChatStore } from "@/store/useChatStore"
import axios from "axios"
import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import { useSocketStore } from "@/store/useSocketStore"

interface Props {
  conversationId: string
}

const ChatCard = ({ conversationId }: Props) => {
  const {
    conversations,
    currentUserId,
    activeConversationId,
    setActiveConversationId,
    setMessages 
    
  } = useChatStore()


  const conversation = conversations.find(c => c._id === conversationId)

  const handleClick = async () => {
  if (!conversationId) return

  setActiveConversationId(conversationId)

  await handleFetchMessage(conversationId)

}

  const handleFetchMessage = async (conversationId : string) => {
      const res = await axios.get(`http://localhost:5001/api/conversation/${conversationId}/message` , {
        withCredentials:true})

      setMessages(conversationId, res.data.messages)
      console.log(res)
      return res
  }

  const { name, avatar, lastMsg, unread } = useMemo(() => {
    const isGroup = conversation?.type === "group"
    const otherUser = conversation?.participants.find(
      p => p._id !== currentUserId
    )

    return {
      name: isGroup ? conversation?.group?.name : otherUser?.displayName,
      avatar: isGroup ? "/group.png" : otherUser?.avatarUrl ?? "/user.png",
      lastMsg: conversation?.lastMessage?.content ?? "No message yet",
      unread: conversation?.unreadCounts?.[currentUserId!] ?? 0
    }
  }, [conversation, currentUserId])

  return (
    <div
      className={cn(
        activeConversationId === conversationId && "bg-gray-100",
        "flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer rounded-xl transition w-full"
      )}
      onClick={handleClick}
    >
      <Avatar>
        <AvatarImage src={avatar} className="rounded-full w-16 h-16" />
        <AvatarFallback className="rounded-full w-16 h-16">
          {(name && name[0].toUpperCase()) || "CN"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 w-full pr-2">
        <div className="font-semibold text-sm">{name}</div>
        <div className="w-full text-xs text-gray-500 truncate">{lastMsg}</div>
      </div>

      {unread > 0 && (
        <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
          {unread}
        </div>
      )}
    </div>
  )
}

export default ChatCard