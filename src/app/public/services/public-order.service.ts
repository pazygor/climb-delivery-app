import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CreatePedidoDto, Pedido } from '../models/checkout.model';

@Injectable({
  providedIn: 'root'
})
export class PublicOrderService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.api.baseUrl}/public`;
  
  private currentOrderSubject = new BehaviorSubject<Pedido | null>(null);
  currentOrder$ = this.currentOrderSubject.asObservable();

  constructor() {
    // Carregar pedido do localStorage se existir
    this.loadOrderFromStorage();
  }

  /**
   * Cria novo pedido
   */
  createPedido(slug: string, orderData: CreatePedidoDto): Observable<Pedido> {
    return this.http.post<Pedido>(`${this.apiUrl}/${slug}/pedidos`, orderData).pipe(
      tap((pedido) => {
        // Salvar pedido confirmado
        this.currentOrderSubject.next(pedido);
        this.saveOrderToStorage(pedido);
      })
    );
  }

  /**
   * Busca pedido por número
   */
  getPedido(numero: string): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiUrl}/pedido/${numero}`).pipe(
      tap((pedido) => {
        this.currentOrderSubject.next(pedido);
      })
    );
  }

  /**
   * Limpa pedido atual
   */
  clearOrder(): void {
    this.currentOrderSubject.next(null);
    localStorage.removeItem('currentOrder');
  }

  /**
   * Salva pedido no localStorage
   */
  private saveOrderToStorage(pedido: Pedido): void {
    try {
      localStorage.setItem('currentOrder', JSON.stringify(pedido));
    } catch (error) {
      console.error('Erro ao salvar pedido:', error);
    }
  }

  /**
   * Carrega pedido do localStorage
   */
  private loadOrderFromStorage(): void {
    try {
      const savedOrder = localStorage.getItem('currentOrder');
      if (savedOrder) {
        const pedido = JSON.parse(savedOrder) as Pedido;
        this.currentOrderSubject.next(pedido);
      }
    } catch (error) {
      console.error('Erro ao carregar pedido:', error);
      localStorage.removeItem('currentOrder');
    }
  }

  /**
   * Obtém pedido atual (síncrono)
   */
  getCurrentOrder(): Pedido | null {
    return this.currentOrderSubject.value;
  }
}
