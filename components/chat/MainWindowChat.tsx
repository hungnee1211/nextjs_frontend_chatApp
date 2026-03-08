"use client"

import { useChatStore } from "@/store/useChatStore"
import MessageCard from "./MessageCard"

const MainWindowChat = () => {
  const activeConversationId = useChatStore(s => s.activeConversationId)

  if (!activeConversationId) return null

  return (
    <div className="flex-1  overflow-y-auto p-4">
      <MessageCard />
    </div>
  )
}

export default MainWindowChat