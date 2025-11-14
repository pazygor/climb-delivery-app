/**
 * Models para gerenciamento de assinaturas e planos
 */

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  TRIAL = 'trial',
  EXPIRED = 'expired'
}

export enum PaymentStatus {
  PAID = 'paid',
  PENDING = 'pending',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PIX = 'pix',
  BOLETO = 'boleto',
  BANK_TRANSFER = 'bank_transfer'
}

export interface Plan {
  id: string;
  name: string;
  type: 'basic' | 'pro' | 'enterprise';
  price: number;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  features: PlanFeature[];
  maxUsers: number;
  maxOrders: number;
  supportLevel: 'basic' | 'priority' | '24/7';
  isActive: boolean;
  description?: string;
}

export interface PlanFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
}

export interface Subscription {
  id: string;
  customerId: string;
  customerName: string;
  planId: string;
  planName: string;
  status: SubscriptionStatus;
  startDate: Date;
  endDate?: Date;
  nextBillingDate: Date;
  amount: number;
  paymentMethod: PaymentMethod;
  autoRenew: boolean;
  createdAt: Date;
  updatedAt?: Date;
  canceledAt?: Date;
  cancelReason?: string;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  customerId: string;
  customerName: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  dueDate: Date;
  paidAt?: Date;
  issueDate: Date;
  invoiceNumber: string;
  description: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface BillingStats {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  pendingPayments: number;
  failedPayments: number;
  refunds: number;
  activeSubscriptions: number;
  churnRate: number;
}
