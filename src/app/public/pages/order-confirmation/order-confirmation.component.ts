import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { TimelineModule } from 'primeng/timeline';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

// Services
import { PublicOrderService } from '../../services/public-order.service';
import { PublicCartService } from '../../services/public-cart.service';

// Models
import { Pedido } from '../../models/checkout.model';
import { CurrencyUtil } from '../../../core/utils/currency.util';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    DividerModule,
    TagModule,
    TimelineModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './order-confirmation.component.html',
  styleUrl: './order-confirmation.component.scss'
})
export class OrderConfirmationComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private orderService = inject(PublicOrderService);
  private cartService = inject(PublicCartService);

  pedido: Pedido | null = null;
  loading = true;
  error = false;
  slug = '';

  ngOnInit(): void {
    // Pegar slug do parent route (já que pedido/:numero é child route)
    this.slug = this.route.parent?.snapshot.paramMap.get('slug') || '';
    const numero = this.route.snapshot.paramMap.get('numero') || '';

    if (!numero) {
      this.router.navigate(['/p', this.slug]);
      return;
    }

    // Limpar carrinho
    this.cartService.clearCart();

    // Buscar pedido
    this.orderService.getPedido(numero).subscribe({
      next: (pedido) => {
        this.pedido = pedido;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao buscar pedido:', error);
        this.error = true;
        this.loading = false;
      }
    });
  }

  formatarValor(valor: number): string {
    return CurrencyUtil.format(valor);
  }

  getWhatsAppLink(): string {
    if (!this.pedido || !this.pedido.empresa?.whatsapp) {
      return '';
    }

    const whatsapp = this.pedido.empresa.whatsapp.replace(/\D/g, '');
    const mensagem = `Olá! Meu pedido é ${this.pedido.numero}`;
    const mensagemEncoded = encodeURIComponent(mensagem);
    
    return `https://wa.me/55${whatsapp}?text=${mensagemEncoded}`;
  }
  
  fazerNovoPedido(): void {
    this.orderService.clearOrder();
    this.router.navigate(['/p', this.slug]);
  }

  getStatusSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' {
    const statusMap: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
      pendente: 'warning',
      confirmado: 'info',
      em_preparo: 'info',
      pronto: 'success',
      em_entrega: 'info',
      entregue: 'success',
      cancelado: 'danger',
    };
    return statusMap[status] || 'info';
  }
}
