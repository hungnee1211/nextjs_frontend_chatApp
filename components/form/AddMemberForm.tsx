"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "sonner"
import { useChatStore } from "@/store/useChatStore"
import { Search, UserPlus, X, Loader2, Users, UserCircle2 } from "lucide-react"
import axiosClient from "@/lib/axios_config"

type UserSearchResult = {
  _id: string
  username: string
  displayName?: string
  avatarUrl?: string | null
}

const AddMemberModal = ({ conversationId, open, onClose }: { conversationId: string, open: boolean, onClose: () => void }) => {
  const [keyword, setKeyword] = useState("")
  const [results, setResults] = useState<UserSearchResult[]>([])
  const [loadingSearch, setLoadingSearch] = useState(false)
  
  const updateConversation = useChatStore((state) => state.updateConversation)

  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (!keyword.trim()) {
        setResults([])
        return
      }

      try {
        setLoadingSearch(true)
        const res = await axiosClient.get(`http://localhost:5001/api/users/search`, {
          params: { keyword: keyword },
          withCredentials: true
        })
        setResults(Array.isArray(res.data) ? res.data : [])
      } catch (err: any) {
        console.error("Lỗi search:", err.response?.status)
        setResults([])
      } finally {
        setLoadingSearch(false)
      }
    }, 400)

    return () => clearTimeout(searchTimer)
  }, [keyword])

  const handleAddMember = async (userId: string) => {
    try {
      const res = await axiosClient.patch(
        `http://localhost:5001/api/group/${conversationId}/add`,
        { conversationId, userId },
        { withCredentials: true }
      )
      updateConversation(res.data) 
      toast.success("Đã thêm thành viên mới vào nhóm!")
      setKeyword("")
      onClose()
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể thêm thành viên")
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-[28px] overflow-hidden w-full max-w-[440px] shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300"
      >
        {/* Header với dải màu hiện đại */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-xl tracking-tight">Thêm thành viên</h3>
              <p className="text-blue-100 text-xs opacity-90">Mời thêm bạn bè vào cuộc trò chuyện</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {/* Input Search xịn xò */}
          <div className="relative group mb-6">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              placeholder="Nhập tên hoặc username..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-inner"
              autoFocus
            />
            {loadingSearch && (
              <div className="absolute inset-y-0 right-4 flex items-center">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              </div>
            )}
          </div>

          {/* Kết quả tìm kiếm */}
          <div className="max-h-[320px] min-h-[100px] overflow-y-auto pr-1 custom-scrollbar">
            {results.length > 0 ? (
              <div className="space-y-2">
                {results.map((user) => (
                  <div 
                    key={user._id} 
                    className="flex items-center justify-between p-3 hover:bg-blue-50/50 rounded-2xl transition-all border border-transparent hover:border-blue-100 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold shadow-sm border border-white">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <span className="text-sm">
                            {user.displayName?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <p className="text-[14px] font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                          {user.displayName || user.username}
                        </p>
                        <p className="text-[12px] text-slate-400">@{user.username}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAddMember(user._id)}
                      className="bg-white border border-blue-200 text-blue-600 font-medium text-xs px-5 py-2 rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all active:scale-95 shadow-sm"
                    >
                      Thêm
                    </button>
                  </div>
                ))}
              </div>
            ) : keyword && !loadingSearch ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <UserCircle2 className="w-12 h-12 mb-2 opacity-20" />
                <p className="text-sm font-medium">Không tìm thấy người dùng này</p>
                <p className="text-xs opacity-60">Hãy thử kiểm tra lại tên hoặc username</p>
              </div>
            ) : !keyword && (
              <div className="flex flex-col items-center justify-center py-10 text-slate-300">
                <Users className="w-12 h-12 mb-2 opacity-10" />
                <p className="text-sm">Bắt đầu tìm kiếm thành viên...</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            onClick={onClose} 
            className="text-sm font-semibold text-slate-500 hover:text-slate-800 px-6 py-2 transition-colors rounded-xl hover:bg-slate-200/50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddMemberModal