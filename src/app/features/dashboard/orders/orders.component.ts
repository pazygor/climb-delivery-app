import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { Order, OrderStatusColumn } from '../../../core/models/order.model';
import { ModalNovoPedidoComponent } from './modal-novo-pedido/modal-novo-pedido.component';
import { ModalDetalhesPedidoComponent } from './modal-detalhes-pedido/modal-detalhes-pedido.component';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule, BadgeModule, ModalNovoPedidoComponent, ModalDetalhesPedidoComponent],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit {
  modalNovoPedidoVisible = false;
  modalDetalhesPedidoVisible = false;
  pedidoSelecionado: Order | null = null;
  
  columns: OrderStatusColumn[] = [
    {
      title: 'Em Análise',
      status: ['pendente'],
      color: '#f59e0b'
    },
    {
      title: 'Em Produção',
      status: ['confirmado', 'em_preparo'],
      color: '#3b82f6'
    },
    {
      title: 'Pronto para Entrega',
      status: ['pronto', 'em_entrega'],
      color: '#10b981'
    }
  ];

  ordersByColumn: { [key: string]: Order[] } = {};
  loading = false;
  empresaId: number | null = null;

  constructor(
    public orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Obtém o ID da empresa do usuário logado
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.establishmentId) {
      this.empresaId = parseInt(currentUser.establishmentId);
      this.loadOrders();
    } else {
      console.error('Usuário não possui empresa associada');
    }
  }

  loadOrders(): void {
    if (!this.empresaId) {
      console.error('Empresa ID não disponível');
      return;
    }

    this.loading = true;
    
    // Busca pedidos da empresa logada
    this.orderService.getOrdersByEmpresa(this.empresaId).subscribe({
      next: (orders) => {
        // Organiza os pedidos por coluna baseado no status
        this.columns.forEach(column => {
          this.ordersByColumn[column.title] = orders.filter(order => 
            column.status.includes(order.status?.codigo || '')
          );
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar pedidos:', error);
        this.loading = false;
      }
    });
  }

  getOrderTime(order: Order): string {
    const now = new Date().getTime();
    const orderTime = new Date(order.createdAt).getTime();
    const diffMinutes = Math.floor((now - orderTime) / 60000);
    
    if (diffMinutes < 1) return 'Agora';
    if (diffMinutes < 60) return `${diffMinutes} min atrás`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours}h atrás`;
  }

  moveToNextStatus(order: Order, currentColumn: OrderStatusColumn): void {
    const currentIndex = this.columns.indexOf(currentColumn);
    
    if (currentIndex < this.columns.length - 1) {
      const nextColumn = this.columns[currentIndex + 1];
      // Pega o primeiro status da próxima coluna
      const newStatus = nextColumn.status[0];
      
      this.orderService.updateOrderStatus(order.id, newStatus).subscribe({
        next: () => {
          this.loadOrders();
        },
        error: (error) => {
          console.error('Erro ao atualizar status do pedido:', error);
        }
      });
    }
  }

  finalizarPedido(order: Order): void {
    // Atualiza o status para "entregue"
    this.orderService.updateOrderStatus(order.id, 'entregue').subscribe({
      next: () => {
        this.loadOrders();
      },
      error: (error) => {
        console.error('Erro ao finalizar pedido:', error);
        alert('Erro ao finalizar pedido. Por favor, tente novamente.');
      }
    });
  }

  getTotalItems(order: Order): number {
    if (!order.itens) {
      return order._count?.itens || 0;
    }
    return order.itens.reduce((sum, item) => sum + item.quantidade, 0);
  }

  getCustomerName(order: Order): string {
    return order.usuario?.nome || 'Cliente';
  }

  getCustomerPhone(order: Order): string {
    return order.usuario?.telefone || '';
  }

  getDeliveryAddress(order: Order): string {
    if (!order.endereco) return '';
    
    const { logradouro, numero, bairro, cidade } = order.endereco;
    return `${logradouro}, ${numero} - ${bairro}, ${cidade}`;
  }

  // Determina se é delivery ou retirada baseado no endereço
  getOrderType(order: Order): 'delivery' | 'pickup' {
    return order.endereco ? 'delivery' : 'pickup';
  }

  /**
   * Abre modal para criar novo pedido manualmente
   */
  abrirModalNovoPedido(): void {
    this.modalNovoPedidoVisible = true;
  }

  onPedidoCriado(): void {
    this.modalNovoPedidoVisible = false;
    this.loadOrders();
  }

  /**
   * Abre modal de detalhes do pedido
   */
  abrirDetalhesPedido(pedido: Order): void {
    this.pedidoSelecionado = pedido;
    this.modalDetalhesPedidoVisible = true;
  }

  onPedidoAtualizado(): void {
    this.loadOrders();
  }

  /**
   * Retorna a quantidade total de pedidos pendentes (em análise)
   */
  getPedidosPendentesCount(): number {
    const pendentesColumn = this.columns.find(col => col.status.includes('pendente'));
    if (!pendentesColumn) return 0;
    return this.ordersByColumn[pendentesColumn.title]?.length || 0;
  }
}
