"use client"

import { useChatStore } from "@/store/useChatStore"
import { GroupConversation } from "@/lib/types/chat"
import { useMemo } from "react"
import ChatCard from "./ChatCard" // Đảm bảo đường dẫn này đúng với cấu trúc thư mục của bạn

interface Props {
  data?: GroupConversation[] // Nhận dữ liệu đã lọc (nếu có) từ Sidebar search
}

export default function ChatGroupList({ data }: Props) {
  const allConversations = useChatStore(s => s.conversations)

  // Lọc lấy danh sách group từ store nếu props data không được truyền vào
  const storeGroups = useMemo(() => 
    allConversations.filter((c): c is GroupConversation => c.type === "group"),
    [allConversations]
  )
  
  // Ưu tiên sử dụng data từ props (thường dùng cho tính năng search/filter)
  const displayData = data || storeGroups

  return (
    <div className="flex flex-col gap-1 px-2">
      {displayData.map((group) => (
        <ChatCard 
          key={group._id} 
          conversationId={group._id} 
        />
      ))}

      {displayData.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-xs text-muted-foreground italic">
            Không tìm thấy nhóm nào
          </p>
        </div>
      )}
    </div>
  )
}