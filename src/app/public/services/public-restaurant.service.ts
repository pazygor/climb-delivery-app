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

    const abertura = restaurant.horarioAbertura;
    const fechamento = restaurant.horarioFechamento;

    // Verifica se o horário cruza a meia-noite (ex: 18:00 - 02:00)
    const cruzaMeiaNoite = fechamento < abertura;

    let isWithinHours: boolean;
    
    if (cruzaMeiaNoite) {
      // Se cruza meia-noite, está aberto se:
      // currentTime >= abertura (ex: 22:00 >= 18:00) OU
      // currentTime <= fechamento (ex: 01:00 <= 02:00)
      isWithinHours = currentTime >= abertura || currentTime <= fechamento;
    } else {
      // Horário normal (não cruza meia-noite)
      isWithinHours = currentTime >= abertura && currentTime <= fechamento;
    }

    return restaurant.ativo && isWithinHours;
  }
}
