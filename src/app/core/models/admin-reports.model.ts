/**
 * Models para relatórios administrativos e analytics
 */

export interface PlatformMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  totalCustomers: number;
  activeCustomers: number;
  totalOrders: number;
  averageOrderValue: number;
  churnRate: number;
  customerLifetimeValue: number;
}

export interface RevenueReport {
  period: string;
  totalRevenue: number;
  subscriptionRevenue: number;
  transactionFees: number;
  refunds: number;
  netRevenue: number;
  growthRate: number;
}

export interface CustomerGrowthReport {
  period: string;
  newCustomers: number;
  churnedCustomers: number;
  netGrowth: number;
  totalActive: number;
}

export interface UsageReport {
  customerId: string;
  customerName: string;
  plan: string;
  ordersThisMonth: number;
  usersActive: number;
  storageUsed: number; // em MB
  apiCalls: number;
  lastActivity: Date;
}

export interface FinancialReport {
  period: string;
  revenue: number;
  costs: number;
  grossProfit: number;
  grossMargin: number;
  operatingExpenses: number;
  netProfit: number;
  netMargin: number;
}

export interface ChurnAnalysis {
  period: string;
  totalChurned: number;
  churnRate: number;
  reasonsForChurn: ChurnReason[];
  averageLifetime: number; // em meses
  lostRevenue: number;
}

export interface ChurnReason {
  reason: string;
  count: number;
  percentage: number;
}

export interface TopCustomers {
  customerId: string;
  customerName: string;
  totalRevenue: number;
  totalOrders: number;
  plan: string;
  status: string;
  joinDate: Date;
}
