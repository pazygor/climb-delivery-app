/**
 * Models para sistema de suporte e tickets
 */

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  WAITING_CUSTOMER = 'waiting_customer',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum TicketCategory {
  TECHNICAL = 'technical',
  BILLING = 'billing',
  FEATURE_REQUEST = 'feature_request',
  BUG_REPORT = 'bug_report',
  GENERAL_INQUIRY = 'general_inquiry',
  ACCOUNT = 'account'
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  assignedTo?: string;
  assignedToName?: string;
  createdAt: Date;
  updatedAt?: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  messages: TicketMessage[];
  tags?: string[];
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  userRole: 'customer' | 'support' | 'admin';
  message: string;
  attachments?: TicketAttachment[];
  createdAt: Date;
  isInternal: boolean; // Mensagem visível apenas para equipe interna
}

export interface TicketAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedAt: Date;
}

export interface TicketStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedToday: number;
  averageResponseTime: number; // em minutos
  averageResolutionTime: number; // em horas
  customerSatisfaction: number; // 0-5
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  views: number;
  helpful: number;
  notHelpful: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt?: Date;
  author: string;
}
