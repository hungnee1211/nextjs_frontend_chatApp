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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useGroupStore } from "@/store/useGroupStore"
import { useChatStore } from "@/store/useChatStore"
import axios from "axios"
import {
  Search,
  Users2,
  Check,
  Loader2,
  Sparkles,
  User
} from "lucide-react"
import { toast } from "sonner"
import axiosClient from "@/lib/axios_config"

interface AddGroupFormProps {
  open: boolean
  onClose: () => void
}

interface FormCreateGroup {
  name: string
  userIds: string[]
}

export default function AddGroupForm({ open, onClose }: AddGroupFormProps) {
  const { friends, setFriends } = useGroupStore()
  const currentUserId = useChatStore(s => s.currentUserId) // Lấy ID bản thân

  const [keyword, setKeyword] = useState("")
  const [form, setForm] = useState<FormCreateGroup>({
    name: "",
    userIds: []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  const handleToggleUser = (_id: string) => {
    setForm(prev => {
      const isSelected = prev.userIds.includes(_id);
      return {
        ...prev,
        userIds: isSelected
          ? prev.userIds.filter(id => id !== _id)
          : [...prev.userIds, _id]
      };
    });
  }

  const handleCreateGroup = async () => {
    if (!form.name.trim() || form.userIds.length === 0) {
      toast.error("Vui lòng nhập tên nhóm và chọn ít nhất 1 thành viên!");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axiosClient.post("http://localhost:5001/api/group", form, {
        withCredentials: true
      });

      if (res.status === 201) {
        toast.success("Tạo nhóm thành công!");
        setForm({ name: "", userIds: [] });
        onClose();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tạo nhóm");
    } finally {
      setIsLoading(false);
    }
  }

  const handleGetListFriend = async () => {
    if (!keyword.trim()) return;
    setIsSearching(true)
    try {
      const res = await axiosClient.get(`http://localhost:5001/api/users/search?keyword=${keyword}`, {
        withCredentials: true
      })
      if (res.status === 200 || res.status === 201) {
        // Lọc bỏ chính mình khỏi danh sách chọn thành viên
        const filtered = res.data.filter((u: any) => u._id !== currentUserId)
        setFriends(filtered)
      }
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      {/* Ẩn nút X mặc định hoặc đổi màu nút X mặc định sang trắng */}
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl rounded-[32px] bg-white [&>button]:text-white/80 [&>button]:hover:text-white [&>button]:top-6 [&>button]:right-6">

        {/* --- HEADER --- */}
        <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-8 text-white relative">
          <div className="absolute top-4 right-12 opacity-10 animate-pulse">
            <Sparkles size={60} />
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold flex items-center gap-3 tracking-tight">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                <Users2 className="w-6 h-6" />
              </div>
              Tạo nhóm mới
            </DialogTitle>
            <p className="text-indigo-50 text-sm font-medium opacity-90 mt-2">
              Bắt đầu cuộc trò chuyện chung với bạn bè.
            </p>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          {/* Nhập tên nhóm */}
          <div className="space-y-2">
            <label className="text-[12px] font-bold text-gray-400 ml-1 uppercase tracking-[1px]">
              Tên nhóm
            </label>
            <Input
              placeholder="Nhập tên nhóm của bạn..."
              className="h-12 border-none bg-gray-50 rounded-2xl focus-visible:ring-2 focus-visible:ring-purple-500/20 transition-all text-base shadow-inner"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          {/* Tìm kiếm & Thành viên */}
          <div className="space-y-3">
            <div className="flex justify-between items-end mb-1 px-1">
              <label className="text-[12px] font-bold text-gray-400 uppercase tracking-[1px]">
                Chọn thành viên
              </label>
              <span className="text-[12px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg">
                Đã chọn: {form.userIds.length}
              </span>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Tìm bạn bè..."
                  className="pl-11 h-11 bg-gray-50 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-purple-500/20 transition-all"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGetListFriend()}
                />
              </div>
              <Button
                variant="secondary"
                className="h-11 rounded-xl px-5 bg-purple-600 text-white hover:bg-purple-700 transition-all active:scale-95 shadow-md shadow-purple-100"
                onClick={handleGetListFriend}
                disabled={isSearching}
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Tìm"}
              </Button>
            </div>

            {/* Danh sách bạn bè để chọn */}
            <ScrollArea className="h-60 w-full rounded-[20px] border border-gray-100 bg-gray-50/30 p-2">
              <div className="space-y-1.5">
                {friends?.length > 0 ? (
                  friends.map((f: any) => {
                    const isSelected = form.userIds.includes(f._id);
                    return (
                      <div
                        key={f._id}
                        onClick={() => handleToggleUser(f._id)}
                        className={`group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all duration-200 ${isSelected
                            ? "bg-white border-purple-200 shadow-sm border ring-1 ring-purple-100"
                            : "hover:bg-white border border-transparent hover:shadow-sm"
                          }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-10 w-10 border-2 border-white shadow-sm transition-transform group-hover:scale-105">
                            <AvatarImage
                              src={
                                f.avatarUrl
                                  ? (f.avatarUrl.startsWith("http") ? f.avatarUrl : `http://localhost:5001${f.avatarUrl}`)
                                  : ""
                              }
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold text-xs">
                              {f.displayName?.charAt(0).toUpperCase() || <User size={16} />}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className={`text-sm font-bold truncate ${isSelected ? "text-purple-700" : "text-slate-700"}`}>
                              {f.displayName || "Người dùng"}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium truncate">
                              @{f.username || "unknown"}
                            </span>
                          </div>
                        </div>

                        <div className={`transition-all duration-300 ${isSelected ? "scale-100 opacity-100" : "scale-50 opacity-0 group-hover:opacity-30"}`}>
                          <div className={`p-1.5 rounded-full ${isSelected ? "bg-purple-600" : "bg-slate-300"}`}>
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-300 space-y-2">
                    <Users2 className="w-10 h-10 opacity-10" />
                    <p className="text-[11px] font-bold uppercase tracking-widest opacity-40">Tìm kiếm bạn bè để thêm</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="flex-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl h-12 font-bold"
            >
              Hủy
            </Button>
            <Button
              onClick={handleCreateGroup}
              disabled={isLoading || form.userIds.length === 0}
              className="flex-[2] bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl h-12 shadow-lg shadow-purple-200 transition-all active:scale-95 disabled:opacity-50 font-bold"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                `Tạo nhóm (${form.userIds.length})`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}