"use client"

import { useChatStore } from "@/store/useChatStore"

const MessageCard = () => {

  const currentUserId = useChatStore(s => s.currentUserId)
  const activeConversationId = useChatStore(s => s.activeConversationId)
  const messagesByConversationId = useChatStore(s => s.messagesByConversationId)

  if (!activeConversationId) return null

  const messages = messagesByConversationId[activeConversationId] || []

  return (
    <div className="flex flex-col gap-3 p-4">

      {messages.map(msg => {

        const isMine =
          msg.senderId === currentUserId ||
          msg.senderId === "me"

        return (

          <div
            key={msg._id || msg.tempId}
            className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
          >

            {isMine ? (
              <span className="text-[10px] text-gray-500 mb-1">
                You
              </span>
            ) : (
              <span className="text-[10px] text-gray-500 mb-1">
                {msg?.senderInfor?.displayName || msg?.displayName || "User"}
              </span>
            )}

            <div className={`flex ${isMine ? "justify-end" : "justify-start"} w-full`}>
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-sm break-words
                ${isMine
                  ? "bg-blue-500 text-white rounded-tr-none"
                  : "bg-gray-200 text-gray-800 rounded-tl-none"}`}
              >
                {msg.content}
              </div>
            </div>

          </div>

        )

      })}

    </div>
  )
}

export default MessageCard