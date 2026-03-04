import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// PrimeNG
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

// Models
import { CartItem } from '../../models/cart.model';

// Utils
import { CurrencyUtil } from '../../../core/utils/currency.util';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [
    CommonModule,
    SidebarModule,
    ButtonModule,
    BadgeModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  templateUrl: './cart-drawer.component.html',
  styleUrl: './cart-drawer.component.scss',
  encapsulation: ViewEncapsulation.None
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

  constructor(
    private router: Router,
    private confirmationService: ConfirmationService
  ) {}

  onHide(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  removerItem(itemId: string): void {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja remover esse item?',
      header: 'Confirmar Remoção',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.removeItem.emit(itemId);
      }
    });
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
    this.confirmationService.confirm({
      message: 'Deseja realmente limpar o carrinho?',
      header: 'Limpar Carrinho',
      icon: 'pi pi-trash',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.clearCart.emit();
      }
    });
  }

  calcularSubtotal(): number {
    const valores = this.items.map(item => CurrencyUtil.toNumber(item.precoTotal));
    return CurrencyUtil.add(...valores);
  }

  calcularTotal(): number {
    const subtotal = this.calcularSubtotal();
    const taxa = CurrencyUtil.toNumber(this.taxaEntrega);
    return CurrencyUtil.add(subtotal, taxa);
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

  formatPrice(value: number | string | undefined | null): string {
    const numValue = Number(value) || 0;
    return numValue.toFixed(2).replace('.', ',');
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
