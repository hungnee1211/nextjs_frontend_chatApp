"use client"

import { useChatStore } from "@/store/useChatStore"
import axios from "axios"
import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, Trash2, UserPlus } from "lucide-react"
import { toast } from "sonner"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import AddMemberModal from "../form/AddMemberForm"



const ChatCard = ({ conversationId }: { conversationId: string }) => {

  const {
    conversations,
    currentUserId,
    activeConversationId,
    setActiveConversationId,
    setMessages,
    removeConversation
  } = useChatStore()

  const conversation = conversations?.find(c => c._id === conversationId)

  const [openAddMember, setOpenAddMember] = useState(false)

  if (!conversation) return null

  const handleClick = async () => {

    setActiveConversationId(conversationId)

    try {

      const res = await axios.get(
        `http://localhost:5001/api/conversation/${conversationId}/message`,
        { withCredentials: true }
      )

      setMessages(conversationId, res.data.messages)

    } catch (err) {

      console.error("Lỗi fetch tin nhắn:", err)

    }
  }

  const handleDelete = async (e: React.MouseEvent) => {

    e.stopPropagation()

    try {

      const res = await axios.delete(
        `http://localhost:5001/api/conversation/${conversationId}/delete`,
        { withCredentials: true }
      )

      if (res.status === 200) {

        toast.success("Đã xóa cuộc hội thoại")
        removeConversation(conversationId)

      }

    } catch (err) {

      toast.error("Không thể xóa hội thoại")
      console.error(err)

    }
  }

  const info = useMemo(() => {

    const isGroup = conversation?.type === "group"

    const otherUser = conversation?.participants?.find(
      (p: any) => p._id !== currentUserId
    )

    return {

      name: isGroup
        ? conversation?.group?.name
        : (otherUser?.displayName || "Người dùng"),

      avatar: isGroup
        ? "/group.png"
        : (otherUser?.avatarUrl || "/user.png"),

      lastMsg: conversation?.lastMessage?.content || "Chưa có tin nhắn",

      unread: conversation?.unreadCounts?.[currentUserId || ""] || 0

    }

  }, [conversation, currentUserId])

  return (
    <>

      <div
        onClick={handleClick}
        className={cn(
          "group relative flex items-center gap-3 p-3 cursor-pointer rounded-xl transition-all w-full mb-1",
          activeConversationId === conversationId
            ? "bg-gray-100 shadow-sm"
            : "hover:bg-gray-50"
        )}
      >

        <div className="relative flex-shrink-0">

          <Avatar className="h-12 w-12 border">

            <AvatarImage
              src={info.avatar}
              className="object-cover rounded-full"
            />

            <AvatarFallback className="rounded-full font-bold">
              {info.name?.[0] || "?"}
            </AvatarFallback>

          </Avatar>

          {info.unread > 0 && (

            <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white font-bold">
              {info.unread}
            </div>

          )}

        </div>

        <div className="flex-1 min-w-0 pr-8">

          <h4 className="font-semibold text-sm truncate text-gray-900">
            {info.name}
          </h4>

          <p className="text-xs text-gray-500 truncate mt-0.5">
            {info.lastMsg}
          </p>

        </div>

        <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">

          <DropdownMenu>

            <DropdownMenuTrigger asChild>

              <button
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 hover:bg-white rounded-full border shadow-sm bg-white/90 transition-colors"
              >
                <MoreHorizontal size={16} className="text-gray-600" />
              </button>

            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-44">

              {conversation.type === "group" && (

                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpenAddMember(true)
                  }}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <UserPlus size={14} />
                  Thêm thành viên
                </DropdownMenuItem>

              )}

              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer flex items-center gap-2"
              >
                <Trash2 size={14} />
                Xóa hội thoại
              </DropdownMenuItem>

            </DropdownMenuContent>

          </DropdownMenu>

        </div>

      </div>


      <AddMemberModal
        conversationId={conversationId}
        open={openAddMember}
        onClose={() => setOpenAddMember(false)}
      />

    </>
  )
}

export default ChatCard