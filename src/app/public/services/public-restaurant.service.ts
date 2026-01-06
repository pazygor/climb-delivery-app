import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CardapioResponse, PublicRestaurant } from '../models/public-restaurant.model';

@Injectable({
  providedIn: 'root'
})
export class PublicRestaurantService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/public`;
  
  private restaurantSubject = new BehaviorSubject<PublicRestaurant | null>(null);
  public restaurant$ = this.restaurantSubject.asObservable();

  getRestaurante(slug: string): Observable<PublicRestaurant> {
    return this.http.get<PublicRestaurant>(`${this.apiUrl}/${slug}`).pipe(
      tap(restaurant => this.restaurantSubject.next(restaurant))
    );
  }

  getCardapio(slug: string): Observable<CardapioResponse> {
    // TODO: Implementar na Sprint 6
    return this.http.get<CardapioResponse>(`${this.apiUrl}/${slug}/cardapio`);
  }

  isRestauranteAberto(restaurant: PublicRestaurant): boolean {
    // TODO: implementar lógica de horário na Sprint 6
    return restaurant.ativo;
  }
}
