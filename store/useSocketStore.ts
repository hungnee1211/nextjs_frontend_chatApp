import { create } from "zustand"
import { io, Socket } from "socket.io-client"

interface SocketState {
    socket: Socket | null
    isConnected: boolean
    onlineUsers: string[]

    connect: (userId: string) => void
    disconnect: () => void
    isUserOnline: (userId: string) => boolean
}

export const useSocketStore = create<SocketState>((set, get) => ({
    socket: null,
    isConnected: false,
    onlineUsers: [],

   connect: (userId) => {
  if (get().socket) return

  const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
    query: { userId }, 
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("🟢 connected FE")
    set({ isConnected: true })
  })

  socket.on("connect_error", (err) => {
    console.log("❌ connect error:", err.message)
  })

  socket.on("disconnect", () => {
    set({ isConnected: false })
  })

  socket.on("online-users", (users: string[]) => {
    set({ onlineUsers: users })
  })
  

  set({ socket })
},
    disconnect: () => {
        const socket = get().socket
        if (socket) {
            socket.disconnect()
            set({ socket: null, isConnected: false, onlineUsers: [] })
        }
    },

    isUserOnline: (userId: string) => {
        return get().onlineUsers.includes(userId)
    }
}))