import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import {
  Ticket,
  TicketMessage,
  TicketStats,
  KnowledgeBaseArticle,
  TicketStatus,
  TicketPriority,
  TicketCategory
} from '../models/support.model';

@Injectable({
  providedIn: 'root'
})
export class SupportService {
  private mockTickets: Ticket[] = [
    {
      id: '1',
      ticketNumber: 'TICK-2025-001',
      customerId: '1',
      customerName: 'Pizzaria Bella Napoli',
      customerEmail: 'contato@bellanapoli.com',
      subject: 'Problema com impressão de pedidos',
      description: 'A impressora não está imprimindo os pedidos corretamente. Os pedidos aparecem cortados.',
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.HIGH,
      category: TicketCategory.TECHNICAL,
      assignedTo: 'admin-1',
      assignedToName: 'Suporte Técnico',
      createdAt: new Date('2025-11-10T10:30:00'),
      updatedAt: new Date('2025-11-10T14:20:00'),
      messages: [
        {
          id: '1',
          ticketId: '1',
          userId: '1',
          userName: 'Giovanni Romano',
          userRole: 'customer',
          message: 'A impressora não está imprimindo os pedidos corretamente. Os pedidos aparecem cortados.',
          createdAt: new Date('2025-11-10T10:30:00'),
          isInternal: false
        },
        {
          id: '2',
          ticketId: '1',
          userId: 'admin-1',
          userName: 'Suporte Técnico',
          userRole: 'support',
          message: 'Olá Giovanni! Vou verificar as configurações da impressora. Pode me informar o modelo?',
          createdAt: new Date('2025-11-10T14:20:00'),
          isInternal: false
        }
      ],
      tags: ['impressora', 'pedidos', 'urgente']
    },
    {
      id: '2',
      ticketNumber: 'TICK-2025-002',
      customerId: '2',
      customerName: 'Sushi House',
      customerEmail: 'contato@sushihouse.com',
      subject: 'Solicitação de nova funcionalidade',
      description: 'Gostaria de uma opção para programar promoções com antecedência.',
      status: TicketStatus.OPEN,
      priority: TicketPriority.MEDIUM,
      category: TicketCategory.FEATURE_REQUEST,
      createdAt: new Date('2025-11-11T09:15:00'),
      messages: [
        {
          id: '1',
          ticketId: '2',
          userId: '2',
          userName: 'Takeshi Yamamoto',
          userRole: 'customer',
          message: 'Gostaria de uma opção para programar promoções com antecedência.',
          createdAt: new Date('2025-11-11T09:15:00'),
          isInternal: false
        }
      ],
      tags: ['feature', 'promoções']
    },
    {
      id: '3',
      ticketNumber: 'TICK-2025-003',
      customerId: '3',
      customerName: 'Burger Station',
      customerEmail: 'contato@burgerstation.com',
      subject: 'Dúvida sobre faturamento',
      description: 'Qual é a data de cobrança após o período trial?',
      status: TicketStatus.RESOLVED,
      priority: TicketPriority.LOW,
      category: TicketCategory.BILLING,
      assignedTo: 'admin-2',
      assignedToName: 'Financeiro',
      createdAt: new Date('2025-11-08T16:00:00'),
      updatedAt: new Date('2025-11-08T16:30:00'),
      resolvedAt: new Date('2025-11-08T16:30:00'),
      messages: [
        {
          id: '1',
          ticketId: '3',
          userId: '3',
          userName: 'Carlos Mendes',
          userRole: 'customer',
          message: 'Qual é a data de cobrança após o período trial?',
          createdAt: new Date('2025-11-08T16:00:00'),
          isInternal: false
        },
        {
          id: '2',
          ticketId: '3',
          userId: 'admin-2',
          userName: 'Financeiro',
          userRole: 'support',
          message: 'A cobrança será realizada automaticamente no dia seguinte ao término do trial (15/11).',
          createdAt: new Date('2025-11-08T16:30:00'),
          isInternal: false
        }
      ],
      tags: ['faturamento', 'trial']
    },
    {
      id: '4',
      ticketNumber: 'TICK-2025-004',
      customerId: '1',
      customerName: 'Pizzaria Bella Napoli',
      customerEmail: 'contato@bellanapoli.com',
      subject: 'Bug no relatório de vendas',
      description: 'Os valores do relatório de vendas não estão batendo com os pedidos.',
      status: TicketStatus.WAITING_CUSTOMER,
      priority: TicketPriority.HIGH,
      category: TicketCategory.BUG_REPORT,
      assignedTo: 'admin-1',
      assignedToName: 'Suporte Técnico',
      createdAt: new Date('2025-11-09T11:00:00'),
      updatedAt: new Date('2025-11-09T15:00:00'),
      messages: [
        {
          id: '1',
          ticketId: '4',
          userId: '1',
          userName: 'Giovanni Romano',
          userRole: 'customer',
          message: 'Os valores do relatório de vendas não estão batendo com os pedidos.',
          createdAt: new Date('2025-11-09T11:00:00'),
          isInternal: false
        },
        {
          id: '2',
          ticketId: '4',
          userId: 'admin-1',
          userName: 'Suporte Técnico',
          userRole: 'support',
          message: 'Pode me enviar uma captura de tela do relatório para análise?',
          createdAt: new Date('2025-11-09T15:00:00'),
          isInternal: false
        }
      ],
      tags: ['bug', 'relatório', 'vendas']
    }
  ];

