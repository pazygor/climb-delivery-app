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
  private apiUrl = `${environment.api.baseUrl}/public`;
  
  private restaurantSubject = new BehaviorSubject<PublicRestaurant | null>(null);
  public restaurant$ = this.restaurantSubject.asObservable();

  getRestaurante(slug: string): Observable<PublicRestaurant> {
    return this.http.get<PublicRestaurant>(`${this.apiUrl}/${slug}`).pipe(
      tap(restaurant => this.restaurantSubject.next(restaurant))
    );
  }

  getCardapio(slug: string): Observable<CardapioResponse> {
    return this.http.get<CardapioResponse>(`${this.apiUrl}/${slug}/cardapio`);
  }

  isRestauranteAberto(restaurant: PublicRestaurant): boolean {
    if (!restaurant || !restaurant.ativo) {
      return false;
    }

    const now = new Date();
    const currentDay = now.getDay(); // 0 = Domingo, 6 = Sábado
    const currentTime = now.toTimeString().substring(0, 5); // "HH:MM"

    // Se não tem horários definidos, considera aberto
    if (!restaurant.horarioAbertura || !restaurant.horarioFechamento) {
      return restaurant.ativo;
    }

    // Verifica se está dentro do horário
    const isWithinHours = currentTime >= restaurant.horarioAbertura && 
                          currentTime <= restaurant.horarioFechamento;

    return restaurant.ativo && isWithinHours;
  }
}
