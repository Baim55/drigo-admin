export type SupportStatus = "Open" | "Pending" | "Resolved" | "Closed";

export interface SupportTicket {
  id: number;
  memberId: string;
  memberName: string;
  memberPhone: string;
  reasonId: number;
  reasonName: string;
  status: SupportStatus;
  operatorId: string | null;
  operatorName: string | null;
  lastMessage: string;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  hasUnread: boolean;
  unreadCount: number;
  isMuted: boolean;
}

export interface SupportMessage {
  id: number;
  supportId: number;
  message: string;
  mediaId: string | null;
  mediaUrl: string | null;
  createdAt: string;
  createdBy: string;
  isOperator: boolean;
  operatorName: string | null;
  isBot: boolean;
  botMessageKind: string | null;
}