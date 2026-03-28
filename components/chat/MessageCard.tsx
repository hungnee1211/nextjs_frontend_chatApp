"use client"

import { useChatStore } from "@/store/useChatStore"
import { useState, useEffect, useRef, useLayoutEffect } from "react"

const PAGE_SIZE = 8

const MessageCard = () => {
  const currentUserId = useChatStore(s => s.currentUserId)
  const activeConversationId = useChatStore(s => s.activeConversationId)
  const messagesByConversationId = useChatStore(s => s.messagesByConversationId)
  
  const [limit, setLimit] = useState(PAGE_SIZE)
  const scrollRef = useRef<HTMLDivElement>(null)
  const topSentinelRef = useRef<HTMLDivElement>(null)
  const lastScrollHeight = useRef<number>(0)

  // Đảm bảo lấy đúng mảng tin nhắn, tránh lỗi undefined/slice
  const allMessages = activeConversationId ? (messagesByConversationId[activeConversationId] || []) : []
  const visibleMessages = allMessages.slice(-limit)
  const hasMore = allMessages.length > limit

  // 1. Tự động cuộn xuống đáy khi mới vào chat hoặc có tin nhắn mới hoàn toàn
  useEffect(() => {
    if (scrollRef.current && lastScrollHeight.current === 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [allMessages.length, activeConversationId])

  // 2. Infinite Scroll: Khi cuộn lên đỉnh thì tăng limit thêm 8
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          if (scrollRef.current) {
            // Lưu lại chiều cao hiện tại trước khi mảng dài ra
            lastScrollHeight.current = scrollRef.current.scrollHeight
          }
          setLimit(prev => prev + PAGE_SIZE)
        }
      },
      { threshold: 0.1 }
    )

    if (topSentinelRef.current) observer.observe(topSentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore])

  // 3. Xử lý Scroll Memory: Giữ vị trí đang đọc khi tin nhắn cũ được thêm vào đầu
  useLayoutEffect(() => {
    if (scrollRef.current && lastScrollHeight.current > 0) {
      const newHeight = scrollRef.current.scrollHeight
      const diff = newHeight - lastScrollHeight.current
      scrollRef.current.scrollTop = diff
      lastScrollHeight.current = 0
    }
  }, [visibleMessages.length])

  // Reset khi đổi hội thoại
  useEffect(() => {
    setLimit(PAGE_SIZE)
    lastScrollHeight.current = 0
  }, [activeConversationId])

  return (
    <div 
      ref={scrollRef} 
      className="absolute inset-0 overflow-y-auto overflow-x-hidden p-4 flex flex-col scroll-smooth"
    >
      {/* Sentinel để trigger load more */}
      <div ref={topSentinelRef} className="h-2 w-full flex-shrink-0" />
      
      {hasMore && (
        <div className="flex justify-center p-2">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* mt-auto giúp tin nhắn dính đáy nếu hội thoại ít tin */}
      <div className="flex flex-col mt-auto gap-[2px]">
        {visibleMessages.map((msg, index) => {
          const isMine = msg.senderId === currentUserId || msg.senderId === "me"
          
          // Logic so sánh để bo góc (Messenger Style)
          const nextMsg = visibleMessages[index + 1]
          const prevMsg = visibleMessages[index - 1]
          const isSameAsNext = nextMsg?.senderId === msg.senderId
          const isSameAsPrev = prevMsg?.senderId === msg.senderId

          return (
            <div
              key={msg._id || msg.tempId || index}
              className={`flex flex-col ${isMine ? "items-end" : "items-start"} ${!isSameAsNext ? "mb-3" : ""}`}
            >
              {/* Chỉ hiện tên nếu là tin đầu tiên trong chuỗi của người khác */}
              {!isMine && !isSameAsPrev && (
                <span className="text-[11px] font-medium text-zinc-500 ml-2 mb-1">
                  {msg?.senderSnapshot?.name ||  "User"}
                </span>
              )}

              <div
                className={`max-w-[75%] px-4 py-2 text-[15px] shadow-sm break-words
                  ${isMine 
                    ? "bg-blue-600 text-white" 
                    : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"}
                  
                  /* Logic bo góc chuẩn Messenger */
                  ${isMine 
                    ? `rounded-2xl ${isSameAsPrev ? "rounded-tr-sm" : "rounded-tr-2xl"} ${isSameAsNext ? "rounded-br-sm" : "rounded-br-2xl"}`
                    : `rounded-2xl ${isSameAsPrev ? "rounded-tl-sm" : "rounded-tl-2xl"} ${isSameAsNext ? "rounded-bl-sm" : "rounded-bl-2xl"}`
                  }
                `}
              >
                {msg.content}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MessageCard