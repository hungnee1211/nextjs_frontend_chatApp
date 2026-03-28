"use client"

import { useChatStore } from "@/store/useChatStore"
import ChatCard from "./ChatCard"
import { Conversation, DirectConversation } from "@/lib/types/chat";
import { useMemo } from "react";

interface Props {
  data?: Conversation[]; // Thêm prop này
}

const ChatDirectList = ({ data }: Props) => {

  const allConversations = useChatStore(s => s.conversations)
  const storeDirects = useMemo(() => 
  allConversations.filter((c): c is DirectConversation => c.type === "direct"),
  [allConversations]
)
  const displayData = data || storeDirects;

  return (
    <div className="space-y-2">
      {displayData.map((convo) => (
        <ChatCard
          key={convo._id}
          conversationId={convo._id}
        />
      ))} 
      {displayData.length === 0 && (
        <p className="text-xs text-center text-muted-foreground py-4">Không tìm thấy hội thoại</p>
      )}
    </div>
  )
}

export default ChatDirectList