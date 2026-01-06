import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string; // cidade
  uf: string;
  erro?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CepService {
  private http = inject(HttpClient);
  private viaCepUrl = 'https://viacep.com.br/ws';

  buscarEnderecoPorCep(cep: string): Observable<ViaCepResponse> {
    // TODO: Implementar na Sprint 8
    const cepLimpo = cep.replace(/\D/g, '');
    return this.http.get<ViaCepResponse>(`${this.viaCepUrl}/${cepLimpo}/json/`);
  }
}
