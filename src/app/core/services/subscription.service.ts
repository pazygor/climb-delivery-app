import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  Plan,
  Subscription,
  Invoice,
  BillingStats,
  SubscriptionStatus,
  PaymentStatus,
  PaymentMethod
} from '../models/subscription.model';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private mockPlans: Plan[] = [
    {
      id: '1',
      name: 'Plano Básico',
      type: 'basic',
      price: 97.00,
      billingCycle: 'monthly',
      maxUsers: 3,
      maxOrders: 500,
      supportLevel: 'basic',
      isActive: true,
      description: 'Ideal para restaurantes pequenos começando no delivery',
      features: [
        { id: '1', name: 'Gestão de Pedidos', description: 'Até 500 pedidos/mês', included: true },
        { id: '2', name: 'Cardápio Digital', description: 'Ilimitado', included: true },
        { id: '3', name: 'Relatórios Básicos', description: 'Relatórios mensais', included: true },
        { id: '4', name: 'Suporte', description: 'Email (48h)', included: true },
        { id: '5', name: 'Integrações', description: 'Não incluído', included: false }
      ]
    },
    {
      id: '2',
      name: 'Plano Pro',
      type: 'pro',
      price: 197.00,
      billingCycle: 'monthly',
      maxUsers: 10,
      maxOrders: 2000,
      supportLevel: 'priority',
      isActive: true,
      description: 'Para restaurantes em crescimento',
      features: [
        { id: '1', name: 'Gestão de Pedidos', description: 'Até 2000 pedidos/mês', included: true },
        { id: '2', name: 'Cardápio Digital', description: 'Ilimitado', included: true },
        { id: '3', name: 'Relatórios Avançados', description: 'Relatórios em tempo real', included: true },
        { id: '4', name: 'Suporte', description: 'Chat e Email (12h)', included: true },
        { id: '5', name: 'Integrações', description: '3 integrações', included: true },
        { id: '6', name: 'Marketing', description: 'Cupons e promoções', included: true }
      ]
    },
    {
      id: '3',
      name: 'Plano Enterprise',
      type: 'enterprise',
      price: 497.00,
      billingCycle: 'monthly',
      maxUsers: -1, // Ilimitado
      maxOrders: -1, // Ilimitado
      supportLevel: '24/7',
      isActive: true,
      description: 'Para grandes redes e franquias',
      features: [
        { id: '1', name: 'Gestão de Pedidos', description: 'Ilimitado', included: true },
        { id: '2', name: 'Cardápio Digital', description: 'Ilimitado', included: true },
        { id: '3', name: 'Relatórios Premium', description: 'Analytics avançado', included: true },
        { id: '4', name: 'Suporte', description: 'Telefone, Chat e Email 24/7', included: true },
        { id: '5', name: 'Integrações', description: 'Ilimitadas', included: true },
        { id: '6', name: 'Marketing', description: 'Suite completa', included: true },
        { id: '7', name: 'Multi-lojas', description: 'Gestão centralizada', included: true },
        { id: '8', name: 'API Personalizada', description: 'Desenvolvimento customizado', included: true }
      ]
    }
  ];

  private mockSubscriptions: Subscription[] = [
    {
      id: '1',
      customerId: '1',
      customerName: 'Pizzaria Bella Napoli',
      planId: '2',
      planName: 'Plano Pro',
      status: SubscriptionStatus.ACTIVE,
      startDate: new Date('2024-01-15'),
      nextBillingDate: new Date('2025-12-15'),
      amount: 197.00,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      autoRenew: true,
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2',
      customerId: '2',
      customerName: 'Sushi House',
      planId: '3',
      planName: 'Plano Enterprise',
      status: SubscriptionStatus.ACTIVE,
      startDate: new Date('2023-06-10'),
      nextBillingDate: new Date('2025-12-10'),
      amount: 497.00,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      autoRenew: true,
      createdAt: new Date('2023-06-10')
    },
    {
      id: '3',
      customerId: '3',
      customerName: 'Burger Station',
      planId: '1',
      planName: 'Plano Básico',
      status: SubscriptionStatus.TRIAL,
      startDate: new Date('2025-11-01'),
      endDate: new Date('2025-11-15'),
      nextBillingDate: new Date('2025-11-15'),
      amount: 0,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      autoRenew: false,
      createdAt: new Date('2025-11-01')
    },
    {
      id: '4',
      customerId: '4',
      customerName: 'Café Gourmet',
      planId: '1',
      planName: 'Plano Básico',
      status: SubscriptionStatus.PAST_DUE,
      startDate: new Date('2024-08-20'),
      nextBillingDate: new Date('2025-11-01'),
      amount: 97.00,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      autoRenew: true,
      createdAt: new Date('2024-08-20')
    }
  ];

  private mockInvoices: Invoice[] = [
    {
      id: '1',
      subscriptionId: '1',
      customerId: '1',
      customerName: 'Pizzaria Bella Napoli',
      amount: 197.00,
      status: PaymentStatus.PAID,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      dueDate: new Date('2025-11-15'),
      paidAt: new Date('2025-11-13'),
      issueDate: new Date('2025-11-01'),
      invoiceNumber: 'INV-2025-001',
      description: 'Assinatura Plano Pro - Novembro 2025',
      items: [
        {
          id: '1',
          description: 'Plano Pro - Mensal',
          quantity: 1,
          unitPrice: 197.00,
          totalPrice: 197.00
        }
      ]
    },
    {
      id: '2',
      subscriptionId: '2',
      customerId: '2',
      customerName: 'Sushi House',
      amount: 497.00,
      status: PaymentStatus.PAID,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      dueDate: new Date('2025-11-10'),
      paidAt: new Date('2025-11-09'),
      issueDate: new Date('2025-11-01'),
      invoiceNumber: 'INV-2025-002',
      description: 'Assinatura Plano Enterprise - Novembro 2025',
      items: [
        {
          id: '1',
          description: 'Plano Enterprise - Mensal',
          quantity: 1,
          unitPrice: 497.00,
          totalPrice: 497.00
        }
      ]
    },
    {
      id: '3',
      subscriptionId: '4',
      customerId: '4',
      customerName: 'Café Gourmet',
      amount: 97.00,
      status: PaymentStatus.FAILED,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      dueDate: new Date('2025-11-01'),
      issueDate: new Date('2025-10-25'),
      invoiceNumber: 'INV-2025-003',
      description: 'Assinatura Plano Básico - Novembro 2025',
      items: [
        {
          id: '1',
          description: 'Plano Básico - Mensal',
          quantity: 1,
          unitPrice: 97.00,
          totalPrice: 97.00
        }
      ]
    }
  ];

  constructor() { }

  /**
   * Retorna todos os planos
   */
  getPlans(): Observable<Plan[]> {
    return of(this.mockPlans).pipe(delay(300));
  }

  /**
   * Retorna planos ativos
   */
  getActivePlans(): Observable<Plan[]> {
    const active = this.mockPlans.filter(p => p.isActive);
    return of(active).pipe(delay(300));
  }

  /**
   * Retorna todas as assinaturas
   */
  getSubscriptions(): Observable<Subscription[]> {
    return of(this.mockSubscriptions).pipe(delay(300));
  }

  /**
   * Retorna assinaturas por status
   */
  getSubscriptionsByStatus(status: SubscriptionStatus): Observable<Subscription[]> {
    const filtered = this.mockSubscriptions.filter(s => s.status === status);
    return of(filtered).pipe(delay(300));
  }

  /**
   * Retorna todas as faturas
   */
  getInvoices(): Observable<Invoice[]> {
    return of(this.mockInvoices).pipe(delay(300));
  }

  /**
   * Retorna faturas por cliente
   */
  getInvoicesByCustomer(customerId: string): Observable<Invoice[]> {
    const filtered = this.mockInvoices.filter(i => i.customerId === customerId);
    return of(filtered).pipe(delay(300));
  }

  /**
   * Retorna estatísticas de faturamento
   */
  getBillingStats(): Observable<BillingStats> {
    const stats: BillingStats = {
      totalRevenue: this.mockInvoices
        .filter(i => i.status === PaymentStatus.PAID)
        .reduce((sum, i) => sum + i.amount, 0),
      monthlyRecurringRevenue: this.mockSubscriptions
        .filter(s => s.status === SubscriptionStatus.ACTIVE)
        .reduce((sum, s) => sum + s.amount, 0),
      pendingPayments: this.mockInvoices
        .filter(i => i.status === PaymentStatus.PENDING)
        .reduce((sum, i) => sum + i.amount, 0),
      failedPayments: this.mockInvoices
        .filter(i => i.status === PaymentStatus.FAILED)
        .reduce((sum, i) => sum + i.amount, 0),
      refunds: this.mockInvoices
        .filter(i => i.status === PaymentStatus.REFUNDED)
        .reduce((sum, i) => sum + i.amount, 0),
      activeSubscriptions: this.mockSubscriptions.filter(s => s.status === SubscriptionStatus.ACTIVE).length,
      churnRate: 5.2 // Mock - calcular com base em cancelamentos
    };
    
    return of(stats).pipe(delay(300));
  }

  /**
   * Cancela assinatura
   */
  cancelSubscription(id: string, reason: string): Observable<Subscription> {
    const subscription = this.mockSubscriptions.find(s => s.id === id);
    if (subscription) {
      subscription.status = SubscriptionStatus.CANCELED;
      subscription.canceledAt = new Date();
      subscription.cancelReason = reason;
      subscription.autoRenew = false;
      return of(subscription).pipe(delay(500));
    }
    throw new Error('Assinatura não encontrada');
  }

  /**
   * Formata valor em moeda brasileira
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
}
