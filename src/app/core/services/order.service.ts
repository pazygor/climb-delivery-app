import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, CreateOrderDto, UpdateOrderDto } from '../models/order.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.api.baseUrl}/pedido`;

  constructor(private http: HttpClient) { }

  /**
   * Retorna todos os pedidos
   * @param status Filtro opcional por status
   */
  getOrders(status?: string): Observable<Order[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<Order[]>(this.apiUrl, { params });
  }

  /**
   * Retorna pedidos de uma empresa específica
   * @param empresaId ID da empresa
   * @param status Filtro opcional por status
   */
  getOrdersByEmpresa(empresaId: number, status?: string): Observable<Order[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<Order[]>(`${this.apiUrl}/empresa/${empresaId}`, { params });
  }

  /**
   * Retorna pedidos de um usuário específico
   * @param usuarioId ID do usuário
   */
  getOrdersByUsuario(usuarioId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/usuario/${usuarioId}`);
  }

  /**
   * Retorna um pedido específico pelo ID
   * @param id ID do pedido
   */
  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  /**
   * Cria um novo pedido
   * @param createOrderDto Dados do pedido
   */
  createOrder(createOrderDto: CreateOrderDto): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, createOrderDto);
  }

  /**
   * Atualiza o status de um pedido
   * @param id ID do pedido
   * @param status Novo status
   * @param motivoCancelamento Motivo do cancelamento (opcional)
   */
  updateOrderStatus(id: number, status: string, motivoCancelamento?: string): Observable<Order> {
    const updateDto: UpdateOrderDto = { 
      status,
      ...(motivoCancelamento && { motivoCancelamento })
    };
    return this.http.patch<Order>(`${this.apiUrl}/${id}/status`, updateDto);
  }

  /**
   * Atualiza um pedido
   * @param id ID do pedido
   * @param updateOrderDto Dados para atualizar
   */
  updateOrder(id: number, updateOrderDto: UpdateOrderDto): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}`, updateOrderDto);
  }

  /**
   * Remove um pedido
   * @param id ID do pedido
   */
  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Formata valor em moeda brasileira
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
}
