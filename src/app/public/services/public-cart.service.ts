import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Cart, CartItem } from '../models/cart.model';
import { PublicProduto } from '../models/public-restaurant.model';
import { CurrencyUtil } from '../../core/utils/currency.util';

interface CartItemInput {
  produto: PublicProduto;
  quantidade: number;
  adicionaisSelecionados: {
    grupoId: number;
    grupoNome: string;
    adicionais: Array<{
      id: number;
      nome: string;
      preco: number;
    }>;
  }[];
  observacao: string;
  precoTotal: number;
}

@Injectable({
  providedIn: 'root'
})
export class PublicCartService {
  private cartSubject = new BehaviorSubject<Cart>(this.getInitialCart());
  public cart$ = this.cartSubject.asObservable();
  
  private drawerOpenSubject = new BehaviorSubject<boolean>(false);
  public drawerOpen$ = this.drawerOpenSubject.asObservable();

  private readonly STORAGE_KEY = 'climb_delivery_cart';
  private restaurantSlug: string = '';
  private taxaEntrega: number = 0;

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

  /**
   * Inicializa o carrinho para um restaurante específico
   */
  initCart(slug: string, taxaEntrega: number): void {
    // Se mudou de restaurante, limpa o carrinho
    if (this.restaurantSlug && this.restaurantSlug !== slug) {
      this.clearCart();
    }
    
    this.restaurantSlug = slug;
    this.taxaEntrega = taxaEntrega;
    this.recalcularTotais();
  }

  /**
   * Adiciona item ao carrinho
   */
  addItem(item: CartItemInput): void {
    const cart = this.cartSubject.value;
    
    // Converte adicionais para o formato do modelo
    const adicionaisConvertidos = item.adicionaisSelecionados.flatMap(grupo =>
      grupo.adicionais.map(adicional => ({
        adicional: {
          id: adicional.id,
          nome: adicional.nome,
          preco: CurrencyUtil.toNumber(adicional.preco),
          grupoAdicionalId: grupo.grupoId,
          ordem: 0,
          ativo: true
        },
        quantidade: 1
      }))
    );

    // Gera ID único para o item
    const itemId = this.generateItemId();
    const newItem: CartItem = {
      id: itemId,
      produto: item.produto,
      quantidade: item.quantidade,
      observacoes: item.observacao,
      adicionaisSelecionados: adicionaisConvertidos,
      precoTotal: CurrencyUtil.toNumber(item.precoTotal)
    };

    cart.items.push(newItem);
    this.updateCart(cart);
  }

  /**
   * Remove item do carrinho
   */
  removeItem(itemId: string): void {
    const cart = this.cartSubject.value;
    cart.items = cart.items.filter(item => item.id !== itemId);
    this.updateCart(cart);
  }

  /**
   * Atualiza quantidade de um item
   */
  updateItemQuantity(itemId: string, quantidade: number): void {
    if (quantidade < 1) return;

    const cart = this.cartSubject.value;
    const item = cart.items.find(item => item.id === itemId);
    
    if (item) {
      item.quantidade = quantidade;
      // Recalcula o preço total do item usando CurrencyUtil
      const precoBase = CurrencyUtil.toNumber(item.produto.preco);
      const precoAdicionais = this.calcularPrecoAdicionais(item);
      const precoUnitario = CurrencyUtil.add(precoBase, precoAdicionais);
      item.precoTotal = CurrencyUtil.multiply(precoUnitario, quantidade);
      
      this.updateCart(cart);
    }
  }

  /**
   * Limpa o carrinho
   */
  clearCart(): void {
    this.updateCart(this.getInitialCart());
  }

  /**
   * Abre o drawer do carrinho
   */
  openDrawer(): void {
    this.drawerOpenSubject.next(true);
  }

  /**
   * Fecha o drawer do carrinho
   */
  closeDrawer(): void {
    this.drawerOpenSubject.next(false);
  }

  /**
   * Retorna o carrinho atual
   */
  getCart(): Cart {
    return this.cartSubject.value;
  }

  /**
   * Retorna quantidade total de itens
   */
  getItemCount(): number {
    return this.cartSubject.value.quantidadeItens;
  }

  /**
   * Atualiza o carrinho e recalcula totais
   */
  private updateCart(cart: Cart): void {
    this.recalcularTotais(cart);
    this.cartSubject.next(cart);
    this.saveCartToStorage(cart);
  }

  /**
   * Recalcula os totais do carrinho
   */
  private recalcularTotais(cart?: Cart): void {
    const currentCart = cart || this.cartSubject.value;
    
    // Garante que todos os valores sejam números
    currentCart.items = currentCart.items.map(item => ({
      ...item,
      quantidade: CurrencyUtil.toNumber(item.quantidade),
      precoTotal: CurrencyUtil.toNumber(item.precoTotal),
      produto: {
        ...item.produto,
        preco: CurrencyUtil.toNumber(item.produto.preco)
      },
      adicionaisSelecionados: item.adicionaisSelecionados.map(adicional => ({
        ...adicional,
        quantidade: CurrencyUtil.toNumber(adicional.quantidade),
        adicional: {
          ...adicional.adicional,
          preco: CurrencyUtil.toNumber(adicional.adicional.preco)
        }
      }))
    }));
    
    // Calcula subtotal usando CurrencyUtil para precisão
    const subtotalValues = currentCart.items.map(item => CurrencyUtil.toNumber(item.precoTotal));
    currentCart.subtotal = CurrencyUtil.add(...subtotalValues);

    // Calcula quantidade total de itens
    currentCart.quantidadeItens = currentCart.items.reduce((total, item) => {
      return total + CurrencyUtil.toNumber(item.quantidade);
    }, 0);

    // Define taxa de entrega (somente se houver itens)
    currentCart.taxaEntrega = currentCart.quantidadeItens > 0 ? CurrencyUtil.toNumber(this.taxaEntrega) : 0;

    // Calcula total usando CurrencyUtil para evitar concatenação de strings
    currentCart.total = CurrencyUtil.add(currentCart.subtotal, currentCart.taxaEntrega);
  }

  /**
   * Calcula preço dos adicionais de um item
   */
  private calcularPrecoAdicionais(item: CartItem): number {
    const precos = item.adicionaisSelecionados.map(cartAdicional => {
      const preco = CurrencyUtil.toNumber(cartAdicional.adicional.preco);
      return CurrencyUtil.multiply(preco, cartAdicional.quantidade);
    });
    return CurrencyUtil.add(...precos);
  }

  /**
   * Gera ID único para item do carrinho
   */
  private generateItemId(): string {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Salva carrinho no localStorage
   */
  private saveCartToStorage(cart: Cart): void {
    try {
      const cartData = {
        slug: this.restaurantSlug,
        cart: cart
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cartData));
    } catch (error) {
      console.error('Erro ao salvar carrinho no localStorage:', error);
    }
  }

  /**
   * Carrega carrinho do localStorage
   */
  private loadCartFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const cartData = JSON.parse(stored);
        this.restaurantSlug = cartData.slug || '';
        
        if (cartData.cart) {
          // Recalcula totais para garantir valores numéricos corretos
          this.recalcularTotais(cartData.cart);
          this.cartSubject.next(cartData.cart);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar carrinho do localStorage:', error);
    }
  }
}
