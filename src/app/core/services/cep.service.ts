import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { EnderecoViaCep } from '../../public/models/checkout.model';

@Injectable({
  providedIn: 'root',
})
export class CepService {
  private readonly VIACEP_URL = 'https://viacep.com.br/ws';

  constructor(private http: HttpClient) {}

  /**
   * Busca endereço por CEP via API ViaCEP
   * @param cep CEP com ou sem formatação
   * @returns Observable com dados do endereço
   */
  buscarCep(cep: string): Observable<EnderecoViaCep | null> {
    // Remove caracteres não numéricos
    const cepLimpo = cep.replace(/\D/g, '');

    // Valida formato (8 dígitos)
    if (cepLimpo.length !== 8) {
      return of(null);
    }

    return this.http.get<EnderecoViaCep>(`${this.VIACEP_URL}/${cepLimpo}/json/`).pipe(
      debounceTime(500),
      distinctUntilChanged(),
      map((endereco) => {
        // ViaCEP retorna { erro: true } quando CEP não existe
        if (endereco.erro) {
          return null;
        }
        return endereco;
      }),
      catchError(() => {
        // Em caso de erro na requisição, retorna null
        return of(null);
      })
    );
  }

  /**
   * Formata CEP para exibição (XXXXX-XXX)
   */
  formatarCep(cep: string): string {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) {
      return cep;
    }
    return `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5)}`;
  }

  /**
   * Valida se CEP tem formato válido
   */
  validarCep(cep: string): boolean {
    const cepLimpo = cep.replace(/\D/g, '');
    return cepLimpo.length === 8;
  }
}
