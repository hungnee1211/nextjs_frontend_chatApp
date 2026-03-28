"use client"

import { useChatStore } from "@/store/useChatStore"
import {
  UserPlus, Settings, LogOut, ChevronRight,
  Image, FileText, User, BellOff, Ban, Search, Users, Trash2, ShieldCheck,
  Camera,
  Loader2
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useMemo, useRef, useState } from "react"
import axios from "axios"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useUserStore } from "@/store/useUserStore"
import axiosClient from "@/lib/axios_config"


const ConversationSidebar = () => {
  const { isInfoOpen, activeConversationId, conversations, currentUserId } = useChatStore()

  const conversation = conversations.find(c => c._id === activeConversationId)

  const info = useMemo(() => {
    if (!conversation || !currentUserId || conversation.type === "group") return null
    const direct = conversation as any
    return direct.user || direct.participants?.find((p: any) =>
      (typeof p.userId === "string" ? p.userId : p.userId._id) !== currentUserId
    )?.userId
  }, [conversation, currentUserId])


  if (!isInfoOpen || !conversation) return null





  return (
    <aside className="w-[350px] border-l bg-white h-full flex flex-col animate-in slide-in-from-right duration-300 shadow-2xl z-30">
      <div className="flex items-center h-[72px] px-6 border-b font-bold text-lg text-slate-800">
        Thông tin hội thoại
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {conversation.type === "group" ? (
          <GroupInfoView conversation={conversation} currentUserId={currentUserId} />
        ) : (
          <DirectInfoView conversation={conversation} user={info} currentUserId={currentUserId} />
        )}
      </div>
    </aside>
  )
}


