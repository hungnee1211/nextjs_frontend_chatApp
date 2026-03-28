"use client"

import { Phone, Video, Info } from "lucide-react"
import { useChatStore } from "@/store/useChatStore"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useMemo } from "react" // Thêm useMemo để tối ưu

const NavbarWindowChat = () => {
  const { 
    activeConversationId, 
    conversations, 
    currentUserId, 
    toggleInfo, 
    isInfoOpen 
  } = useChatStore()

  const conversation = conversations.find(c => c._id === activeConversationId)
  
  // Logic lấy thông tin hiển thị (tên, avatar)
  const displayInfo = useMemo(() => {
    if (!conversation) return null

    const isGroup = conversation.type === "group"

    if (isGroup) {
      return {
        name: conversation.name,
        avatar: conversation.avatar || "/group.png",
        subText: `${conversation.participants?.length || 0} thành viên`
      }
    }

    // Với Direct Chat: Tận dụng field 'user' mà Backend đã map sẵn
    // hoặc tìm trong participants nếu Backend trả về mảng gốc
    const direct = conversation as any
    const otherUser = direct.user || direct.participants?.find((p: any) => {
      const id = typeof p.userId === "string" ? p.userId : p.userId._id
      return id !== currentUserId
    })?.userId

    return {
      name: otherUser?.displayName || "Người dùng",
      avatar: otherUser?.avatarUrl || "/user.png",
      subText: "Đang hoạt động"
    }
  }, [conversation, currentUserId])

  if (!conversation || !displayInfo) return null

  return (
    <div className="h-[72px] border-b bg-white/80 backdrop-blur-md sticky top-0 z-20 px-6 flex items-center justify-between shadow-sm">
      
      {/* LEFT: User Info */}
      <div className="flex items-center gap-4 group cursor-pointer">
        <div className="relative">
          <Avatar className="h-11 w-11 border-2 border-white shadow-sm transition-transform group-hover:scale-105">
            <AvatarImage src={"http://localhost:5001" +displayInfo.avatar} className="object-cover" />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-medium">
              {displayInfo.name?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {conversation.type !== "group" && (
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-[2.5px] border-white rounded-full shadow-sm" />
          )}
        </div>

        <div className="flex flex-col">
          <h3 className="font-bold text-[15px] text-gray-900 leading-tight tracking-tight">
            {displayInfo.name}
          </h3>
          <div className="flex items-center gap-1.5">
            {conversation.type === "group" ? (
              <span className="text-[12px] font-medium text-gray-400">
                {displayInfo.subText}
              </span>
            ) : (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[12px] font-medium text-green-600">
                  {displayInfo.subText}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: Actions */}
      <div className="flex items-center gap-1">
        <TooltipProvider delayDuration={100}>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-2.5 rounded-full text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-90">
                <Phone size={20} strokeWidth={2.2} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Bắt đầu cuộc gọi thoại</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-2.5 rounded-full text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all active:scale-90">
                <Video size={21} strokeWidth={2.2} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Bắt đầu gọi video</TooltipContent>
          </Tooltip>

          <div className="w-[1px] h-6 bg-gray-200 mx-2" />

          <Tooltip>
            <TooltipTrigger asChild>
              
            </TooltipTrigger>
            <TooltipContent>Thông tin hội thoại</TooltipContent>
          </Tooltip>

          <button 
                onClick={toggleInfo}
                className={`p-2.5 rounded-full transition-all active:scale-90 ${
                    isInfoOpen 
                    ? "bg-blue-50 text-blue-600" 
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Info size={21} strokeWidth={2.2} />
          </button>

        </TooltipProvider>
      </div>

    </div>
  )
}

export default NavbarWindowChat