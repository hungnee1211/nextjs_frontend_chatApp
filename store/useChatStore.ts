"use client"

import { Conversation, Message } from "@/lib/types/chat"
import { create } from "zustand"

interface ChatStore {
  currentUserId: string | null
  activeConversationId: string | null

  messagesByConversationId: Record<string, Message[]>

  conversations: Conversation[]

  openDirect: boolean
  openGroup: boolean
  isInfoOpen: boolean

  setConversations: (
    data:
      | Conversation[]
      | ((prev: Conversation[]) => Conversation[])
  ) => void

  setCurrentUserId: (id: string) => void
  setActiveConversationId: (id: string | null) => void

  setMessages: (conversationId: string, messages: Message[]) => void

  addConversation: (conv: Conversation) => void
  updateConversation: (conv: Conversation) => void
  removeConversation: (id: string) => void

  addMessage: (msg: Message & { tempId?: string }) => void
  updateLastMessage: (conversationId: string, msg: Message) => void

  setOpenDirect: (v: boolean) => void
  setOpenGroup: (v: boolean) => void

  toggleInfo: () => void
  setInfoOpen: (v: boolean) => void
}

export const useChatStore = create<ChatStore>((set) => ({
  currentUserId: null,
  conversations: [],
  activeConversationId: null,
  messagesByConversationId: {},

  openDirect: false,
  openGroup: false,
  isInfoOpen: false,

  // ================= UI =================
  toggleInfo: () => set((s) => ({ isInfoOpen: !s.isInfoOpen })),
  setInfoOpen: (v) => set({ isInfoOpen: v }),

  setOpenDirect: (v) => set({ openDirect: v }),
  setOpenGroup: (v) => set({ openGroup: v }),

  // ================= DATA =================
  setCurrentUserId: (id) => set({ currentUserId: id }),

  setConversations: (data) =>
    set((state) => ({
      conversations:
        typeof data === "function"
          ? data(state.conversations)
          : data,
    })),

  setActiveConversationId: (id) =>
    set({ activeConversationId: id }),

  updateConversation: (updated) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c._id === updated._id ? { ...c, ...updated } : c
      ),
    })),

  // ================= MESSAGE =================
setMessages: (conversationId, messages) =>
  set((state) => {
    const last = messages.length > 0 ? messages[messages.length - 1] : null;

    return {
      messagesByConversationId: {
        ...state.messagesByConversationId,
        [conversationId]: messages,
      },
      conversations: state.conversations.map((c): Conversation =>
        c._id === conversationId
          ? ({
              ...c,
              lastMessage: last,
              lastMessageAt: last ? last.createdAt : c.lastMessageAt,
            } as Conversation)
          : c
      ),
    };
  }),

addConversation: (conv) =>
    set((state) => {
      const exist = state.conversations.find(
        (c) => c._id === conv._id
      )

      if (exist) {
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

addMessage: (msg: Message) =>
  set((state) => {
    const conversationId = msg.conversationId;
    const currentMsgs = state.messagesByConversationId[conversationId] || [];

    const isDuplicate = currentMsgs.some(
      (m) => m._id === msg._id || (msg.tempId && m.tempId === msg.tempId)
    );

    let newMsgs = currentMsgs;
    if (msg.tempId && currentMsgs.some((m) => m.tempId === msg.tempId)) {
      newMsgs = currentMsgs.map((m) => (m.tempId === msg.tempId ? msg : m));
    } else if (!isDuplicate) {
      newMsgs = [...currentMsgs, msg];
    } else {
      return state;
    }

    const updatedConvs = state.conversations.map((c): Conversation => {
      if (c._id !== conversationId) return c;

      const isNotMe = msg.senderId !== state.currentUserId;
      const isNotActive = state.activeConversationId !== conversationId;

      // Xử lý participants dựa trên type của conversation
      const updatedParticipants = (c.participants as any[]).map((p) => {
        const pId = typeof p.userId === "string" ? p.userId : p.userId._id;
        if (pId === state.currentUserId && isNotMe && isNotActive) {
          return { ...p, unreadCount: (p.unreadCount || 0) + 1 };
        }
        return p;
      });

      // Trả về đúng kiểu Conversation (ép kiểu qua any để tránh TS bắt bẻ cấu trúc Participant mix)
      return {
        ...c,
        lastMessage: msg,
        lastMessageAt: msg.createdAt,
        participants: updatedParticipants,
      } as Conversation;
    });

    // Sắp xếp lại danh sách
    const sortedConvs = [...updatedConvs].sort((a, b) => {
      const timeA = new Date(a.lastMessageAt || 0).getTime();
      const timeB = new Date(b.lastMessageAt || 0).getTime();
      return timeB - timeA;
    });

    return {
      messagesByConversationId: {
        ...state.messagesByConversationId,
        [conversationId]: newMsgs,
      },
      conversations: sortedConvs,
    };
  }),


  updateLastMessage: (conversationId, msg) =>
    set((state) => {
      const updated = state.conversations
        .map((c) =>
          c._id === conversationId
            ? {
                ...c,
                lastMessage: msg,
                lastMessageAt: msg.createdAt,
              }
            : c
        )
        .sort(
          (a, b) =>
            new Date(b.lastMessageAt || "").getTime() -
            new Date(a.lastMessageAt || "").getTime()
        )

      return { conversations: updated }
    }),

  removeConversation: (id) =>
    set((state) => ({
      conversations: state.conversations.filter(
        (c) => c._id !== id
      ),
      activeConversationId:
        state.activeConversationId === id
          ? null
          : state.activeConversationId,
    })),
}))