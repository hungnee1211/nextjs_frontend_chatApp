"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import axios from "axios"
import { Search, UserPlus2, Check } from "lucide-react" // Thêm Check icon
import { useGroupStore } from "@/store/useGroupStore"
import { useState } from "react"
import { toast } from "sonner"

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
  const [keyword, setKeyword] = useState("")
  
  // Khởi tạo object mặc định để không bị lỗi 'undefined'
  const [form, setForm] = useState<FormCreateGroup>({
    name: "",
    userIds: []
  })

  // Hàm Toggle: Nếu có ID thì xóa, chưa có thì thêm
  const handleToggleUser = (_id: string) => {
    setForm(prev => {
      const isSelected = prev.userIds.includes(_id);
      return {
        ...prev,
        userIds: isSelected 
          ? prev.userIds.filter(id => id !== _id) // Xóa khỏi mảng
          : [...prev.userIds, _id]                // Thêm vào mảng
      };
    });
  }

  const [isLoading, setIsLoading] = useState(false);

const handleCreateGroup = async () => {
  if (!form.name.trim() || form.userIds.length === 0) {
    toast.error("Vui lòng điền đủ thông tin!");
    return;
  }

  setIsLoading(true);
  try {
    const res = await axios.post("http://localhost:5001/api/group/create", form, {
      withCredentials: true
    });
    
    if (res.status === 201) {
      toast.success("Tạo nhóm thành công!");
      setForm({ name: "", userIds: [] }); // Reset form
      onClose(); // ĐÓNG DIALOG NGAY LẬP TỨC
    }
  } catch (error: any) {
    console.error("Lỗi tạo nhóm:", error);
    toast.error(error.response?.data?.message || "Không thể tạo nhóm");
  } finally {
    setIsLoading(false);
  }
}

  const handleGetListFriend = async () => {
    const res = await axios.get(`http://localhost:5001/api/users/search?keyword=${keyword}`, {
      withCredentials: true
    })
    if (res.status === 200 || res.status === 201) {
      setFriends(res?.data)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Create New Group</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Group Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Group Name</label>
            <Input 
              placeholder="Enter group name..." 
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          {/* Search & List */}
          <div className="space-y-4 mt-2 w-full">
            <div className="flex items-center w-full gap-2.5">
              <Input
                placeholder="Search friends..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleGetListFriend()}
              />
              <Button variant="outline" size="icon" onClick={handleGetListFriend}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-col gap-1 w-full max-h-56 overflow-y-scroll scrollbar-none border rounded-lg p-2">
              {friends?.length > 0 ? (
                friends.map((f: any) => {
                  const isSelected = form.userIds.includes(f._id);
                  return (
                    <div 
                      key={f._id} 
                      className={`flex items-center justify-between p-2 rounded-md transition-colors ${isSelected ? "bg-primary/10 border-primary/20 border" : "hover:bg-gray-100 border border-transparent"}`}
                    >
                      <span className="text-sm font-medium">{f.displayName || "No Name"}</span>
                      <Button
                        size="sm"
                        variant={isSelected ? "default" : "secondary"}
                        onClick={() => handleToggleUser(f._id)}
                      >
                        {isSelected ? <Check className="h-4 w-4" /> : <UserPlus2 className="h-4 w-4" />}
                        <span className="ml-1">{isSelected ? "Selected" : "Add"}</span>
                      </Button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-sm text-gray-500 py-4">No friends found.</div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleCreateGroup} disabled={isLoading || form.userIds.length === 0}>
              {isLoading ? "Creating..." : `Create Group (${form.userIds.length})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}