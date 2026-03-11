import { Conversation } from "@/lib/types/chat";
import { useChatStore } from "@/store/useChatStore";
import { useSocketStore } from "@/store/useSocketStore";
import { useEffect } from "react";

// useSocketGroup.ts
export default function useSocketGroup() {
  const socket = useSocketStore(s => s.socket);
  // Lấy addConversation thay vì setConversations
  const { addConversation } = useChatStore(); 

  useEffect(() => {
    if (!socket) return;

    const handleNewConversation = (newConv: Conversation) => {
      console.log("Nhận nhóm mới qua socket:", newConv);
      
      // Gọi hàm này, Store của bạn đã xử lý check existed và push vào mảng rồi
      addConversation(newConv);

      // Tham gia room mới ngay lập tức
      socket.emit("join-conversation", newConv._id);
    };

    socket.on("new-conversation", handleNewConversation);

    return () => {
      socket.off("new-conversation", handleNewConversation);
    };
  }, [socket, addConversation]); 
}