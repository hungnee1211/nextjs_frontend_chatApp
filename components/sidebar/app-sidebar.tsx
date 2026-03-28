"use client"

import * as React from "react"
import { Search, X, MessageSquare, Users, Plus } from "lucide-react"

import CreateNewGroup from "../chat/CreateNewGroup"
import ChatGroupList from "../chat/ChatGroupList"
import CreateDirectChat from "../chat/CreateDirectChat"
import ChatDirectList from "../chat/ChatDirectList"

import { Conversation, DirectConversation, GroupConversation } from "@/lib/types/chat"
import { User } from "@/lib/types/user"
import { useChatStore } from "@/store/useChatStore"
import AddFriendForm from "../form/AddFriendForm"
import AddGroupForm from "../form/AddGroupForm"
import { Input } from "../ui/input"
import { cn } from "@/lib/utils" // Đảm bảo bạn có hàm cn của shadcn

interface Props {
  conversations: Conversation[]
  currentUserId: string
  user: User
}

type TabType = "direct" | "group"

export function AppSidebar({
  conversations,
  currentUserId,
  user
}: Props) {
  const { openDirect, setOpenDirect, openGroup, setOpenGroup } = useChatStore()
  const [activeTab, setActiveTab] = React.useState<TabType>("direct")
  const [searchValue, setSearchValue] = React.useState("")

  // --- LOGIC GIỮ NGUYÊN ---
  const filteredData = React.useMemo(() => {
    const s = searchValue.trim().toLowerCase()
    if (!s) return { groups: [], directs: [] }

    const groups = conversations.filter((c): c is GroupConversation => {
      return c.type === "group" && c.name.toLowerCase().includes(s)
    })

    const directs = conversations.filter((c): c is DirectConversation => {
      if (c.type !== "direct") return false
      const otherParticipant = c.participants.find(p => {
        const id = typeof p.userId === "string" ? p.userId : p.userId._id
        return id !== currentUserId
      })
      if (!otherParticipant || typeof otherParticipant.userId === "string") return false
      const targetUser = otherParticipant.userId
      return (
        targetUser.displayName.toLowerCase().includes(s) ||
        targetUser.username.toLowerCase().includes(s)
      )
    })

    return { groups, directs }
  }, [searchValue, conversations, currentUserId])

  const isSearching = searchValue.trim().length > 0
  const allGroups = conversations.filter(c => c.type === "group")
  const allDirects = conversations.filter(c => c.type === "direct")

  const handleClear = () => setSearchValue("")

  return (
    <aside className="flex h-full w-full flex-col bg-white pt-4 transition-all">
      {/* SEARCH SECTION */}
      <div className="px-4 mb-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            type="text"
            placeholder="Tìm kiếm cuộc trò chuyện..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="h-10 w-full rounded-xl border-none bg-secondary/50 pl-10 pr-10 text-sm ring-offset-transparent transition-all focus-visible:ring-2 focus-visible:ring-primary/20"
          />
          {searchValue && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* TABS NAVIGATION (SIÊU ĐẸP - SEGMENTED CONTROL) */}
      <div className="px-4 mb-2">
        <div className="relative flex w-full p-1 bg-secondary/40 rounded-xl">
          {/* Nền trượt (Sliding background) */}
          <div
            className={cn(
              "absolute inset-y-1 left-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-transform duration-300 ease-out",
              activeTab === "group" ? "translate-x-full" : "translate-x-0"
            )}
          />
          
          <button
            onClick={() => setActiveTab("direct")}
            className={cn(
              "relative z-10 flex flex-1 items-center justify-center gap-2 py-2 text-sm font-medium transition-colors",
              activeTab === "direct" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MessageSquare className="h-4 w-4" />
            Cá nhân
          </button>
          
          <button
            onClick={() => setActiveTab("group")}
            className={cn(
              "relative z-10 flex flex-1 items-center justify-center gap-2 py-2 text-sm font-medium transition-colors",
              activeTab === "group" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Users className="h-4 w-4" />
            Nhóm
          </button>
        </div>
      </div>

      {/* HEADER ACTIONS (Tùy biến theo Tab) */}
      <div className="flex items-center justify-between px-5 py-2 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
        <span>{activeTab === "direct" ? "Tin nhắn trực tiếp" : "Danh sách nhóm"}</span>
        <div className="opacity-80 hover:opacity-100 transition-opacity">
           {activeTab === "direct" ? (
             <CreateDirectChat currentUserId={user._id} />
           ) : (
             <CreateNewGroup />
           )}
        </div>
      </div>

      {/* CONTENT AREA (Scroll mượt) */}
      <div className="flex-1 overflow-y-auto px-2 custom-scrollbar scrollbar-none">
        <div className={cn(
          "transition-all duration-300 ease-in-out",
          activeTab === "direct" ? "block opacity-100 translate-x-0" : "hidden opacity-0 -translate-x-2"
        )}>
          <ChatDirectList data={isSearching ? filteredData.directs : allDirects} />
        </div>

        <div className={cn(
          "transition-all duration-300 ease-in-out",
          activeTab === "group" ? "block opacity-100 translate-x-0" : "hidden opacity-0 translate-x-2"
        )}>
          <ChatGroupList data={isSearching ? filteredData.groups : allGroups} />
        </div>
      </div>

      {/* MODALS */}
      <AddFriendForm open={openDirect} onClose={() => setOpenDirect(false)} />
      <AddGroupForm open={openGroup} onClose={() => setOpenGroup(false)} />
    </aside>
  )
}