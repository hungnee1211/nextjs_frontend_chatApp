
import { User } from "./user"
// ==========================
export type ObjectId = string


export interface Message {
  _id: ObjectId

  conversationId: ObjectId
  conversationType: "direct" | "group"

  senderId: ObjectId
  tempId?: string
  content: string
  imgUrl?: string | null

  senderSnapshot?: {
    name: string
    avatar: string
  }

  createdAt: string
  updatedAt: string
}


export interface DirectParticipant {
  userId: ObjectId | User
  lastReadAt?: string | null
  unreadCount: number
}

export interface GroupParticipant {
  userId: ObjectId | User
  role: "member" | "admin"
  joinedAt: string
  lastReadAt?: string | null
  unreadCount: number
}


export interface DirectConversation {
  _id: ObjectId

  type: "direct" 

  participants: DirectParticipant[]

  directKey: string

  lastMessage?: Message | string | null
  lastMessageAt?: string

  hiddenBy: ObjectId[]
  blockedBy: ObjectId[]

  createdAt: string
  updatedAt: string
  user?: User;
}


export interface GroupConversation {
  _id: ObjectId

  type: "group" 
  name: string
  avatar?: string | null

  createdBy: ObjectId | User

  participants: GroupParticipant[]

  lastMessage?: Message | string | null
  lastMessageAt?: string

  hiddenBy: ObjectId[]

  createdAt: string
  updatedAt: string
}


export type Conversation = | DirectConversation | GroupConversation
 
  


// 👉 Lấy user còn lại trong direct chat
export const getOtherUser = (
  convo: DirectConversation,
  currentUserId: ObjectId
): User | null => {
  const found = convo.participants.find((p) => {
    const id =
      typeof p.userId === "string"
        ? p.userId
        : p.userId._id
    return id !== currentUserId
  })

  if (!found) return null

  return typeof found.userId === "string"
    ? null
    : found.userId
}

// 👉 Check hidden
export const isHidden = (
  convo: Conversation,
  userId: ObjectId
) => {
  return convo.hiddenBy.includes(userId)
}

// 👉 Check blocked (chỉ direct)
export const isBlocked = (
  convo: DirectConversation,
  userId: ObjectId
) => {
  return convo.blockedBy.includes(userId)
}

// 👉 Sort conversation theo lastMessageAt
export const sortConversations = (
  list: Conversation[]
) => {
  return [...list].sort((a, b) => {
    const timeA = a.lastMessageAt
      ? new Date(a.lastMessageAt).getTime()
      : 0

    const timeB = b.lastMessageAt
      ? new Date(b.lastMessageAt).getTime()
      : 0

    return timeB - timeA
  })
}


export interface LastMessage {
  _id: string
  content: string
  createdAt: string
  sender: {
    _id: string
    displayName: string
    avatarUrl: string | null
  }
}