"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useFriendStore } from "@/store/useFriendStore"
import { useSocketStore } from "@/store/useSocketStore"
import { useChatStore } from "@/store/useChatStore"
import axios from "axios"
import {
  Search,
  UserPlus2,
  UserSearch,
  Loader2,
  User,
  Check,
  Clock,
  UserCheck
} from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import axiosClient from "@/lib/axios_config"

interface AddFriendFormProps {
  open: boolean
  onClose: () => void
}

export default function AddFriendForm({ open, onClose }: AddFriendFormProps) {
  const [keyword, setKeyword] = useState("")
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])

  const {
    addSentRequest,
    isFriend,
    hasSentRequest,
    hasIncomingRequest
  } = useFriendStore()

  const socket = useSocketStore(s => s.socket)
  const currentUserId = useChatStore(s => s.currentUserId)

  const handleSearch = async () => {
    if (!keyword.trim()) return
    setLoading(true)
    try {
      const res = await axiosClient.get(
        `http://localhost:5001/api/users/search?keyword=${keyword}`,
        { withCredentials: true }
      )

      if (res.status === 200 || res.status === 201) {
        const filtered = res.data.filter((user: any) => user._id !== currentUserId)
        setSearchResults(filtered)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tìm kiếm người dùng")
    } finally {
      setLoading(false)
    }
  }

  const handleSendFriendRequest = async (id: string) => {
    try {
      const res = await axiosClient.post(
        "http://localhost:5001/api/friend/request",
        { to: id, message: "Kết bạn nhé!" },
        { withCredentials: true }
      )

      if (res.status === 200 || res.status === 201) {
        const newRequest = res.data.request
        addSentRequest(newRequest)
        toast.success("Đã gửi lời mời kết bạn")

        if (socket) {
          socket.emit("send-friend-request", {
            ...newRequest,
            toUserId: id,
          })
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi gửi lời mời.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      {/* Lưu ý: Thêm class [&>button]:text-white vào DialogContent 
         để nút X mặc định của Shadcn chuyển sang màu trắng.
      */}
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-none bg-white shadow-2xl rounded-[32px] [&>button]:text-white/80 [&>button]:hover:text-white [&>button]:top-6 [&>button]:right-6 [&>button]:scale-110">

        {/* --- HEADER --- */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-8 text-white relative">
          <div className="relative z-10">
            <DialogHeader>
              <DialogTitle className="text-2xl font-extrabold flex items-center gap-3 tracking-tight">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                  <UserSearch className="w-6 h-6" />
                </div>
                Tìm kiếm bạn bè
              </DialogTitle>
              <p className="text-indigo-100/80 text-sm mt-2 font-medium">
                Kết nối với mọi người qua tên hoặc username.
              </p>
            </DialogHeader>
          </div>

          {/* Decor background */}
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* --- BODY --- */}
        <div className="p-6 space-y-6">

          {/* Search Input Box */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <Input
              placeholder="Nhập username hoặc tên..."
              value={keyword}
              className="pl-11 pr-24 h-12 bg-slate-50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-indigo-500/20 transition-all shadow-inner"
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button
              size="sm"
              onClick={handleSearch}
              disabled={loading}
              className="absolute right-1.5 top-1.5 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 shadow-md active:scale-95 transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Tìm"}
            </Button>
          </div>

          {/* Results Area */}
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {searchResults.length > 0 ? (
              searchResults.map((user: any) => {
                const isAlreadyFriend = isFriend(user._id)
                const isSent = hasSentRequest(user._id)
                const isIncoming = hasIncomingRequest(user._id)

                return (
                  <div
                    key={user._id}
                    className="group flex items-center justify-between p-3.5 rounded-[22px] border border-transparent hover:bg-indigo-50/50 hover:border-indigo-100 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <Avatar className="h-12 w-12 border-2 border-white shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
                        <AvatarImage
                          src={
                            user.avatarUrl
                              ? (user.avatarUrl.startsWith("http") ? user.avatarUrl : `http://localhost:5001${user.avatarUrl}`)
                              : ""
                          }
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-gradient-to-tr from-indigo-100 to-violet-200 text-indigo-700 font-bold text-lg uppercase">
                          {user?.displayName?.charAt(0) || <User size={20} />}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-slate-800 truncate leading-tight group-hover:text-indigo-600 transition-colors">
                          {user?.displayName || "Người dùng"}
                        </span>
                        <span className="text-[12px] text-slate-400 font-semibold truncate mt-0.5">
                          @{user?.username || "unknown"}
                        </span>
                      </div>
                    </div>

                    {isAlreadyFriend ? (
                      <Button disabled size="sm" className="rounded-xl bg-green-50 text-green-600 border-none h-9 px-4">
                        <UserCheck className="w-4 h-4 mr-1.5" /> Bạn bè
                      </Button>
                    ) : isSent ? (
                      <Button disabled size="sm" className="rounded-xl bg-amber-50 text-amber-600 border-none h-9 px-4">
                        <Clock className="w-4 h-4 mr-1.5" /> Chờ...
                      </Button>
                    ) : isIncoming ? (
                      <Button variant="secondary" size="sm" className="rounded-xl h-9 px-4 bg-indigo-100 text-indigo-700 border-none">
                        Đã gửi bạn
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendFriendRequest(user._id)}
                        className="rounded-xl border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all active:scale-90 font-bold px-4 h-9 shadow-sm"
                      >
                        <UserPlus2 className="w-4 h-4 mr-1.5" /> Thêm
                      </Button>
                    )}
                  </div>
                )
              })
            ) : keyword && !loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400/50 text-center">
                <div className="bg-slate-50 p-4 rounded-full mb-3">
                  <UserSearch className="w-8 h-8 opacity-20 text-slate-600" />
                </div>
                <p className="text-sm font-bold text-slate-600">Không tìm thấy kết quả</p>
                <p className="text-xs">Thử tìm kiếm với từ khóa khác xem sao!</p>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-slate-300">
                <div className="p-4 rounded-full bg-slate-50/50 mb-3">
                  <User className="w-10 h-10 opacity-10" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-widest opacity-40">Nhập tên để bắt đầu</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}