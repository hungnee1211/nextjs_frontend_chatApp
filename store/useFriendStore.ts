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
    set((state) => ({
      friends: [...state.friends, friend]
    })),

  removeFriend: (friendId) =>
    set((state) => ({
      friends: state.friends.filter(f => f._id !== friendId)
    })),

  // ===== INCOMING =====
  addIncomingRequest: (request) =>
    set((state) => ({
      incomingRequests: [...state.incomingRequests, request]
    })),

  removeIncomingRequest: (requestId) =>
    set((state) => ({
      incomingRequests: state.incomingRequests.filter(r => r._id !== requestId)
    })),

  // ===== SENT =====
  addSentRequest: (request) =>
    set((state) => ({
      sentRequests: [...state.sentRequests, request]
    })),

  removeSentRequest: (requestId) =>
    set((state) => ({
      sentRequests: state.sentRequests.filter(r => r._id !== requestId)
    })),

  // ===== CHECK =====
  isFriend: (userId) =>
    get().friends.some(f => f._id === userId),

  hasSentRequest: (userId) =>
    get().sentRequests.some(r => r.to?._id === userId),

  hasIncomingRequest: (userId) =>
    get().incomingRequests.some(r => r.from?._id === userId)

}))