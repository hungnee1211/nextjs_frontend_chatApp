import { create } from "zustand"
import { Friend, FriendRequest } from "@/lib/types/user"

interface FriendState {
  // ===== STATE =====
  friends: Friend[]
  incomingRequests: FriendRequest[]
  sentRequests: FriendRequest[]
  loading: boolean

  // ===== ACTION =====
  setFriends: (friends: Friend[]) => void
  setIncomingRequests: (requests: FriendRequest[]) => void
  setSentRequests: (requests: FriendRequest[]) => void

  addFriend: (friend: Friend) => void
  removeFriend: (friendId: string) => void

  addIncomingRequest: (request: FriendRequest) => void
  removeIncomingRequest: (requestId: string) => void

  addSentRequest: (request: FriendRequest) => void
  removeSentRequest: (requestId: string) => void

  isFriend: (userId: string) => boolean
  hasSentRequest: (userId: string) => boolean
  hasIncomingRequest: (userId: string) => boolean
}

export const useFriendStore = create<FriendState>((set, get) => ({
  // ===== INIT =====
  friends: [],
  incomingRequests: [],
  sentRequests: [],
  loading: false,

  // ===== SETTERS =====
  setFriends: (friends) => set({ friends }),
  setIncomingRequests: (incomingRequests) => set({ incomingRequests }),
  setSentRequests: (sentRequests) => set({ sentRequests }),

  // ===== FRIEND =====
  addFriend: (friend) =>
    set((state) => {
      const isExisted = state.friends.some(f => f._id === friend._id);
      if (isExisted) return state;
      return { friends: [...state.friends, friend] };
    }),

  removeFriend: (friendId) =>
    set((state) => ({
      friends: state.friends.filter(f => f._id !== friendId)
    })),

  // ===== INCOMING =====
  addIncomingRequest: (request) =>
    set((state) => {
      const isExisted = state.incomingRequests.some(r => r._id === request._id);
      if (isExisted) return state;
      return { incomingRequests: [request, ...state.incomingRequests] };
    }),

  removeIncomingRequest: (requestId) =>
    set((state) => ({
      incomingRequests: state.incomingRequests.filter(r => r._id !== requestId)
    })),

  // ===== SENT =====
  addSentRequest: (request) =>
    set((state) => {
      const isExisted = state.sentRequests.some(r => r._id === request._id);
      if (isExisted) return state;
      return { sentRequests: [request, ...state.sentRequests] };
    }),

  removeSentRequest: (requestId) =>
    set((state) => ({
      sentRequests: state.sentRequests.filter(r => r._id !== requestId)
    })),

  // ===== CHECK (Sửa lỗi TS tại đây) =====
  isFriend: (userId: string) =>
    get().friends.some(f => f._id === userId),

  hasSentRequest: (userId: string) =>
    get().sentRequests.some(r => {
      // Ép kiểu rõ ràng: nếu là object thì coi như có trường _id kiểu string
      const toId = typeof r.to === 'object' ? (r.to as { _id: string })?._id : r.to;
      return toId === userId;
    }),

  hasIncomingRequest: (userId: string) =>
    get().incomingRequests.some(r => {
      // Tương tự cho r.from
      const fromId = typeof r.from === 'object' ? (r.from as { _id: string })?._id : r.from;
      return fromId === userId;
    })
}))