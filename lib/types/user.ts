export type ObjectId = string

export interface User {
  _id: ObjectId
  username: string
  displayName: string
  avatarUrl: string

  createdAt: string
  updatedAt: string
}


export interface Friend {
  _id: ObjectId

  userA: ObjectId | User
  userB: ObjectId | User

  createdAt: string
  updatedAt: string
}
export interface FriendRequest {
  _id: ObjectId

  from: User
  to: ObjectId

  message?: string

  createdAt: string
  updatedAt: string
}
