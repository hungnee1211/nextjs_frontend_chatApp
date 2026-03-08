"use client"

import axios from "axios"
import { useEffect, useState } from "react"

import { SidebarProvider } from '../ui/sidebar'
import { AppSidebar } from '../sidebar/app-sidebar'
import ChatWindowLayout from '../chat/ChatWindowLayout'

import { Conversation } from "@/lib/types/chat"
import { User } from "@/lib/types/user"
import { useChatStore } from "@/store/useChatStore"
import ChatWindowSwitcher from "../chat/ChatWindowSwitcher"
import SocketProvider from "@/provider/SocketProvider"
import { SmartLayout } from "../SmartLayout"
import FooterWindowChat from "../chat/FooterWindowChat"
import NavbarWindowChat from "../chat/NavbarWindowChat"
import { Bell, Command } from "lucide-react"
import { NavUser } from "../sidebar/nav-user"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Button } from "../ui/button"
import { toast } from "sonner"
import { useSocketStore } from "@/store/useSocketStore"
import { useSocketMessage } from "@/hooks/useSocketMessage"


const ChatAppPage = () => {


  const [user, setUser] = useState<User | null>(null)
  const [listRequestFriend , setListRequestFriend] = useState([])
  const [loading, setLoading] = useState(true)
  const { conversations, currentUserId, setConversations, setCurrentUserId , addConversation } = useChatStore()

  useSocketMessage()

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
        const res = await axios.get("http://localhost:5001/api/friend/request" , {withCredentials : true})
        if(res.status === 200 || res.status === 201) {
          setListRequestFriend(res.data)
          console.log(res.data)
        }
        
    } catch (error) {
      console.log("Lỗi lấy ds kết bạn" , error)
    }
  }

  useEffect(() => {

    fetchListRequestAddFriend()
    

  } , [])

 const handleAcceptFriendRequest = async (requestId:string) => {
  try {
    console.log("aloo")
    console.log(requestId ,"rqId")
    const res = await axios.post(`http://localhost:5001/api/friend/request/${requestId}/accept` , {} ,
      {withCredentials:true}
    )

    toast.success("Kết bạn thành công!")
    console.log("friend rq..." ,requestId)
    
    
    if(res.status === 200 || res.status === 201){
      const newList = await axios.get("http://localhost:5001/api/conversation" , {withCredentials:true})
      setConversations(newList.data?.conversations)
    }
    
    console.log(listRequestFriend , "list rq fr")
    setListRequestFriend(prev => 
      prev.filter((r:any) => r._id !== requestId)
    )
    


  } catch (error) {
    toast.error("Lỗi accept")
    console.log(error)
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

    // Remove khỏi danh sách request
    setListRequestFriend(prev =>
      prev.filter((req:any) => req._id !== requestId)
    )

  } catch (error) {
    toast.error("Từ chối lời mời thất bại")
    console.log(error)
  }
}


  if (loading || !user) return null



  return (
    <SocketProvider>

      <SmartLayout direction="horizontal" className="h-screen">

        {/* Conversation List */}
        <SmartLayout.Header initialSize={450}
              minSnapSize={450}
              resizable
              collapsible
              persistKey="chat-sidebar1"
              className="border-r bg-muted"
              resizableBarClass={(props) =>
                props + "bg-transparent! hover:bg-transparent! transition-colors "
              }
            >
          <SmartLayout>
            <SmartLayout.Footer >
              {/* HEADER */}
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

                <Popover>
                  <PopoverTrigger asChild><Button size="icon" variant="outline" className="hover:bg-white!"> <Bell/> </Button></PopoverTrigger>
                  <PopoverContent className="overflow-y-scroll max-h-72 scrollbar-none min-w-[450px] gap-3">
                  {
                    listRequestFriend?.length > 0 ? listRequestFriend.map((rq : any) => (
                      <div 
                      key={rq._id}
                      className="h-24 py-2 px-3 border border-gray-200 rounded-md flex justify-between gap-2">
                        <div className="flex flex-col gap-0.5 ">
                          <span className="italic text-sm font-medium text-gray-400">FROM:&nbsp;{
                            (rq?.from?.displayName &&  rq?.from?.displayName?.trim() !== "") ? rq.from.displayName : "No name"
                            }&nbsp;-&nbsp;({
                            (rq?.from?.username &&  rq?.from?.username?.trim() !== "") ? rq.from.username : "No name"
                            })</span>
                          <span className="text-base font-semibold text-gray-800">{rq?.message}</span>
                        </div>
                        

                        <div className="flex gap-2 ">
                          <Button 
                        size="sm" 
                        onClick={() => handleAcceptFriendRequest(rq._id)}>
                        Accept
                        </Button>

                        <Button 
                        size="sm"
                        onClick={() => handleDeclineFriendRequest(rq._id)}>
                        Decline
                        </Button>
                        </div>
                        

                      </div>
                    )) : <div className="text-sm h-16 text-center w-full text-gray-400">No request found.</div>
                  }
                  </PopoverContent>
                </Popover>
              </div>


            </SmartLayout.Footer>
            <SmartLayout.Body
              initialSize={450}
              minSnapSize={450}
              resizable
              collapsible
              persistKey="chat-sidebar"
              className="border-r bg-muted"
              resizableBarClass={(props) =>
                props + "bg-transparent! hover:bg-transparent! transition-colors "
              }
              scroll={{ x: false, y: true }}>

              <div className="w-full">
                {user && (
                  <AppSidebar
                    conversations={conversations}
                    currentUserId={user._id}
                    user={user}
                  />
                )}
              </div>

            </SmartLayout.Body>
            <SmartLayout.Footer>
              {/* FOOTER */}
              <div className="border-t h-16 px-3 flex items-center">
                <NavUser user={user} />
              </div>

            </SmartLayout.Footer>

          </SmartLayout>


        </SmartLayout.Header>

        {/* Chat Area */}
        <SmartLayout direction="vertical">

          <SmartLayout.Footer className="h-16 border-b">
            <NavbarWindowChat />
          </SmartLayout.Footer>

          <SmartLayout.Body scroll={{ x: false, y: true }}>
            <div className="flex-1 flex flex-col min-h-0">
              <ChatWindowSwitcher />
            </div>
          </SmartLayout.Body>

          <SmartLayout.Footer className="h-16 border-t">
            <FooterWindowChat />
          </SmartLayout.Footer>

        </SmartLayout>

      </SmartLayout>
      <SidebarProvider>

        <></>
        {/* {currentUserId && conversations && conversations?.length > 0 && 
      <div className='flex h-screen w-full p-2 ml-10'>
        <ChatWindowLayout/>
      </div>
      } */}
      </SidebarProvider>

    </SocketProvider>
  )
}

export default ChatAppPage
