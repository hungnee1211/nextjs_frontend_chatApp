import { Conversation, Message, LastMessage } from "@/lib/types/chat"
import { create } from "zustand"

interface ChatStore {
  currentUserId: string | null
  conversations: Conversation[]
  activeConversationId: string | null
  messagesByConversationId: Record<string, Message[]>
  openDirect: boolean
  openGroup: boolean

  // Actions
  setCurrentUserId: (id: string) => void
  setConversations: (data: Conversation[]) => void
  setActiveConversationId: (id: string | null) => void
  setMessages: (conversationId: string, messages: Message[]) => void
  
  // Conversation Logic
  addConversation: (conv: Conversation) => void
  updateConversation: (updatedConv: Conversation) => void // Cập nhật khi thêm thành viên/đổi tên
  removeConversation: (id: string) => void
  
  // Message Logic
  addMessage: (message: Message & { tempId?: string }) => void
  updateLastMessage: (conversationId: string, message: Message) => void
  
  // UI Logic
  setOpenDirect: (value: boolean) => void
  setOpenGroup: (value: boolean) => void
}

export const useChatStore = create<ChatStore>((set) => ({
  currentUserId: null,
  conversations: [],
  activeConversationId: null,
  messagesByConversationId: {},
  openDirect: false,
  openGroup: false,

  setCurrentUserId: (id) => set({ currentUserId: id }),
  
  setConversations: (data) => set({ conversations: data }),
  
  setActiveConversationId: (id) => set({ activeConversationId: id }),

  // Cập nhật thông tin chi tiết của một cuộc hội thoại (thêm mem, sửa tên...)
  updateConversation: (updatedConv) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c._id === updatedConv._id ? { ...c, ...updatedConv } : c
      ),
    })),

  setMessages: (conversationId, messages) =>
    set((state) => {
      const last = messages?.[messages.length - 1]
      const lastMessage: LastMessage | null = last
        ? {
            _id: last._id,
            content: last.content ?? "",
            createdAt: last.createdAt,
            sender: {
              _id: last.senderId,
              displayName:
                last.senderInfor?.displayName ||
                last.displayName ||
                "Unknown",
              avatarUrl: last.senderInfor?.avatarUrl || null,
            },
          }
        : null

      return {
        messagesByConversationId: {
          ...state.messagesByConversationId,
          [conversationId]: messages,
        },
        conversations: state.conversations.map((conv) =>
          conv._id === conversationId ? { ...conv, lastMessage } : conv
        ),
      }
    }),

  addConversation: (conv) =>
    set((state) => {
      const existed = state.conversations.find((c) => c._id === conv._id)
      if (existed) {
        // Nếu đã tồn tại, cập nhật lại để đảm bảo thông tin (như mem mới) là mới nhất
        return {
          conversations: state.conversations.map((c) =>
            c._id === conv._id ? { ...c, ...conv } : c
          ),
        }
      }
      return {
        conversations: [conv, ...state.conversations],
        messagesByConversationId: {
          ...state.messagesByConversationId,
          [conv._id]: [],
        },
      }
    }),

  addMessage: (message: Message & { tempId?: string }) =>
    set((state) => {
      const msgs = state.messagesByConversationId[message.conversationId] || []
      let newMsgs = msgs

      if (message.tempId) {
        const index = msgs.findIndex(
          (m) => m.tempId === message.tempId || m._id === message.tempId
        )
        if (index !== -1) {
          newMsgs = [...msgs]
          newMsgs[index] = message
        } else {
          newMsgs = [...msgs, message]
        }
      } else {
        if (msgs.some((m) => m._id === message._id)) return {}
        newMsgs = [...msgs, message]
      }

      const lastMessage: LastMessage = {
        _id: message._id,
        content: message.content ?? "",
        createdAt: message.createdAt,
        sender: {
          _id: message.senderId,
          displayName:
            message.senderInfor?.displayName ||
            message.displayName ||
            "Unknown",
          avatarUrl: message.senderInfor?.avatarUrl || null,
        },
      }

      const updatedConversations = state.conversations
        .map((conv) =>
          conv._id === message.conversationId ? { ...conv, lastMessage } : conv
        )
        .sort(
          (a, b) =>
            new Date(b.lastMessage?.createdAt || "").getTime() -
            new Date(a.lastMessage?.createdAt || "").getTime()
        )

      return {
        messagesByConversationId: {
          ...state.messagesByConversationId,
          [message.conversationId]: newMsgs,
        },
        conversations: updatedConversations,
      }
    }),

  updateLastMessage: (conversationId, message) =>
    set((state) => {
      const lastMessage: LastMessage = {
        _id: message._id,
        content: message.content ?? "",
        createdAt: message.createdAt,
        sender: {
          _id: message.senderId,
          displayName:
            message.senderInfor?.displayName ||
            message.displayName ||
            "Unknown",
          avatarUrl: message.senderInfor?.avatarUrl || null,
        },
      }

      const updatedConversations = state.conversations
        .map((conv) =>
          conv._id === conversationId ? { ...conv, lastMessage } : conv
        )
        .sort(
          (a, b) =>
            new Date(b.lastMessage?.createdAt || "").getTime() -
            new Date(a.lastMessage?.createdAt || "").getTime()
        )

      return { conversations: updatedConversations }
    }),

  setOpenDirect: (value) => set({ openDirect: value }),
  setOpenGroup: (value) => set({ openGroup: value }),

  removeConversation: (id) =>
    set((state) => ({
      conversations: state.conversations.filter((c) => c._id !== id),
      activeConversationId:
        state.activeConversationId === id ? null : state.activeConversationId,
    })),
}))