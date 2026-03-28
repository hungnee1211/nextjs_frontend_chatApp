import { UserPlus, Settings, LogOut, ChevronRight, Image, FileText } from 'lucide-react';

const GroupInfo = () => {
  return (
    <div className="w-80 h-full border-l bg-white flex flex-col p-4 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex flex-col items-center py-6">
        <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3 shadow-sm">
          G
        </div>
        <h2 className="text-xl font-semibold text-slate-800">group chat ....</h2>
        <p className="text-sm text-slate-500">8 thành viên</p>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-around mb-8">
        <button className="flex flex-col items-center gap-1 group">
          <div className="p-2 bg-slate-100 rounded-full group-hover:bg-slate-200 transition-colors">
            <UserPlus size={20} className="text-slate-600" />
          </div>
          <span className="text-xs text-slate-500">Thêm người</span>
        </button>
        <button className="flex flex-col items-center gap-1 group">
          <div className="p-2 bg-slate-100 rounded-full group-hover:bg-slate-200 transition-colors">
            <Settings size={20} className="text-slate-600" />
          </div>
          <span className="text-xs text-slate-500">Cài đặt</span>
        </button>
      </div>

      {/* Accordion Sections */}
      <div className="flex-1 overflow-y-auto space-y-4">
        <div>
          <button className="flex items-center justify-between w-full p-2 hover:bg-slate-50 rounded-lg">
            <span className="font-medium text-slate-700">Thành viên nhóm</span>
            <ChevronRight size={18} className="text-slate-400" />
          </button>
        </div>

        <div>
          <button className="flex items-center justify-between w-full p-2 hover:bg-slate-50 rounded-lg">
            <span className="font-medium text-slate-700">Ảnh & Video</span>
            <Image size={18} className="text-slate-400" />
          </button>
        </div>

        <div>
          <button className="flex items-center justify-between w-full p-2 hover:bg-slate-50 rounded-lg">
            <span className="font-medium text-slate-700">File đính kèm</span>
            <FileText size={18} className="text-slate-400" />
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <button className="mt-auto flex items-center gap-2 text-red-500 p-3 hover:bg-red-50 rounded-xl transition-colors">
        <LogOut size={20} />
        <span className="font-medium">Rời khỏi nhóm</span>
      </button>
    </div>
  );
};