"use client"

import axios from "axios"
import { useEffect, useState } from "react"

import { SidebarProvider } from "../ui/sidebar"
import { AppSidebar } from "../sidebar/app-sidebar"

import { User } from "@/lib/types/user"
import { useChatStore } from "@/store/useChatStore"
import ChatWindowSwitcher from "../chat/ChatWindowSwitcher"
import SocketProvider from "@/provider/SocketProvider"
import { SmartLayout } from "../custom/SmartLayout"
import FooterWindowChat from "../chat/FooterWindowChat"
import NavbarWindowChat from "../chat/NavbarWindowChat"

import { Bell, Command } from "lucide-react"
import { NavUser } from "../sidebar/nav-user"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Button } from "../ui/button"
import { toast } from "sonner"

import { useSocketMessage } from "@/hooks/useSocketMessage"
import { useSocketFriend } from "@/hooks/useSocketFriend"
import { useFriendStore } from "@/store/useFriendStore"
import { useSocketStore } from "@/store/useSocketStore"


const ChatAppPage = () => {

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const { conversations, setConversations, setCurrentUserId } = useChatStore()

  const incomingRequests = useFriendStore(s => s.incomingRequests)
  const setIncomingRequests = useFriendStore(s => s.setIncomingRequests)
  const removeIncomingRequest = useFriendStore(s => s.removeIncomingRequest)

  const socket = useSocketStore(s => s.socket);

  useSocketMessage()
  useSocketFriend()


  useEffect(() => {

    const fetchData = async () => {
      try {

        const [convoRes, userRes] = await Promise.all([
          axios.get("http://localhost:5001/api/conversation", { withCredentials: true }),
          axios.get("http://localhost:5001/api/users/me", { withCredentials: true })
        ])

        setConversations(convoRes.data.conversations)
        setCurrentUserId(convoRes.data.currentUserId)
        setUser(userRes.data)

      } catch (err) {
        console.log("Fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

  }, [])


  const fetchListRequestAddFriend = async () => {

    try {

      const res = await axios.get(
        "http://localhost:5001/api/friend/request",
        { withCredentials: true }
      )

      if (res.status === 200) {
        setIncomingRequests(res.data)
      }



    } catch (error) {
      console.log("Lỗi lấy ds kết bạn", error)
    }

  }

  useEffect(() => {
    fetchListRequestAddFriend()
  }, [])


  const handleAcceptFriendRequest = async (requestId: string) => {
    try {
      const res = await axios.post(
        `http://localhost:5001/api/friend/request/${requestId}/accept`,
        {},
        { withCredentials: true }
      );

      toast.success("Kết bạn thành công!");

      // 1. Xóa khỏi danh sách chờ của mình
      removeIncomingRequest(requestId);

      // 2. EMIT SOCKET: Báo cho server để server báo cho người kia
      // Giả sử API trả về thông tin người gửi là res.data.fromUserId
      if (socket) {
        socket.emit("accept-friend-request", {
          requestId,
          fromUserId: res.data.fromUserId, // Bạn cần đảm bảo API trả về ID này
          friend: res.data.newFriend
        });
      }

      // 3. Cập nhật danh sách chat
      const newList = await axios.get("http://localhost:5001/api/conversation", { withCredentials: true });
      setConversations(newList.data?.conversations);

    } catch (error) {
      toast.error("Lỗi accept");
    }
  }

  const handleDeclineFriendRequest = async (requestId: string) => {

    try {

      await axios.post(
        `http://localhost:5001/api/friend/request/${requestId}/decline`,
        {},
        { withCredentials: true }
      )

      toast.success("Đã từ chối lời mời kết bạn")

      removeIncomingRequest(requestId)

    } catch (error) {
      toast.error("Từ chối lời mời thất bại")
      console.log(error)
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
          persistKey="chat-sidebar1"
          className="border-r bg-muted"
        >

          <SmartLayout>

            {/* HEADER */}
            <SmartLayout.Footer>

              <div className="border-b px-4 py-3 h-16 flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-black text-white">
                    <Command className="w-4 h-4" />
                  </div>

                  <div className="leading-tight">
                    <p className="text-sm font-medium">ChatApp</p>
                    <p className="text-xs text-gray-400">Talk with friends</p>
                  </div>

                </div>

                {/* FRIEND REQUEST */}
                <Popover>

                  <PopoverTrigger asChild>
                    <Button size="icon" variant="outline">
                      <Bell />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-[380px] p-0 shadow-xl border-none">
                    {/* Header của Popover */}
                    <div className="p-4 border-b bg-muted/50">
                      <h3 className="font-semibold text-sm tracking-tight">Lời mời kết bạn</h3>
                    </div>

                    <div className="overflow-y-auto max-h-[400px]">
                      {incomingRequests.length > 0 ? (
                        <div className="divide-y divide-border">
                          {incomingRequests.map((rq: any) => (
                            <div
                              key={rq._id}
                              className="flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors group"
                            >
                              {/* Avatar Placeholder (Bạn có thể thay bằng component Avatar thực tế) */}
                              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {rq?.from?.displayName?.charAt(0) || "U"}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col mb-2">
                                  <span className="text-sm font-semibold truncate leading-none">
                                    {rq?.from?.displayName || "Người dùng"}
                                  </span>
                                  <span className="text-xs text-muted-foreground mt-1">
                                    @{rq?.from?.username}
                                  </span>
                                </div>

                                {rq?.message && (
                                  <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-md mb-3 italic">
                                    "{rq.message}"
                                  </p>
                                )}

                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="flex-1 h-8 bg-primary hover:bg-primary/90"
                                    onClick={() => handleAcceptFriendRequest(rq._id)}
                                  >
                                    Chấp nhận
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    className="flex-1 h-8"
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
                        <div className="py-10 flex flex-col items-center justify-center text-muted-foreground">
                          <Bell className="w-8 h-8 opacity-20 mb-2" />
                          <p className="text-sm">Không có lời mời nào</p>
                        </div>
                      )}
                    </div>
                  </PopoverContent>



                </Popover>

              </div>

            </SmartLayout.Footer>

            {/* CONVERSATION LIST */}
            <SmartLayout.Body scroll={{ y: true }}>

              <AppSidebar
                conversations={conversations}
                currentUserId={user._id}
                user={user}
              />

            </SmartLayout.Body>

            {/* FOOTER */}
            <SmartLayout.Footer>

              <div className="border-t h-16 px-3 flex items-center">
                <NavUser user={user} />
              </div>

            </SmartLayout.Footer>

          </SmartLayout>

        </SmartLayout.Header>

        {/* CHAT AREA */}
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

      </SmartLayout>

      <SidebarProvider />
    </>

  )

}

export default ChatAppPage