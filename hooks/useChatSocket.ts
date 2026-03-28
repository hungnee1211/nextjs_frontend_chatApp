"use client"

import { useEffect, useRef } from "react"
import { useSocketStore } from "@/store/useSocketStore"
import { useChatStore } from "@/store/useChatStore"
import { useFriendStore } from "@/store/useFriendStore"
import { toast } from "sonner"

export const useChatSocket = (userId?: string) => {
    const socket = useSocketStore((s) => s.socket)
    const connect = useSocketStore((s) => s.connect)
    const disconnect = useSocketStore((s) => s.disconnect)

    const { addMessage, addConversation, activeConversationId } = useChatStore()
    const addIncomingRequest = useFriendStore((s) => s.addIncomingRequest)

    // 1. Quản lý kết nối
    useEffect(() => {
        if (userId) {
            connect(userId)
            return () => { disconnect() }
        }
    }, [userId, connect, disconnect])

    // 2. Quản lý Events với cơ chế chống lặp
    useEffect(() => {
        if (!socket) return

        const handleNewMessage = (message: any) => {
            console.log("📩 New Message Received:", message._id)
            addMessage(message)
        }

        const handleNewConversation = (conversation: any) => {
            console.log("💎 Nhận cuộc hội thoại mới:", conversation._id);


            const formattedConv = {
                ...conversation,
                type: conversation.type || (conversation.name ? "group" : "direct")
            };

            addConversation(formattedConv);

            socket.emit("join-conversation", conversation._id);

            toast.success(`Bạn có cuộc trò chuyện mới: ${formattedConv.name || ""}`);
        };

        const handleFriendRequest = (request: any) => {
            addIncomingRequest(request)
            toast.info("Bạn có lời mời kết bạn mới!")
        }

        const handleConversationRead = ({ conversationId }: { conversationId: string }) => {
            // Reset unreadCount trong store khi nhận được tín hiệu "đã đọc"
            useChatStore.setState((state) => ({
                conversations: state.conversations.map((c) => {
                    if (c._id !== conversationId) return c
                    return {
                        ...c,
                        participants: (c.participants as any[]).map((p) => {
                            const pId = typeof p.userId === "string" ? p.userId : p.userId._id
                            if (pId === state.currentUserId) return { ...p, unreadCount: 0 }
                            return p
                        }),
                    }
                }) as any,
            }))
        }


        const handleBlock =   ({ conversationId, blockedBy }:any) => {
    // Cập nhật lại conversations trong Store
    useChatStore.setState((state: any) => ({
      conversations: state.conversations.map((c: any) =>
        c._id === conversationId ? { ...c, blockedBy } : c
      ),
    }))
    }


   const updateConvo = (updatedConvo:any) => {
    useChatStore.setState((state: any) => ({
      conversations: state.conversations.map((c: any) =>
        c._id === updatedConvo._id ? { ...c, ...updatedConvo, type: "group" } : c
      )
    }));
  }

  // 2. Khi chính mình được thêm vào một nhóm mới
    const newConvo = (newConvo:any) => {
    useChatStore.setState((state: any) => {
      // Tránh trùng lặp nếu đã có trong list
      const exists = state.conversations.some((c: any) => c._id === newConvo._id);
      if (exists) return state;
      return { conversations: [newConvo, ...state.conversations] };
    });
    toast.info(`Bạn vừa được thêm vào nhóm: ${newConvo.name}`);
  }

  // 3. Khi mình bị xóa khỏi nhóm hoặc tự rời nhóm
  const handleRemoveFromList = (conversationId: string) => {
    useChatStore.setState((state: any) => ({
      conversations: state.conversations.filter((c: any) => c._id !== conversationId),
      // Nếu đang mở nhóm đó thì đóng lại
      activeConversationId: state.activeConversationId === conversationId ? null : state.activeConversationId
    }));
  };

  socket.on("left-group", handleRemoveFromList);
  const removeGroup =  (id:any) => {
    handleRemoveFromList(id);
    toast.error("Bạn đã bị xóa khỏi một nhóm chat");
  }

        // Gỡ sạch mọi listener cũ có tên này trước khi gắn mới
        socket.off("new-message")
        socket.off("receive-message")
        socket.off("new-conversation")
        socket.off("new-friend-request")
        socket.off("conversation-read") // Thêm dòng này
        socket.off("on-block-status-change")
        socket.off("update-conversation");
        socket.off("new-conversation");
        socket.off("left-group");
        socket.off("removed-from-group");

        // Gắn listener
        socket.on("new-message", handleNewMessage)
        socket.on("receive-message", handleNewMessage)
        socket.on("new-conversation", handleNewConversation)
        socket.on("new-friend-request", handleFriendRequest)
        socket.on("conversation-read", handleConversationRead)
        socket.on("on-block-status-change" , handleBlock)
        socket.on("update-conversation" ,updateConvo );
        socket.on("new-conversation" ,newConvo );
        socket.on("left-group" , handleRemoveFromList);
        socket.on("removed-from-group", removeGroup);

        return () => {
            socket.off("new-message", handleNewMessage)
            socket.off("receive-message", handleNewMessage)
            socket.off("new-conversation", handleNewConversation)
            socket.off("new-friend-request", handleFriendRequest)
            socket.off("conversation-read", handleConversationRead)
            socket.off("on-block-status-change", handleBlock)
            socket.off("update-conversation" , updateConvo)
            socket.off("new-conversation" , newConvo)
            socket.off("left-group" ,handleRemoveFromList)
            socket.off("removed-from-group" ,removeGroup)
    
        }
    }, [socket, addMessage, addConversation, addIncomingRequest])
}