"use client"

import { Smile, SendHorizonal, Ban } from "lucide-react" // Thêm icon Ban cho đẹp
import { useChatStore } from "@/store/useChatStore"
import { useState, useEffect, useRef, useMemo } from "react"
import axios from "axios"
import { useSocketStore } from "@/store/useSocketStore"
import { useUserStore } from "@/store/useUserStore"
import EmojiPicker, { Theme } from "emoji-picker-react"
import axiosClient from "@/lib/axios_config"

const FooterWindowChat = () => {
  const { activeConversationId, conversations, addMessage } = useChatStore()
  const { user } = useUserStore()
  const [content, setContent] = useState("")
  const [showEmoji, setShowEmoji] = useState(false)
  const { socket } = useSocketStore()
  const emojiPickerRef = useRef<HTMLDivElement>(null)

  // 1. Tìm conversation hiện tại và kiểm tra trạng thái Block
  const currentConversation = useMemo(() => {
    return conversations.find(c => c._id === activeConversationId)
  }, [conversations, activeConversationId])

  // Kiểm tra nếu mảng blockedBy có dữ liệu (không quan tâm ai chặn ai, cứ có chặn là không cho chat)
 const isBlocked = useMemo(() => {
    // Nếu không có conversation hoặc là Group thì mặc định không bị block (hoặc xử lý kiểu khác)
    if (!currentConversation || currentConversation.type === "group") return false;

    // Lúc này TypeScript đã hiểu currentConversation là DirectConversation
    // Bạn có thể an tâm truy cập .blockedBy
    return currentConversation.blockedBy && currentConversation.blockedBy.length > 0;
  }, [currentConversation])


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmoji(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (socket && activeConversationId) {
      socket.emit("join-conversation", activeConversationId)
    }
  }, [socket, activeConversationId])

  if (!activeConversationId) return null

const handleClickSendMessage = async () => {
    if (!content.trim() || isBlocked || !currentConversation) return 

    const tempId = crypto.randomUUID()

    // Tạo object message khớp hoàn toàn với Interface Message
    const message: any = { // Bạn có thể để :any tạm thời hoặc khai báo đúng type
      _id: tempId,
      tempId,
      conversationId: activeConversationId,
      conversationType: currentConversation.type, // Bổ sung trường này
      content,
      senderId: user?._id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(), // Bổ sung trường này
      // Sử dụng senderSnapshot thay vì senderInfor để khớp với Interface của bạn
      senderSnapshot: {
        name: user?.displayName || "",
        avatar: user?.avatarUrl || ""
      }
    }

    // Optimistic UI
    addMessage(message)

    // Realtime - gửi đi cũng nên khớp cấu trúc
    socket?.emit("send-message", {
      ...message,
      // Nếu phía Server vẫn đang dùng senderInfor thì bạn giữ nguyên, 
      // nhưng tốt nhất nên đồng bộ thành senderSnapshot
      senderInfor: { displayName: user?.displayName } 
    })

    try {
      const api = currentConversation.type === "group"
        ? "http://localhost:5001/api/message/group"
        : "http://localhost:5001/api/message/direct"

      await axiosClient.post(
        api,
        { 
          conversationId: activeConversationId, 
          content, 
          tempId,
          // Gửi thêm conversationType nếu backend cần
          conversationType: currentConversation.type 
        },
        { withCredentials: true }
      )
    } catch (err) {
      console.error("Save message error", err)
    }

    setContent("")
    setShowEmoji(false)
  }


  const onEmojiClick = (emojiData: any) => {
    setContent((prev) => prev + emojiData.emoji)
  }

  // --- RENDERING ---
  return (
    <div className="h-20 border-t bg-white px-4 flex items-center relative">
      {isBlocked ? (
        <div className="w-full flex -mt-2 items-center justify-center gap-2 text-slate-400 font-medium italic rounded-xl ">
          <Ban size={18} />
          <span>MÀY BỊ CHẶN</span>
        </div>
      ) : (
        /* TRƯỜNG HỢP BÌNH THƯỜNG */
        <>
          {showEmoji && (
            <div 
              ref={emojiPickerRef} 
              className="fixed bottom-[85px] z-[9999] shadow-2xl ring-1 ring-black/5"
            >
              <EmojiPicker 
                theme={Theme.LIGHT} 
                onEmojiClick={onEmojiClick}
                autoFocusSearch={false}
                width={300}
                height={400}
              />
            </div>
          )}

          <div className="flex items-center w-full gap-2 bg-gray-100 rounded-full px-3 py-2">
            <button 
              type="button"
              onClick={() => setShowEmoji(!showEmoji)}
              className={`hover:text-gray-700 transition ${showEmoji ? "text-blue-500" : "text-gray-500"}`}
            >
              <Smile size={22} />
            </button>

            <input
              className="flex-1 bg-transparent outline-none px-2 text-sm text-black"
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
        </>
      )}
    </div>
  )
}

export default FooterWindowChat