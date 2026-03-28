"use client"

import { useState, useRef } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUserStore } from "@/store/useUserStore"
import { Camera, Loader2 } from "lucide-react"
import { toast } from "sonner" // Import từ sonner
import axiosClient from "@/lib/axios_config"

interface EditProfileFormProps {
  onSuccess?: () => void
}

export default function EditProfileForm({ onSuccess }: EditProfileFormProps) {
  const { user, setUser } = useUserStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const BACKEND_URL = "http://localhost:5001"

  const nameParts = user?.displayName?.split(" ") || []
  const [firstName, setFirstName] = useState(nameParts[0] || "")
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") || "")
  
  const [avatar, setAvatar] = useState<File | null>(null)
  
  const initialPreview = user?.avatarUrl 
    ? (user.avatarUrl.startsWith("http") ? user.avatarUrl : `${BACKEND_URL}${user.avatarUrl}`)
    : null
    
  const [preview, setPreview] = useState<string | null>(initialPreview)
  const [loading, setLoading] = useState(false)

  const handleAvatarChange = (file: File) => {
    setAvatar(file)
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  const handleSubmit = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Vui lòng nhập đầy đủ họ tên")
      return
    }

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append("firstName", firstName)
      formData.append("lastName", lastName)
      
      if (avatar) {
        formData.append("avatar", avatar)
      }

      const res = await axiosClient.patch(
        `${BACKEND_URL}/api/users/update`,
        formData,
        { withCredentials: true }
      )

      setUser(res.data)
      toast.success("Cập nhật thông tin thành công!")
      
      if (onSuccess) onSuccess()
    } catch (error: any) {
      console.error("Update error:", error)
      toast.error(error.response?.data?.message || "Cập nhật thất bại")
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="space-y-6 pt-2">
      {/* Avatar Section */}
      <div className="flex flex-col items-center gap-3">
        <div 
          className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 bg-muted cursor-pointer transition-all hover:ring-4 hover:ring-primary/10 shadow-inner"
          onClick={() => fileInputRef.current?.click()}
        >
          {preview ? (
            <img src={preview} className="w-full h-full object-cover" alt="Preview" />
          ) : (
            <div className="flex items-center justify-center h-full text-2xl font-bold text-muted-foreground uppercase">
              {user.displayName?.charAt(0)}
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="text-white w-6 h-6" />
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleAvatarChange(file)
          }}
        />
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Thay đổi ảnh</span>
      </div>

      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="firstName" className="text-xs font-bold text-muted-foreground ml-1">HỌ VÀ TÊN ĐỆM</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="h-10 focus-visible:ring-primary border-muted-foreground/20"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="lastName" className="text-xs font-bold text-muted-foreground ml-1">TÊN</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="h-10 focus-visible:ring-primary border-muted-foreground/20"
          />
        </div>
      </div>

      <Button
        className="w-full h-11 font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang cập nhật...</>
        ) : (
          "Lưu thay đổi"
        )}
      </Button>
    </div>
  )
}