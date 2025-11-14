import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { 
  Customer, 
  CustomerStatus, 
  CustomerFormData, 
  CustomerStats,
  SubscriptionPlan 
} from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private mockCustomers: Customer[] = [
    {
      id: '1',
      restaurantName: 'Pizzaria Bella Napoli',
      ownerName: 'Giovanni Romano',
      email: 'contato@bellanapoli.com',
      phone: '(11) 98765-4321',
      cnpj: '12.345.678/0001-90',
      status: CustomerStatus.ACTIVE,
      plan: SubscriptionPlan.PRO,
      subscriptionStartDate: new Date('2024-01-15'),
      monthlyRevenue: 15000,
      totalOrders: 1250,
      address: {
        street: 'Rua das Palmeiras',
        number: '123',
        neighborhood: 'Jardins',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567'
      },
      createdAt: new Date('2024-01-15'),
      lastLogin: new Date('2025-11-10')
    },
    {
      id: '2',
      restaurantName: 'Sushi House',
      ownerName: 'Takeshi Yamamoto',
      email: 'contato@sushihouse.com',
      phone: '(11) 97654-3210',
      cnpj: '98.765.432/0001-10',
      status: CustomerStatus.ACTIVE,
      plan: SubscriptionPlan.ENTERPRISE,
      subscriptionStartDate: new Date('2023-06-10'),
      monthlyRevenue: 28000,
      totalOrders: 2100,
      address: {
        street: 'Av. Paulista',
        number: '1000',
        complement: 'Loja 5',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100'
      },
      createdAt: new Date('2023-06-10'),
      lastLogin: new Date('2025-11-11')
    },
    {
      id: '3',
      restaurantName: 'Burger Station',
      ownerName: 'Carlos Mendes',
      email: 'contato@burgerstation.com',
      phone: '(11) 96543-2109',
      cnpj: '11.222.333/0001-44',
      status: CustomerStatus.TRIAL,
      plan: SubscriptionPlan.BASIC,
      subscriptionStartDate: new Date('2025-11-01'),
      subscriptionEndDate: new Date('2025-11-15'),
      monthlyRevenue: 3500,
      totalOrders: 120,
      address: {
        street: 'Rua Augusta',
        number: '456',
        neighborhood: 'Consolação',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01304-001'
      },
      createdAt: new Date('2025-11-01'),
      lastLogin: new Date('2025-11-09')
    },
    {
      id: '4',
      restaurantName: 'Café Gourmet',
      ownerName: 'Ana Paula Silva',
      email: 'contato@cafegourmet.com',
      phone: '(11) 95432-1098',
      status: CustomerStatus.SUSPENDED,
      plan: SubscriptionPlan.BASIC,
      subscriptionStartDate: new Date('2024-08-20'),
      monthlyRevenue: 0,
      totalOrders: 450,
      address: {
        street: 'Rua dos Pinheiros',
        number: '789',
        neighborhood: 'Pinheiros',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '05422-001'
      },
      createdAt: new Date('2024-08-20'),
      lastLogin: new Date('2025-10-15'),
      notes: 'Suspenso por inadimplência'
    }
  ];

  constructor() { }

  /**
   * Retorna todos os clientes
   */
  getCustomers(): Observable<Customer[]> {
    return of(this.mockCustomers).pipe(delay(300));
  }

  /**
   * Retorna cliente por ID
   */
  getCustomerById(id: string): Observable<Customer | undefined> {
    const customer = this.mockCustomers.find(c => c.id === id);
    return of(customer).pipe(delay(300));
  }

  /**
   * Retorna clientes filtrados por status
   */
  getCustomersByStatus(status: CustomerStatus): Observable<Customer[]> {
    const filtered = this.mockCustomers.filter(c => c.status === status);
    return of(filtered).pipe(delay(300));
  }

  /**
   * Cria novo cliente
   */
  createCustomer(data: CustomerFormData): Observable<Customer> {
    const newCustomer: Customer = {
      id: String(Date.now()),
      ...data,
      status: CustomerStatus.TRIAL,
      subscriptionStartDate: new Date(),
      subscriptionEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 dias trial
      monthlyRevenue: 0,
      totalOrders: 0,
      createdAt: new Date()
    };
    
    this.mockCustomers.push(newCustomer);
    return of(newCustomer).pipe(delay(500));
  }

  /**
   * Atualiza cliente
   */
  updateCustomer(id: string, data: Partial<Customer>): Observable<Customer> {
    const index = this.mockCustomers.findIndex(c => c.id === id);
    if (index !== -1) {
      this.mockCustomers[index] = {
        ...this.mockCustomers[index],
        ...data,
        updatedAt: new Date()
      };
      return of(this.mockCustomers[index]).pipe(delay(500));
    }
    throw new Error('Cliente não encontrado');
  }

  /**
   * Atualiza status do cliente
   */
  updateCustomerStatus(id: string, status: CustomerStatus): Observable<Customer> {
    return this.updateCustomer(id, { status });
  }

  /**
   * Deleta cliente
   */
  deleteCustomer(id: string): Observable<void> {
    const index = this.mockCustomers.findIndex(c => c.id === id);
    if (index !== -1) {
      this.mockCustomers.splice(index, 1);
      return of(void 0).pipe(delay(300));
    }
    throw new Error('Cliente não encontrado');
  }

  /**
   * Retorna estatísticas dos clientes
   */
  getCustomerStats(): Observable<CustomerStats> {
    const stats: CustomerStats = {
      totalCustomers: this.mockCustomers.length,
      activeCustomers: this.mockCustomers.filter(c => c.status === CustomerStatus.ACTIVE).length,
      trialCustomers: this.mockCustomers.filter(c => c.status === CustomerStatus.TRIAL).length,
      suspendedCustomers: this.mockCustomers.filter(c => c.status === CustomerStatus.SUSPENDED).length,
      monthlyRecurringRevenue: this.mockCustomers
        .filter(c => c.status === CustomerStatus.ACTIVE)
        .reduce((sum, c) => sum + this.getPlanPrice(c.plan), 0),
      averageOrdersPerCustomer: Math.round(
        this.mockCustomers.reduce((sum, c) => sum + c.totalOrders, 0) / this.mockCustomers.length
      )
    };
    
    return of(stats).pipe(delay(300));
  }

  /**
   * Retorna preço do plano
   */
  private getPlanPrice(plan: SubscriptionPlan): number {
    const prices = {
      [SubscriptionPlan.BASIC]: 97,
      [SubscriptionPlan.PRO]: 197,
      [SubscriptionPlan.ENTERPRISE]: 497
    };
    return prices[plan] || 0;
  }

  /**
   * Formata CNPJ
   */
  formatCNPJ(cnpj: string): string {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }

  /**
   * Formata telefone
   */
  formatPhone(phone: string): string {
    return phone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  }
}
