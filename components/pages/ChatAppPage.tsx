"use client"

import axios from "axios"
import { useEffect, useState } from "react"

import { SidebarProvider } from "../ui/sidebar"
import { AppSidebar } from "../sidebar/app-sidebar"

import { useChatStore } from "@/store/useChatStore"
import ChatWindowSwitcher from "../chat/ChatWindowSwitcher"
import { SmartLayout } from "../custom/SmartLayout"
import FooterWindowChat from "../chat/FooterWindowChat"
import NavbarWindowChat from "../chat/NavbarWindowChat"

import { Bell, Command } from "lucide-react"
import { NavUser } from "../sidebar/nav-user"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "../ui/popover"
import { Button } from "../ui/button"
import { toast } from "sonner"

import { useSocketMessage } from "@/hooks/useSocketMessage"
import { useSocketFriend } from "@/hooks/useSocketFriend"
import { useFriendStore } from "@/store/useFriendStore"
import { Conversation } from "@/lib/types/chat"
import { useUserStore } from "@/store/useUserStore"
import ConversationSidebar from "../chat/ConversationSidebar"
import axiosClient from "@/lib/axios_config"

const ChatAppPage = () => {

  const { user, setUser } = useUserStore()
  const [loading, setLoading] = useState(true)

  const { conversations, setConversations, setCurrentUserId, isInfoOpen } = useChatStore()

  const incomingRequests = useFriendStore(s => s.incomingRequests)
  const setIncomingRequests = useFriendStore(s => s.setIncomingRequests)
  const removeIncomingRequest = useFriendStore(s => s.removeIncomingRequest)

  useSocketMessage()
  useSocketFriend()

  // =========================
  // 🔥 LOAD DATA BAN ĐẦU
  // =========================
  useEffect(() => {

    const fetchData = async () => {
      try {

        const [directRes, groupRes, userRes] = await Promise.all([
          axiosClient.get("http://localhost:5001/api/direct", { withCredentials: true }),
          axiosClient.get("http://localhost:5001/api/group", { withCredentials: true }),
          axiosClient.get("http://localhost:5001/api/users/me", { withCredentials: true })
        ])


        const allConversations: Conversation[] = [
          ...(directRes.data || []).map((c: any) => ({
            ...c,
            type: "direct"
          })),
          ...(groupRes.data || []).map((c: any) => ({
            ...c,
            type: "group"
          }))
        ]

        setConversations(allConversations)
        setCurrentUserId(userRes.data._id)
        setUser(userRes.data)

      } catch (err) {
        console.log("Fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

  }, [])

  // =========================
  // 🔥 LOAD FRIEND REQUEST
  // =========================
  useEffect(() => {

    const fetchRequests = async () => {
      try {

        const res = await axiosClient.get(
          "http://localhost:5001/api/friend/request",
          { withCredentials: true }
        )

        setIncomingRequests(res.data)

      } catch (error) {
        console.log("Lỗi lấy ds kết bạn", error)
      }
    }

    fetchRequests()

  }, [])

  // =========================
  // ✅ ACCEPT FRIEND
  // =========================
  const handleAcceptFriendRequest = async (requestId: string) => {
    try {

      await axiosClient.post(
        `http://localhost:5001/api/friend/request/${requestId}/accept`,
        {},
        { withCredentials: true }
      )

      toast.success("Kết bạn thành công!")
      removeIncomingRequest(requestId)

      // 🔥 fetch lại DIRECT (vì có chat mới)
      const directRes = await axiosClient.get(
        "http://localhost:5001/api/direct",
        { withCredentials: true }
      )

      setConversations((prev) => {

        const groupChats = prev.filter(c => c.type === "group")

        const newDirect = (directRes.data || []).map((c: any) => ({
          ...c,
          type: "direct"
        }))

        return [...newDirect, ...groupChats]
      })

    } catch (error) {
      toast.error("Lỗi accept")
    }
  }

  // =========================
  // ❌ DECLINE FRIEND
  // =========================
  const handleDeclineFriendRequest = async (requestId: string) => {
    try {

      await axiosClient.post(
        `http://localhost:5001/api/friend/request/${requestId}/decline`,
        {},
        { withCredentials: true }
      )

      toast.success("Đã từ chối")
      removeIncomingRequest(requestId)

    } catch (error) {
      toast.error("Lỗi decline")
    }
  }

  if (loading || !user) return null

  return (
    <>
      <SmartLayout direction="horizontal" className="h-screen">

        {/* SIDEBAR */}
        <SmartLayout.Header
          initialSize={450}
          minSnapSize={450}
          resizable
          collapsible
          className="border-r bg-muted max-w-[400px] min-w-[350px]"
        >

          <SmartLayout>

            {/* HEADER */}
            <SmartLayout.Footer>

              <div className="border-b px-4 py-3 h-16 flex items-center justify-between">

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-lg">
                    <Command className="w-4 h-4" />
                  </div>

                  <div>
                    <p className="text-sm font-medium">ChatApp</p>
                    <p className="text-xs text-gray-400">Talk with friends</p>
                  </div>
                </div>

                {/* 🔔 FRIEND REQUEST */}
                {/* 🔔 FRIEND REQUEST */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button size="icon" variant="ghost" className="relative hover:bg-accent rounded-full">
                      <Bell className="w-5 h-5 text-muted-foreground" />
                      {incomingRequests.length > 0 && (
                        <span className="absolute top-1 right-1 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-[350px] p-0 shadow-xl border-border/50 overflow-hidden" align="end">
                    {/* Header Popover */}
                    <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        Lời mời kết bạn
                        {incomingRequests.length > 0 && (
                          <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full">
                            {incomingRequests.length}
                          </span>
                        )}
                      </h3>
                    </div>

                    {/* Body Popover */}
                    <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                      {incomingRequests.length > 0 ? (
                        <div className="flex flex-col">
                          {incomingRequests.map((rq: any) => (
                            <div
                              key={rq._id}
                              className="p-4 flex items-start gap-3 hover:bg-accent/50 transition-colors border-b last:border-0"
                            >
                              {/* Avatar giả định - Bạn có thể thay bằng component Avatar của Shadcn */}
                              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white font-bold shrink-0">
                                {rq.from.displayName?.charAt(0).toUpperCase() || "U"}
                              </div>

                              <div className="flex-1 space-y-1">
                                <div className="flex flex-col">
                                  <span className="text-sm font-semibold leading-none">
                                    {rq.from.displayName}
                                  </span>
                                  <span className="text-[11px] text-muted-foreground mt-1">
                                    Muốn kết bạn với bạn
                                  </span>
                                </div>

                                <div className="flex gap-2 pt-1">
                                  <Button
                                    size="sm"
                                    className="h-8 px-3 text-xs bg-primary hover:bg-primary/90 shadow-sm"
                                    onClick={() => handleAcceptFriendRequest(rq._id)}
                                  >
                                    Chấp nhận
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 px-3 text-xs border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all"
                                    onClick={() => handleDeclineFriendRequest(rq._id)}
                                  >
                                    Từ chối
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-3">
                            <Bell className="w-6 h-6 text-muted-foreground/40" />
                          </div>
                          <p className="text-sm font-medium text-muted-foreground">Hộp thư trống</p>
                          <p className="text-xs text-muted-foreground/60">Bạn không có lời mời kết bạn nào.</p>
                        </div>
                      )}
                    </div>

                    {/* Footer Popover (Optional) */}
                    {incomingRequests.length > 0 && (
                      <div className="p-2 border-t bg-muted/10 text-center">
                        <button className="text-[11px] text-muted-foreground hover:text-primary transition-colors">
                          Xem tất cả lời mời
                        </button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>

              </div>

            </SmartLayout.Footer>

            {/* LIST CHAT */}
            <SmartLayout.Body scroll={{ y: true }}>
              <AppSidebar
                conversations={conversations}
                currentUserId={user._id}
                user={user}
              />
            </SmartLayout.Body>

            {/* FOOTER */}
            <SmartLayout.Footer>
              <div className="border-t h-16 flex items-center">
                <NavUser user={user} />
              </div>
            </SmartLayout.Footer>

          </SmartLayout>

        </SmartLayout.Header>

        {/* CHAT */}
        <SmartLayout direction="vertical">

          <SmartLayout.Footer className="h-16 border-b">
            <NavbarWindowChat />
          </SmartLayout.Footer>

          <SmartLayout.Body scroll={{ y: true }}>
            <ChatWindowSwitcher />
          </SmartLayout.Body>

          <SmartLayout.Footer className="h-16 border-t">
            <FooterWindowChat />
          </SmartLayout.Footer>

        </SmartLayout>


        {isInfoOpen &&

          <SmartLayout.Footer className="border-t max-w-[400px] w-full min-w-[350px] animate-in slide-in-from-right duration-300">
            <ConversationSidebar />
          </SmartLayout.Footer>}


      </SmartLayout>

      <SidebarProvider />
    </>
  )
}

export default ChatAppPage