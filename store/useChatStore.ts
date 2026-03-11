import { Conversation, Message, LastMessage } from "@/lib/types/chat"
import { create } from "zustand"

interface ChatStore {
  currentUserId: string | null
  conversations: Conversation[]
  activeConversationId: string | null
  messagesByConversationId: Record<string, Message[]>
  openDirect:boolean
  openGroup:boolean

  setCurrentUserId: (id: string) => void
  setConversations: (data: Conversation[]) => void
  setActiveConversationId: (id: string) => void
  setMessages: (conversationId: string, messages: Message[]) => void

  addConversation: (conv: Conversation) => void
  addMessage: (message: Message & { tempId?: string }) => void
  updateLastMessage: (conversationId: string, message: Message) => void
  setOpenDirect:(value:boolean) => void
  setOpenGroup:(value:boolean) => void
  
}

export const useChatStore = create<ChatStore>((set) => ({

  currentUserId: null,
  conversations: [],
  activeConversationId: null,
  messagesByConversationId: {},
  openDirect:false,
  openGroup:false ,

  setCurrentUserId: (id) => set({ currentUserId: id }),

  setConversations: (data) => set({ conversations: data }),

  setActiveConversationId: (id) => set({ activeConversationId: id }),

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
              avatarUrl: last.senderInfor?.avatarUrl || null
            }
          }
        : null

      return {
        messagesByConversationId: {
          ...state.messagesByConversationId,
          [conversationId]: messages
        },

        conversations: state.conversations.map((conv) =>
          conv._id === conversationId
            ? { ...conv, lastMessage }
            : conv
        )
      }

    }),

  addConversation: (conv) =>
    set((state) => {

      const existed = state.conversations.find(c => c._id === conv._id)
      if (existed) return {}

      return {

        conversations: [conv, ...state.conversations],

        messagesByConversationId: {
          ...state.messagesByConversationId,
          [conv._id]: []
        }

      }

    }),

  addMessage: (message: Message & { tempId?: string }) =>
    set((state) => {

      const msgs = state.messagesByConversationId[message.conversationId] || []

      let newMsgs = msgs

      // xử lý optimistic message
      if (message.tempId) {

      const index = msgs.findIndex(m => m.tempId === message.tempId || m._id === message.tempId)

        if (index !== -1) {

          newMsgs = [...msgs]
          newMsgs[index] = message

        } else {

          newMsgs = [...msgs, message]

        }

      } else {

        if (msgs.some(m => m._id === message._id)) return {}

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
          avatarUrl: message.senderInfor?.avatarUrl || null
        }
      }

      const updatedConversations = state.conversations
        .map((conv) =>
          conv._id === message.conversationId
            ? { ...conv, lastMessage }
            : conv
        )
        .sort((a, b) => {

          const timeA = a.lastMessage?.createdAt || ""
          const timeB = b.lastMessage?.createdAt || ""

          return (
            new Date(timeB).getTime() -
            new Date(timeA).getTime()
          )

        })

      return {

        messagesByConversationId: {
          ...state.messagesByConversationId,
          [message.conversationId]: newMsgs
        },

        conversations: updatedConversations

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
          avatarUrl: message.senderInfor?.avatarUrl || null
        }
      }

      const updatedConversations = state.conversations
        .map((conv) =>
          conv._id === conversationId
            ? { ...conv, lastMessage }
            : conv
        )
        .sort((a, b) => {

          const timeA = a.lastMessage?.createdAt || ""
          const timeB = b.lastMessage?.createdAt || ""

          return (
            new Date(timeB).getTime() -
            new Date(timeA).getTime()
          )

        })

      return { conversations: updatedConversations }

    }),


    setOpenDirect: (value) => set({ openDirect: value }),
    setOpenGroup: (value) => set({ openGroup: value }),

}))