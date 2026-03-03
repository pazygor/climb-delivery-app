import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// PrimeNG
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';

// Models
import { CartItem } from '../../models/cart.model';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [
    CommonModule,
    SidebarModule,
    ButtonModule,
    BadgeModule
  ],
  templateUrl: './cart-drawer.component.html',
  styleUrl: './cart-drawer.component.scss'
})
export class CartDrawerComponent {
  @Input() visible: boolean = false;
  @Input() items: CartItem[] = [];
  @Input() taxaEntrega: number = 0;
  @Input() restaurantSlug: string = '';
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() removeItem = new EventEmitter<string>();
  @Output() updateQuantity = new EventEmitter<{ itemId: string; quantidade: number }>();
  @Output() clearCart = new EventEmitter<void>();

  constructor(private router: Router) {}

  onHide(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  removerItem(itemId: string): void {
    this.removeItem.emit(itemId);
  }

  aumentarQuantidade(item: CartItem): void {
    if (item.id) {
      this.updateQuantity.emit({
        itemId: item.id,
        quantidade: item.quantidade + 1
      });
    }
  }

  diminuirQuantidade(item: CartItem): void {
    if (item.id && item.quantidade > 1) {
      this.updateQuantity.emit({
        itemId: item.id,
        quantidade: item.quantidade - 1
      });
    }
  }

  limparCarrinho(): void {
    if (confirm('Deseja realmente limpar o carrinho?')) {
      this.clearCart.emit();
    }
  }

  calcularSubtotal(): number {
    return this.items.reduce((total, item) => total + item.precoTotal, 0);
  }

  calcularTotal(): number {
    return this.calcularSubtotal() + this.taxaEntrega;
  }

  finalizarPedido(): void {
    if (this.items.length === 0) {
      alert('Seu carrinho está vazio!');
      return;
    }

    // Navegar para página de checkout
    this.router.navigate(['/p', this.restaurantSlug, 'checkout']);
    this.onHide();
  }

  formatPrice(value: number): string {
    return value.toFixed(2).replace('.', ',');
  }

  getAdicionaisTexto(item: CartItem): string {
    if (!item.adicionaisSelecionados || item.adicionaisSelecionados.length === 0) {
      return '';
    }

    const adicionaisNomes = item.adicionaisSelecionados.map(cartAdicional => {
      const nome = cartAdicional.adicional.nome;
      const qtd = cartAdicional.quantidade;
      return qtd > 1 ? `${qtd}x ${nome}` : nome;
    });

    return adicionaisNomes.join(', ');
  }
}
