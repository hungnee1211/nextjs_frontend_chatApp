"use client"

import { useChatStore } from "@/store/useChatStore"
import { useSocketStore } from "@/store/useSocketStore"
import axios from "axios"
import { useMemo, useState, useEffect } from "react"
import { cn } from "@/lib/utils"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { MoreHorizontal, Trash2, UserPlus, Users } from "lucide-react"
import { toast } from "sonner"
import { format, isToday, isYesterday } from "date-fns"

import AddMemberModal from "../form/AddMemberForm"
import { Conversation, DirectConversation } from "@/lib/types/chat"
import axiosClient from "@/lib/axios_config"

const ChatCard = ({ conversationId }: { conversationId: string }) => {
  const {
    conversations,
    currentUserId,
    activeConversationId,
    setActiveConversationId,
    setMessages,
    removeConversation
  } = useChatStore()

  const socket = useSocketStore(s => s.socket)
  const conversation = conversations.find(c => c._id === conversationId)
  
  const [openAddMember, setOpenAddMember] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])

  if (!conversation) return null

  const isActive = activeConversationId === conversationId


  const formatTime = (dateString?: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    if (isToday(date)) return format(date, "HH:mm")
    if (isYesterday(date)) return "Hôm qua"
    return format(date, "dd/MM")
  }

const info = useMemo(() => {
  if (!currentUserId || !conversation) return null;
  const isGroup = conversation.type === "group";

  // Lấy unreadCount từ field Backend đã tính sẵn hoặc tìm trong participants
  const unreadCount = (conversation as any).unreadCount ?? 
    Number(conversation.participants.find(p => 
      (typeof p.userId === "string" ? p.userId : p.userId._id) === currentUserId
    )?.unreadCount || 0);

  if (!isGroup) {
    // Ép kiểu để lấy field 'user' mà Backend gửi về
    const direct = conversation as any; 
    const otherUser = direct.user; // Backend đã để sẵn user ở đây rồi!

    return {
      name: otherUser?.displayName || "Người dùng",
      // Quan trọng: Kiểm tra đúng field avatarUrl
      avatar: otherUser?.avatarUrl || "/user.png", 
      lastMsg: typeof conversation.lastMessage === "object" 
        ? (conversation.lastMessage as any)?.content 
        : "Bắt đầu cuộc trò chuyện",
      time: formatTime(conversation.lastMessageAt),
      unread: unreadCount,
      otherUserId: otherUser?._id,
      isGroup: false
    };
  }

  // Logic cho Group
  return {
    name: (conversation as any).name,
    avatar: (conversation as any).avatar || "/group.png",
    lastMsg: typeof conversation.lastMessage === "object" 
      ? (conversation.lastMessage as any)?.content 
      : "Chưa có tin nhắn",
    time: formatTime(conversation.lastMessageAt),
    unread: unreadCount,
    isGroup: true
  };
}, [conversation, currentUserId]);


  console.log(info)
  // Thay thế hàm checkUnread cũ bằng logic hiển thị trực tiếp
  const renderUnreadBadge = () => {
    const count = info?.unread || 0;
    if (count <= 0 || isTyping) return null; // Nếu bằng 0 hoặc đang typing thì biến mất hoàn toàn

    return (
      <span className="h-5 min-w-[20px] px-1.5 bg-blue-400 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0 shadow-sm animate-in zoom-in duration-200">
        {count > 9 ? "9+" : count}
      </span>
    );
  };

  
  useEffect(() => {
    if (!socket || !conversationId) return
    const handleTyping = (data: any) => {
      if (data.conversationId !== conversationId) return
      setTypingUsers(prev => prev.includes(data.userId) ? prev : [...prev, data.userId])
      setTimeout(() => setTypingUsers(prev => prev.filter(id => id !== data.userId)), 2000)
    }
    const handleOnline = (users: string[]) => setOnlineUsers(users)

    socket.on("typing", handleTyping)
    socket.on("online-users", handleOnline)
    return () => {
      socket.off("typing", handleTyping)
      socket.off("online-users", handleOnline)
    }
  }, [socket, conversationId])

 
  const handleClick = async () => {
    setActiveConversationId(conversationId)
    useChatStore.setState((state) => ({
    conversations: state.conversations.map((c) => {
      if (c._id !== conversationId) return c
      return {
        ...c,
        participants: (c.participants as any[]).map((p) => {
          const pId = typeof p.userId === "string" ? p.userId : p.userId._id
          if (pId === currentUserId) return { ...p, unreadCount: 0 }
          return p
        }),
      }
    }) as any, 
  }))
    try {
      const res = await axiosClient.get(`http://localhost:5001/api/message/${conversationId}`, { withCredentials: true })
      setMessages(conversationId, res.data)
      await axiosClient.patch(`http://localhost:5001/api/message/${conversationId}/read`, {}, { withCredentials: true })
    } catch (err) { console.error("Error:", err) }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation() // Quan trọng: không kích hoạt handleClick của card cha
    try {
      await axiosClient.delete(`http://localhost:5001/api/conversation/${conversationId}`, { withCredentials: true })
      toast.success("Đã xóa hội thoại")
      removeConversation(conversationId)
    } catch {
      toast.error("Không thể xóa")
    }
  }

  const isOnline = info?.otherUserId && onlineUsers.includes(info.otherUserId)
  const isTyping = typingUsers.length > 0
  

  return (
    <>
      <div
        onClick={handleClick}
        className={cn(
          "group flex items-center gap-3 p-3 mx-2 my-1 rounded-2xl cursor-pointer transition-all duration-200 relative",
          isActive ? "bg-blue-600/10 shadow-sm" : "hover:bg-slate-100 active:scale-[0.99]"
        )}
      >
        {/* AVATAR KHÔNG CO GIÃN */}
        <div className="relative flex-shrink-0">
          <Avatar className="h-12 w-12 border border-slate-100 shadow-sm">
            <AvatarImage src={"http://localhost:5001" + info?.avatar} className="object-cover" />
           <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-medium">
              {info?.name?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {isOnline && (
            <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm" />
          )}
        </div>

        {/* NỘI DUNG CHÍNH - FLEX 1 VÀ MIN-W-0 ĐỂ KHÔNG BỊ GÃY */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-0.5">
            <h4 className={cn(
              "text-[14px] font-bold truncate pr-2",
              isActive ? "text-blue-600" : "text-slate-900"
            )}>
              {info?.name}
            </h4>
            <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap flex-shrink-0">
              {info?.time}
            </span>
          </div>

          <div className="flex items-center justify-between gap-1">
            <p className={cn(
              "text-xs truncate leading-5",
              isTyping ? "text-blue-500 italic font-medium" : 
              (info?.unread && info.unread > 0 ? "text-slate-900 font-bold" : "text-slate-500")
            )}>
              {isTyping ? "Đang nhập..." : info?.lastMsg}
            </p>

            {/* UNREAD CHỈ HIỆN KHI KHÔNG TYPING */}
            {renderUnreadBadge()}
          </div>
        </div>

        {/* VẠCH TRẠNG THÁI ACTIVE */}
        {isActive && (
          <div className="absolute left-0 top-3 bottom-3 w-1 bg-blue-600 rounded-r-full" />
        )}
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