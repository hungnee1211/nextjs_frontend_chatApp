"use client"

import { Smile, SendHorizonal } from "lucide-react"
import { useChatStore } from "@/store/useChatStore"
import { useState, useEffect } from "react"
import axios from "axios"
import { useSocketStore } from "@/store/useSocketStore"
import { useUserStore } from "@/store/useUserStore"

const FooterWindowChat = () => {

  const { activeConversationId, conversations, addMessage } = useChatStore()
  const { user } = useUserStore()
  const [content, setContent] = useState("")
  const { socket } = useSocketStore()

  useEffect(() => {

    if (socket && activeConversationId) {
      socket.emit("join-conversation", activeConversationId)
    }

  }, [socket, activeConversationId])

  if (!activeConversationId) return null

  const handleClickSendMessage = async () => {

    if (!content.trim()) return

    const tempId = crypto.randomUUID()

    const message = {
      _id: tempId,
      tempId,
      conversationId: activeConversationId,
      content,
      senderId: user?._id,
      createdAt: new Date().toISOString(),
      temp: true,
      senderInfor: {
        displayName: user?.displayName
      }
    }

    // optimistic UI
    addMessage(message)

    // realtime
    socket?.emit("send-message", {
      conversationId: activeConversationId,
      content,
      tempId,
      senderInfor: {
        displayName: user?.displayName
      }
    })

    try {

      const conversation = conversations.find(c => c._id === activeConversationId)

      const api =
        conversation?.type === "group"
          ? "http://localhost:5001/api/message/group"
          : "http://localhost:5001/api/message/direct"

      await axios.post(
        api,
        {
          conversationId: activeConversationId,
          content,
          tempId
        },
        { withCredentials: true }
      )

    } catch (err) {
      console.error("Save message error", err)
    }

    setContent("")

  }

  return (
    <div className="h-16 border-t bg-white px-4 flex items-center">
      <div className="flex items-center w-full gap-2 bg-gray-100 rounded-full px-3 py-2">

        <button className="text-gray-500 hover:text-gray-700">
          <Smile size={22} />
        </button>

        <input
          className="flex-1 bg-transparent outline-none px-2 text-sm"
          placeholder="Nhập tin nhắn..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleClickSendMessage()}
        />

        <button
          onClick={handleClickSendMessage}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition shadow-sm"
        >
          <SendHorizonal size={18} />
        </button>

      </div>
    </div>
  )
}

export default FooterWindowChat