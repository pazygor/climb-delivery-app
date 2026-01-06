import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Cart, CartItem, CartAdicional } from '../models/cart.model';
import { PublicProduto } from '../models/public-restaurant.model';

@Injectable({
  providedIn: 'root'
})
export class PublicCartService {
  private cartSubject = new BehaviorSubject<Cart>(this.getInitialCart());
  public cart$ = this.cartSubject.asObservable();
  
  private drawerOpenSubject = new BehaviorSubject<boolean>(false);
  public drawerOpen$ = this.drawerOpenSubject.asObservable();

  private readonly STORAGE_KEY = 'climb_delivery_cart';

  constructor() {
    this.loadCartFromStorage();
  }

  private getInitialCart(): Cart {
    return {
      items: [],
      subtotal: 0,
      taxaEntrega: 0,
      total: 0,
      quantidadeItens: 0
    };
  }

  addItem(
    produto: PublicProduto,
    quantidade: number,
    adicionais: CartAdicional[],
    observacoes?: string
  ): void {
    // TODO: Implementar na Sprint 7
    console.log('addItem - a ser implementado na Sprint 7');
  }

  removeItem(itemId: string): void {
    // TODO: Implementar na Sprint 7
    console.log('removeItem - a ser implementado na Sprint 7');
  }

  updateItemQuantity(itemId: string, quantidade: number): void {
    // TODO: Implementar na Sprint 7
    console.log('updateItemQuantity - a ser implementado na Sprint 7');
  }

  setTaxaEntrega(taxa: number): void {
    const cart = this.cartSubject.value;
    cart.taxaEntrega = taxa;
    this.updateCart(cart);
  }

  clearCart(): void {
    this.updateCart(this.getInitialCart());
    this.saveCartToStorage();
  }

  openDrawer(): void {
    this.drawerOpenSubject.next(true);
  }

  closeDrawer(): void {
    this.drawerOpenSubject.next(false);
  }

  toggleDrawer(): void {
    this.drawerOpenSubject.next(!this.drawerOpenSubject.value);
  }

  private updateCart(cart: Cart): void {
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.precoTotal, 0);
    cart.total = cart.subtotal + cart.taxaEntrega;
    cart.quantidadeItens = cart.items.reduce((sum, item) => sum + item.quantidade, 0);
    
    this.cartSubject.next(cart);
    this.saveCartToStorage();
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveCartToStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.cartSubject.value));
  }

  private loadCartFromStorage(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const cart = JSON.parse(saved);
        this.cartSubject.next(cart);
      } catch (e) {
        console.error('Erro ao carregar carrinho do storage', e);
      }
    }
  }
}