// --- COMPONENT CON CHO GROUP ---
const GroupInfoView = ({ conversation, currentUserId }: any) => {
  const isOwner = conversation.createdBy === currentUserId || conversation.createdBy?._id === currentUserId;
  const [showMembers, setShowMembers] = useState(false);

  const {user} = useUserStore()
  // State cho Update Group
  const [newName, setNewName] = useState(conversation.name);
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State cho Thêm thành viên
  const [searchUser, setSearchUser] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // 1. CẬP NHẬT AVATAR & NAME
  const handleUpdateGroup = async () => {
    try {
      setIsUpdating(true);
      await axiosClient.patch(`http://localhost:5001/api/group/${conversation._id}`,
        { name: newName , conversationId:conversation._id}, { withCredentials: true }
      );
      toast.success("Cập nhật nhóm thành công");
      // Update store...
    } catch (err) { toast.error("Lỗi cập nhật"); }
    finally { setIsUpdating(false); }
  };

 // Trong GroupInfoView
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("avatar", file);

  try {
    toast.loading("Đang tải ảnh lên...");
    const res = await axiosClient.patch(
      `http://localhost:5001/api/group/${conversation._id}/avatar`, 
      formData, 
      { withCredentials: true }
    );
    
    toast.dismiss();
    toast.success("Đã đổi ảnh nhóm");

    // Cập nhật Store cục bộ ngay lập tức (Phòng trường hợp socket delay)
    useChatStore.setState((state: any) => ({
      conversations: state.conversations.map((c: any) =>
        c._id === conversation._id ? { ...c, avatar: res.data.avatar } : c
      )
    }));

  } catch (err) {
    toast.dismiss();
    toast.error("Lỗi tải ảnh");
  }
};

  // 2. TÌM KIẾM & THÊM THÀNH VIÊN
  const handleSearch = async (val: string) => {
    setSearchUser(val);
    if (val.length < 2) return;
    try {
      setIsSearching(true);
      const res = await axiosClient.get(`http://localhost:5001/api/users/search?keyword=${val}`, { withCredentials: true });
      setSearchResults(res.data);
    } catch (err) { console.error(err); }
    finally { setIsSearching(false); }
  };

  const handleAddMember = async (targetUserId: string) => {
    try {
      await axiosClient.patch(`http://localhost:5001/api/group/${conversation._id}/add`, { userId: targetUserId , conversationId:conversation._id}, { withCredentials: true });
      toast.success("Đã thêm vào nhóm");
    } catch (err: any) { toast.error(err.response?.data?.message || "Lỗi khi thêm"); }
  };

  // 3. RỜI NHÓM
  const handleLeaveGroup = async () => {
    try {
      await axiosClient.patch(`http://localhost:5001/api/group/${conversation._id}/remove`, { userId:user._id, conversationId:conversation._id}, { withCredentials: true });
      toast.success("Đã rời khỏi nhóm");
      useChatStore.setState({ activeConversationId: null });
    } catch (err) { toast.error("Không thể rời nhóm"); }
  };

  // 4. XÓA THÀNH VIÊN
  const handleRemoveMember = async (memberId: string) => {
    try {
      await axiosClient.patch(`http://localhost:5001/api/group/${conversation._id}/remove`, { userId:memberId, conversationId:conversation._id }, { withCredentials: true });
      toast.success("Đã xóa thành viên");
      // Update store logic...
    } catch (err) { toast.error("Lỗi khi xóa"); }
  };

  return (
    <div className="flex flex-col p-6">
      {/* Header Info */}
      <div className="flex flex-col items-center py-4 mb-6 border-b w-full group relative">
        <div className="relative">
          <Avatar className="h-20 w-20 mb-3 border-2 border-white shadow-lg">
            <AvatarImage src={`http://localhost:5001${conversation.avatar}`} className="object-cover" />
            <AvatarFallback className="bg-blue-500 text-white font-bold text-2xl">{conversation.name?.[0]}</AvatarFallback>
          </Avatar>
          {isOwner && (
            <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-3 right-0 p-1.5 bg-white rounded-full shadow-md border hover:bg-slate-50 text-slate-600">
              <Camera size={14} />
            </button>
          )}
          <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} accept="image/*" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">{conversation.name}</h2>

        <button onClick={() => setShowMembers(!showMembers)} className="text-sm text-blue-600 font-semibold mt-1 flex items-center gap-1">
          {conversation.participants?.length} thành viên <ChevronRight size={14} className={cn("transition-transform", showMembers && "rotate-90")} />
        </button>
      </div>

      {/* Danh sách thành viên */}
      {showMembers && (
        <div className="mb-6 space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
          {conversation.participants.map((p: any) => {
            const member = p.userId;
            const isMe = member._id === currentUserId;
            const isMemberOwner = conversation.createdBy === member._id || conversation.createdBy?._id === member._id;

            return (
              <div key={member._id} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8"><AvatarImage src={`http://localhost:5001${member.avatarUrl}`} /></Avatar>
                  <span className="text-sm font-medium">{member.displayName} {isMe && "(Bạn)"}</span>
                </div>

                {isOwner && !isMemberOwner && !isMe && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa?</AlertDialogTitle>
                        <AlertDialogDescription>Bạn có chắc muốn xóa <b>{member.displayName}</b> khỏi nhóm này?</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRemoveMember(member._id)} className="bg-red-500">Xác nhận xóa</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Action Menu */}
      <div className="space-y-1">
        {isOwner && (
          <>
            {/* POPOVER THÊM THÀNH VIÊN */}
            <Popover>
              <PopoverTrigger asChild>
                <div><SidebarItem icon={<UserPlus size={18} className="text-blue-500" />} label="Thêm thành viên" className="text-blue-600" /></div>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" side="left">
                <div className="space-y-4">
                  <h4 className="font-bold">Thêm thành viên</h4>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Tìm tên hoặc username..." className="pl-8" value={searchUser} onChange={(e) => handleSearch(e.target.value)} />
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {isSearching ? <Loader2 className="animate-spin mx-auto" /> : searchResults.map((u: any) => (
                      <div key={u._id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7"><AvatarImage src={`http://localhost:5001${u.avatarUrl}`} /></Avatar>
                          <span className="text-xs font-semibold">{u.displayName}</span>
                        </div>
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-blue-600" onClick={() => handleAddMember(u._id)}><UserPlus size={14} /></Button>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* POPOVER UPDATE NHÓM */}
            <Popover>
              <PopoverTrigger asChild>
                <div><SidebarItem icon={<Settings size={18} />} label="Đổi tên & Ảnh nhóm" /></div>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" side="left">
                <div className="space-y-4">
                  <h4 className="font-bold">Thông tin nhóm</h4>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">Tên nhóm mới</label>
                    <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
                  </div>
                  <Button className="w-full bg-blue-600" onClick={handleUpdateGroup} disabled={isUpdating}>
                    {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </>
        )}

        <div className="h-[1px] bg-slate-100 my-3" />
        <SidebarItem icon={<Image size={18} />} label="Ảnh & Video" />
        <SidebarItem icon={<FileText size={18} />} label="File đính kèm" />
      </div>

      {/* ALERT DIALOG RỜI NHÓM */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button className="mt-8 flex items-center justify-center gap-2 text-red-500 p-3 hover:bg-red-50 rounded-xl transition-all font-bold border border-red-50">
            <LogOut size={18} /> Rời khỏi nhóm
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rời khỏi nhóm?</AlertDialogTitle>
            <AlertDialogDescription>Bạn sẽ không thể xem lại tin nhắn cũ trừ khi được mời lại vào nhóm này.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ở lại</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeaveGroup} className="bg-red-500">Rời nhóm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
// --- GIAO DIỆN CHAT ĐƠN ---
const DirectInfoView = ({ conversation, user, currentUserId }: any) => {
  const isBlockedByMe = conversation.blockedBy?.includes(currentUserId);

  const handleBlockAction = async () => {
    const action = isBlockedByMe ? "unblock" : "block";
    try {
      // ✅ SỬA: URL khớp với directRouter.js (/api/direct/:id/block hoặc unblock)
      await axiosClient.patch(`http://localhost:5001/api/direct/${conversation._id}/${action}`, {}, { withCredentials: true });

      toast.success(isBlockedByMe ? "Đã bỏ chặn" : "Đã chặn người dùng");

      useChatStore.setState((state: any) => ({
        conversations: state.conversations.map((c: any) =>
          c._id === conversation._id
            ? {
              ...c, blockedBy: isBlockedByMe
                ? c.blockedBy.filter((id: string) => id !== currentUserId)
                : [...(c.blockedBy || []), currentUserId]
            }
            : c
        )
      }));
    } catch (err) {
      toast.error("Thao tác thất bại");
    }
  };

  return (
    <div className="flex flex-col p-6">
      <div className="flex flex-col items-center py-6 mb-6 border-b w-full">
        <Avatar className="h-24 w-24 mb-4 border-2 border-white shadow-xl">
          <AvatarImage src={`http://localhost:5001${user?.avatarUrl}`} className="object-cover" />
          <AvatarFallback className="bg-slate-200 text-slate-500 text-3xl font-bold">{user?.displayName?.[0]}</AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-bold text-slate-900">{user?.displayName}</h2>
        <span className="text-[11px] font-bold text-green-500 bg-green-50 px-3 py-1 rounded-full uppercase mt-3 tracking-widest border border-green-100">Online</span>
      </div>

      <div className="space-y-1">
        <SidebarItem icon={<User size={18} />} label="Trang cá nhân" />
        <SidebarItem icon={<Search size={18} />} label="Tìm kiếm tin nhắn" />
        <div className="h-[1px] bg-slate-100 my-4" />
        <SidebarItem
          icon={<Ban size={18} />}
          label={isBlockedByMe ? "Bỏ chặn người dùng" : "Chặn người dùng"}
          className={isBlockedByMe ? "text-blue-600" : "text-red-500 hover:bg-red-50"}
          onClick={handleBlockAction}
        />
      </div>
    </div>
  )
}

const SidebarItem = ({ icon, label, className = "", onClick }: any) => (
  <button onClick={onClick} className={cn("flex items-center justify-between w-full p-3 hover:bg-slate-50 rounded-xl transition-all group", className)}>
    <div className="flex items-center gap-3">
      <span className="text-slate-500 group-hover:text-inherit transition-colors">{icon}</span>
      <span className="text-[14px] font-medium">{label}</span>
    </div>
    <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500" />
  </button>
)

export default ConversationSidebar;