  private mockKnowledgeBase: KnowledgeBaseArticle[] = [
    {
      id: '1',
      title: 'Como configurar a impressora de pedidos',
      content: 'Passo a passo completo para configurar sua impressora térmica...',
      category: 'Configuração',
      tags: ['impressora', 'configuração', 'hardware'],
      views: 245,
      helpful: 180,
      notHelpful: 12,
      isPublished: true,
      createdAt: new Date('2024-01-15'),
      author: 'Equipe ClimbDelivery'
    },
    {
      id: '2',
      title: 'Como criar promoções e cupons',
      content: 'Aprenda a criar promoções atrativas para seus clientes...',
      category: 'Marketing',
      tags: ['promoções', 'cupons', 'marketing'],
      views: 532,
      helpful: 420,
      notHelpful: 28,
      isPublished: true,
      createdAt: new Date('2024-02-10'),
      author: 'Equipe ClimbDelivery'
    },
    {
      id: '3',
      title: 'Entendendo os relatórios de vendas',
      content: 'Guia completo sobre os relatórios disponíveis na plataforma...',
      category: 'Relatórios',
      tags: ['relatórios', 'vendas', 'analytics'],
      views: 412,
      helpful: 350,
      notHelpful: 15,
      isPublished: true,
      createdAt: new Date('2024-03-05'),
      author: 'Equipe ClimbDelivery'
    }
  ];

  constructor() { }

  /**
   * Retorna todos os tickets
   */
  getTickets(): Observable<Ticket[]> {
    return of(this.mockTickets).pipe(delay(300));
  }

  /**
   * Retorna ticket por ID
   */
  getTicketById(id: string): Observable<Ticket | undefined> {
    const ticket = this.mockTickets.find(t => t.id === id);
    return of(ticket).pipe(delay(300));
  }

  /**
   * Retorna tickets por status
   */
  getTicketsByStatus(status: TicketStatus): Observable<Ticket[]> {
    const filtered = this.mockTickets.filter(t => t.status === status);
    return of(filtered).pipe(delay(300));
  }

  /**
   * Retorna tickets por prioridade
   */
  getTicketsByPriority(priority: TicketPriority): Observable<Ticket[]> {
    const filtered = this.mockTickets.filter(t => t.priority === priority);
    return of(filtered).pipe(delay(300));
  }

  /**
   * Atualiza status do ticket
   */
  updateTicketStatus(id: string, status: TicketStatus): Observable<Ticket> {
    const ticket = this.mockTickets.find(t => t.id === id);
    if (ticket) {
      ticket.status = status;
      ticket.updatedAt = new Date();
      
      if (status === TicketStatus.RESOLVED) {
        ticket.resolvedAt = new Date();
      } else if (status === TicketStatus.CLOSED) {
        ticket.closedAt = new Date();
      }
      
      return of(ticket).pipe(delay(300));
    }
    throw new Error('Ticket não encontrado');
  }

  /**
   * Adiciona mensagem ao ticket
   */
  addTicketMessage(ticketId: string, message: Omit<TicketMessage, 'id' | 'ticketId' | 'createdAt'>): Observable<TicketMessage> {
    const ticket = this.mockTickets.find(t => t.id === ticketId);
    if (ticket) {
      const newMessage: TicketMessage = {
        ...message,
        id: String(Date.now()),
        ticketId,
        createdAt: new Date()
      };
      
      ticket.messages.push(newMessage);
      ticket.updatedAt = new Date();
      
      return of(newMessage).pipe(delay(300));
    }
    throw new Error('Ticket não encontrado');
  }

  /**
   * Retorna estatísticas de suporte
   */
  getTicketStats(): Observable<TicketStats> {
    const stats: TicketStats = {
      totalTickets: this.mockTickets.length,
      openTickets: this.mockTickets.filter(t => t.status === TicketStatus.OPEN).length,
      inProgressTickets: this.mockTickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length,
      resolvedToday: this.mockTickets.filter(t => {
        const today = new Date().toDateString();
        return t.resolvedAt && t.resolvedAt.toDateString() === today;
      }).length,
      averageResponseTime: 45, // Mock - em minutos
      averageResolutionTime: 4.5, // Mock - em horas
      customerSatisfaction: 4.7 // Mock - 0-5
    };
    
    return of(stats).pipe(delay(300));
  }

  /**
   * Retorna artigos da base de conhecimento
   */
  getKnowledgeBaseArticles(): Observable<KnowledgeBaseArticle[]> {
    return of(this.mockKnowledgeBase).pipe(delay(300));
  }

  /**
   * Retorna artigos publicados
   */
  getPublishedArticles(): Observable<KnowledgeBaseArticle[]> {
    const published = this.mockKnowledgeBase.filter(a => a.isPublished);
    return of(published).pipe(delay(300));
  }

  /**
   * Busca artigos por categoria
   */
  getArticlesByCategory(category: string): Observable<KnowledgeBaseArticle[]> {
    const filtered = this.mockKnowledgeBase.filter(a => 
      a.category.toLowerCase() === category.toLowerCase() && a.isPublished
    );
    return of(filtered).pipe(delay(300));
  }
}
