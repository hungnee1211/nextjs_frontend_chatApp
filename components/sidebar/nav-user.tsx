"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { User } from "@/lib/types/user"
import { useChatStore } from "@/store/useChatStore"
import { useUserStore } from "@/store/useUserStore"

import { Settings, LogOut, UserPen } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import EditProfileForm from "../form//EditProfileForm"
import { toast } from "sonner"
import axiosClient from "@/lib/axios_config"

interface Props {
  user: User
}

export function NavUser({ user: initialUser }: Props) {
  // Lấy hàm reset từ useChatStore
  const { setCurrentUserId, reset: resetChatStore } = useChatStore()
  const { setUser, user } = useUserStore()
  const router = useRouter()
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const BACKEND_URL = "http://localhost:5001"

  const handleLogout = async () => {
    try {
      await axiosClient.post(
        `${BACKEND_URL}/api/auth/signout`,
        {},
        { withCredentials: true }
      )

      // 🔥 QUAN TRỌNG: Reset toàn bộ dữ liệu chat và user trong Store
      resetChatStore() 
      setUser(null) 

      toast.success("Đã đăng xuất thành công")
      
      // Sử dụng replace để người dùng không thể bấm Back lại trang chat
      router.replace("/signin")
    } catch (err) {
      toast.error("Lỗi khi đăng xuất")
      console.error("Logout error:", err)
    }
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosClient.get(
          `${BACKEND_URL}/api/users/me`,
          { withCredentials: true }
        )
        setCurrentUserId(res.data._id)
        setUser(res.data)
      } catch (error) {
        console.log("Fetch user detail error")
      }
    }
    fetchUser()
  }, [])

  if (!user) return null

  const avatarSrc = user.avatarUrl?.startsWith("http") 
    ? user.avatarUrl 
    : `${BACKEND_URL}${user.avatarUrl}`

  return (
    <>
      <div className="flex items-center justify-between w-full p-2.5 bg-muted shadow-sm hover:shadow-md transition-all border-border/50">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-primary/10 bg-muted shrink-0 flex items-center justify-center shadow-sm">
            {user.avatarUrl ? (
              <img 
                src={avatarSrc} 
                alt="avatar" 
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            ) : null}
            <span className="font-bold text-primary uppercase text-sm">
              {user.displayName?.charAt(0)}
            </span>
          </div>

          <div className="flex flex-col min-w-0">
            <p className="text-sm font-bold truncate leading-tight text-foreground/90">
              {user.displayName}
            </p>
            <p className="text-[11px] text-muted-foreground truncate font-medium mt-0.5">
              @{user.username}
            </p>
          </div>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button size="icon" variant="outline" className="h-10 w-10 hover:bg-muted">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-1.5 rounded-xl shadow-xl border-border/40" align="end" side="right">
            <div className="flex flex-col gap-0.5">
              <Button
                variant="ghost"
                className="justify-start gap-2.5 h-10 text-sm font-medium rounded-lg"
                onClick={() => setIsEditModalOpen(true)}
              >
                <PopOverItem icon={<UserPen className="w-4 h-4 text-primary" />} label="Chỉnh sửa hồ sơ" />
              </Button>
              <div className="h-px bg-border/50 my-1 mx-1" />
              <Button
                variant="ghost"
                className="justify-start gap-2.5 h-10 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl p-6">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-xl font-bold tracking-tight">Hồ sơ của bạn</DialogTitle>
          </DialogHeader>
          <EditProfileForm onSuccess={() => setIsEditModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}

// Component phụ trợ để giao diện sạch hơn
function PopOverItem({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      {icon}
      <span>{label}</span>
    </div>
  )
}