"use client"
import { useEffect } from "react"
import { useSocketStore } from "@/store/useSocketStore"
import { useFriendStore } from "@/store/useFriendStore"
import { useChatStore } from "@/store/useChatStore" // Thêm cái này
import axios from "axios" // Thêm cái này
import { toast } from "sonner"

export const useSocketFriend = () => {
  const socket = useSocketStore(s => s.socket)
  const addIncomingRequest = useFriendStore(s => s.addIncomingRequest)
  const setConversations = useChatStore(s => s.setConversations) // Thêm cái này

  useEffect(() => {
    if (!socket) return

    // 1. Nhận lời mời kết bạn (Dành cho người nhận)
    const handleFriendRequest = (request: any) => {
      addIncomingRequest(request)
      toast.info(`Bạn có lời mời kết bạn mới!`)
    }

    // 2. Lời mời của mình đã được đồng ý (Dành cho người gửi)
    const handleRequestAccepted = async (data: any) => {
      console.log("Lời mời của bạn đã được chấp nhận:", data)
      toast.success("Người ấy đã đồng ý kết bạn!")
      
      try {
        // Fetch lại danh sách conversation để cập nhật UI realtime
        const res = await axios.get("http://localhost:5001/api/conversation", { 
          withCredentials: true 
        });
        setConversations(res.data?.conversations);
      } catch (error) {
        console.error("Lỗi cập nhật danh sách chat realtime", error)
      }
    }

    socket.on("friend_request_received", handleFriendRequest)
    socket.on("friend_request_accepted", handleRequestAccepted)

    return () => {
      socket.off("friend_request_received", handleFriendRequest)
      socket.off("friend_request_accepted", handleRequestAccepted)
    }
  }, [socket, addIncomingRequest, setConversations])
}