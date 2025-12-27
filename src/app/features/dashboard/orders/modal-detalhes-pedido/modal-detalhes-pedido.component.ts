import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { Order } from '../../../../core/models/order.model';
import { OrderService } from '../../../../core/services/order.service';

@Component({
  selector: 'app-modal-detalhes-pedido',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    TagModule,
    DividerModule
  ],
  templateUrl: './modal-detalhes-pedido.component.html',
  styleUrls: ['./modal-detalhes-pedido.component.scss']
})
export class ModalDetalhesPedidoComponent {
  @Input() visible = false;
  @Input() pedido: Order | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() pedidoAtualizado = new EventEmitter<void>();

  processando = false;
  modalCancelamentoVisible = false;
  motivoCancelamento = '';

  constructor(public orderService: OrderService) {}

  fecharModal(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  getStatusSeverity(codigo: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | null {
    const severityMap: Record<string, 'success' | 'info' | 'warn' | 'danger'> = {
      'pendente': 'warn',
      'confirmado': 'info',
      'em_preparo': 'info',
      'pronto': 'success',
      'em_entrega': 'info',
      'entregue': 'success',
      'cancelado': 'danger'
    };
    return severityMap[codigo] || 'info';
  }

  podeAceitar(): boolean {
    return this.pedido?.status?.codigo === 'pendente';
  }

  podeCancelar(): boolean {
    return this.pedido?.status?.codigo !== 'entregue' && 
           this.pedido?.status?.codigo !== 'cancelado';
  }

  podeMarcarComoPreparando(): boolean {
    return this.pedido?.status?.codigo === 'confirmado';
  }

  podeMarcarComoPronto(): boolean {
    return this.pedido?.status?.codigo === 'em_preparo';
  }

  podeMarcarComoEntregue(): boolean {
    return this.pedido?.status?.codigo === 'pronto' || 
           this.pedido?.status?.codigo === 'em_entrega';
  }

  aceitarPedido(): void {
    if (!this.pedido || this.processando) return;

    this.processando = true;
    this.orderService.updateOrderStatus(this.pedido.id, 'confirmado').subscribe({
      next: () => {
        this.processando = false;
        this.pedidoAtualizado.emit();
        this.fecharModal();
      },
      error: (error) => {
        console.error('Erro ao aceitar pedido:', error);
        this.processando = false;
        alert('Erro ao aceitar pedido. Tente novamente.');
      }
    });
  }

  abrirModalCancelamento(): void {
    this.motivoCancelamento = '';
    this.modalCancelamentoVisible = true;
  }

  fecharModalCancelamento(): void {
    this.modalCancelamentoVisible = false;
    this.motivoCancelamento = '';
  }

  confirmarCancelamento(): void {
    if (!this.pedido || this.processando || !this.motivoCancelamento.trim()) return;

    this.processando = true;
    this.orderService.updateOrderStatus(this.pedido.id, 'cancelado', this.motivoCancelamento).subscribe({
      next: () => {
        this.processando = false;
        this.fecharModalCancelamento();
        this.pedidoAtualizado.emit();
        this.fecharModal();
      },
      error: (error) => {
        console.error('Erro ao cancelar pedido:', error);
        this.processando = false;
        alert('Erro ao cancelar pedido. Tente novamente.');
      }
    });
  }

  marcarComoPreparando(): void {
    if (!this.pedido || this.processando) return;

    this.processando = true;
    this.orderService.updateOrderStatus(this.pedido.id, 'em_preparo').subscribe({
      next: () => {
        this.processando = false;
        this.pedidoAtualizado.emit();
        this.fecharModal();
      },
      error: (error) => {
        console.error('Erro ao atualizar status:', error);
        this.processando = false;
        alert('Erro ao atualizar status. Tente novamente.');
      }
    });
  }

  marcarComoPronto(): void {
    if (!this.pedido || this.processando) return;

    this.processando = true;
    this.orderService.updateOrderStatus(this.pedido.id, 'pronto').subscribe({
      next: () => {
        this.processando = false;
        this.pedidoAtualizado.emit();
        this.fecharModal();
      },
      error: (error) => {
        console.error('Erro ao atualizar status:', error);
        this.processando = false;
        alert('Erro ao atualizar status. Tente novamente.');
      }
    });
  }

  marcarComoEntregue(): void {
    if (!this.pedido || this.processando) return;

    this.processando = true;
    this.orderService.updateOrderStatus(this.pedido.id, 'entregue').subscribe({
      next: () => {
        this.processando = false;
        this.pedidoAtualizado.emit();
        this.fecharModal();
      },
      error: (error) => {
        console.error('Erro ao atualizar status:', error);
        this.processando = false;
        alert('Erro ao atualizar status. Tente novamente.');
      }
    });
  }

  reimprimir(): void {
    if (!this.pedido) return;
    
    // TODO: Implementar lógica de reimpressão
    alert('Funcionalidade de reimpressão será implementada com o agente de impressão.');
  }

  getDeliveryAddress(): string {
    if (!this.pedido?.endereco) return 'Retirada no local';
    
    const { logradouro, numero, complemento, bairro, cidade, estado } = this.pedido.endereco;
    let endereco = `${logradouro}, ${numero}`;
    if (complemento) endereco += ` - ${complemento}`;
    endereco += ` - ${bairro}, ${cidade}/${estado}`;
    return endereco;
  }

  getTotalItens(): number {
    if (!this.pedido?.itens) return 0;
    return this.pedido.itens.reduce((sum, item) => sum + item.quantidade, 0);
  }

  formatarData(data: Date | string): string {
    const date = new Date(data);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
