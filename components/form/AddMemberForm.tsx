"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "sonner"
import { useChatStore } from "@/store/useChatStore"

type UserSearchResult = {
  _id: string
  username: string
  displayName?: string // Để dấu ? vì có thể backend trả về thiếu
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
        // Lưu ý: Thử đổi thành /api/users/search nếu /api/user/search vẫn 404
        const res = await axios.get(`http://localhost:5001/api/users/search`, {
          params: { keyword: keyword },
          withCredentials: true
        })
        
        // Đảm bảo res.data là mảng trước khi set
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
      const res = await axios.patch(
        "http://localhost:5001/api/group/add-member",
        { conversationId, userId },
        { withCredentials: true }
      )
      updateConversation(res.data) 
      toast.success("Đã thêm vào nhóm")
      setKeyword("")
      onClose()
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi khi thêm")
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-2xl p-6 w-[420px] shadow-2xl text-black">
        <h3 className="font-bold text-xl mb-4">Thêm thành viên</h3>
        
        <input
          placeholder="Tìm tên hoặc username..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="border border-gray-200 rounded-xl p-3 w-full outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          autoFocus
        />

        <div className="max-h-[300px] overflow-y-auto pr-2">
          {loadingSearch ? (
             <p className="text-center py-4 text-sm text-gray-500">Đang tìm...</p>
          ) : results.length > 0 ? (
            results.map((user) => (
              <div key={user._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl mb-2 border border-transparent hover:border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold overflow-hidden">
                    {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover"/>
                    ) : (
                        // FIX TẠI ĐÂY: Dùng optional chaining và fallback
                        user.displayName?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || "?"
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{user.displayName || user.username}</p>
                    <p className="text-xs text-gray-500">@{user.username}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleAddMember(user._id)}
                  className="bg-blue-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Thêm
                </button>
              </div>
            ))
          ) : keyword && (
            <p className="text-center text-sm text-gray-400 py-6">Không thấy kết quả</p>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="text-sm font-medium text-gray-500 hover:text-black px-4 py-2 transition-colors">Đóng</button>
        </div>
      </div>
    </div>
  )
}

export default AddMemberModal