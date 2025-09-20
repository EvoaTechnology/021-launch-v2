export type MessageStatus = "sending" | "sent" | "delivered" | "read" | "failed"
export type SocialPlatform = "twitter" | "linkedin" | "github" | "website" | "email"
export type MediaType = "image" | "document" | "video" | "other"

export interface MediaAttachment {
  id: string
  name: string
  size: number
  type: MediaType
  url: string
  file?: File
}

export interface MessageData {
  id: string
  contactId: string
  content: string
  timestamp: string
  isOutgoing: boolean
  status?: MessageStatus
  platform: SocialPlatform
  attachment?: MediaAttachment
}

export interface ContactData {
  id: string
  name: string
  platform: SocialPlatform
  username: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  isOnline: boolean
}
