import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PublicOrderRequest, PublicOrderResponse } from '../models/public-order.model';

@Injectable({
  providedIn: 'root'
})
export class PublicOrderService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/public`;

  createPedido(slug: string, orderData: PublicOrderRequest): Observable<PublicOrderResponse> {
    // TODO: Implementar na Sprint 8
    return this.http.post<PublicOrderResponse>(`${this.apiUrl}/${slug}/pedidos`, orderData);
  }

  getPedido(slug: string, pedidoId: number): Observable<PublicOrderResponse> {
    // TODO: Implementar na Sprint 8
    return this.http.get<PublicOrderResponse>(`${this.apiUrl}/${slug}/pedidos/${pedidoId}`);
  }
}
