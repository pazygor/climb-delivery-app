import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ConfiguracaoLinkPublico, CreateConfiguracaoDto, UpdateConfiguracaoDto } from '../models/configuracao-link-publico.model';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracaoLinkPublicoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.api.baseUrl}/configuracao-link-publico`;

  /**
   * Busca configuração por empresa (cria padrão se não existir)
   */
  getByEmpresaId(empresaId: number): Observable<ConfiguracaoLinkPublico> {
    return this.http.get<ConfiguracaoLinkPublico>(`${this.apiUrl}/empresa/${empresaId}`);
  }

  /**
   * Busca configuração por ID
   */
  getById(id: number): Observable<ConfiguracaoLinkPublico> {
    return this.http.get<ConfiguracaoLinkPublico>(`${this.apiUrl}/${id}`);
  }

  /**
   * Lista todas as configurações (admin)
   */
  getAll(): Observable<ConfiguracaoLinkPublico[]> {
    return this.http.get<ConfiguracaoLinkPublico[]>(this.apiUrl);
  }

  /**
   * Cria nova configuração
   */
  create(empresaId: number, data: Partial<ConfiguracaoLinkPublico>): Observable<ConfiguracaoLinkPublico> {
    return this.http.post<ConfiguracaoLinkPublico>(this.apiUrl, { ...data, empresaId });
  }

  /**
   * Atualiza configuração existente por empresaId
   */
  update(empresaId: number, data: Partial<ConfiguracaoLinkPublico>): Observable<ConfiguracaoLinkPublico> {
    return this.http.put<ConfiguracaoLinkPublico>(`${this.apiUrl}/empresa/${empresaId}`, data);
  }

  /**
   * Remove configuração (volta para padrão)
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Gera URL pública do restaurante
   */
  getPublicUrl(slug: string): string {
    return `${window.location.origin}/p/${slug}`;
  }
}
