"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useFriendStore } from "@/store/useFriendStore"
import { useSocketStore } from "@/store/useSocketStore" // Thêm import này
import { useChatStore } from "@/store/useChatStore"     // Để lấy thông tin chính bạn
import axios from "axios"
import { Search, UserPlus2 } from "lucide-react"
import { toast } from "sonner"

interface AddFriendFormProps {
  open: boolean
  onClose: () => void
}

export default function AddFriendForm({ open, onClose }: AddFriendFormProps) {
  const [keyword, setKeyword] = useState("")
  const { friends, setFriends } = useFriendStore()
  
 
  const socket = useSocketStore(s => s.socket)
  // Giả sử user hiện tại được lưu trong ChatStore hoặc bạn có thể lấy từ đâu đó
  // Nếu chưa có, bạn cần fetch thông tin user hiện tại để gửi đi
  const { conversations } = useChatStore() 
  // Cách đơn giản nhất là lấy thông tin từ API/Store để làm object "from"
  // Ở đây tôi giả định bạn đã có dữ liệu user trong Page chính hoặc Store

  const handleGetListFriend = async () => {
    const res = await axios.get(`http://localhost:5001/api/users/search?keyword=${keyword}`,
      { withCredentials: true }
    )

    if (res.status === 200 || res.status === 201) {
      setFriends(res?.data)
    }
  }

const handleSendFriendRequest = async (id: string) => {
  try {
    const res = await axios.post("http://localhost:5001/api/friend/request", {
      to: id,
      message: "ket ban nhe"
    }, { withCredentials: true })

    if (res.status === 200 || res.status === 201) {
      toast.success("Đã gửi lời mời kết bạn")

      if (socket) {
      
        const newRequest = res.data.request 

        socket.emit("send-friend-request", {
          ...newRequest, // Chứa đầy đủ thông tin 'from' đã populate
          toUserId: id,  // Để server biết gửi vào room nào
        })
      }
      return
    }
    toast.info(res.data?.message)
  } catch (error: any) {
    toast.error("Lời mời đã tồn tại hoặc có lỗi xảy ra.")
  }
}



  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Add Friend
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2 w-full">
          <div className="flex items-center w-full gap-2.5">
            <Input
              placeholder="Enter username or name ..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleGetListFriend()
                }
              }}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleGetListFriend()}
            > <Search /> </Button>
          </div>

          <div className="flex flex-col gap-1 w-full max-h-56 overflow-y-scroll scrollbar-none">
            {friends?.length > 0 ? friends?.map((f: any) => (
              <div key={f._id} className="text-base font-medium text-gray-800 flex items-center justify-between gap-2 hover:bg-gray-100 transition-all border border-gray-200 rounded-md py-2 px-3">
                <span>{(f?.displayName && f.displayName?.trim() !== "") ? f.displayName : "No Name"}</span>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => f?._id && handleSendFriendRequest(f._id)}
                > Add <UserPlus2 /> </Button>
              </div>
            )) : <div> No data found.</div>
            }
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}