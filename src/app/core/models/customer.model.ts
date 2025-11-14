/**
 * Models para gerenciamento de clientes (restaurantes) na área administrativa
 */

export enum CustomerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  TRIAL = 'trial'
}

export enum SubscriptionPlan {
  BASIC = 'basic',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}

export interface Customer {
  id: string;
  restaurantName: string;
  ownerName: string;
  email: string;
  phone: string;
  cnpj?: string;
  status: CustomerStatus;
  plan: SubscriptionPlan;
  subscriptionStartDate: Date;
  subscriptionEndDate?: Date;
  monthlyRevenue: number;
  totalOrders: number;
  address: CustomerAddress;
  createdAt: Date;
  updatedAt?: Date;
  lastLogin?: Date;
  notes?: string;
}

export interface CustomerAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface CustomerFormData {
  restaurantName: string;
  ownerName: string;
  email: string;
  phone: string;
  cnpj?: string;
  plan: SubscriptionPlan;
  address: CustomerAddress;
  notes?: string;
}

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  trialCustomers: number;
  suspendedCustomers: number;
  monthlyRecurringRevenue: number;
  averageOrdersPerCustomer: number;
}
