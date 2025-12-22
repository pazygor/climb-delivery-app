import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  GrupoAdicional, 
  CreateGrupoAdicionalDto, 
  UpdateGrupoAdicionalDto,
  Adicional,
  CreateAdicionalDto,
  UpdateAdicionalDto
} from '../models/adicional.model';

@Injectable({
  providedIn: 'root'
})
export class AdicionalService {
  private readonly API_URL = 'http://localhost:3000/api'; // TODO: mover para environment

  constructor(private http: HttpClient) {}

  // ============================================
  // GRUPOS DE ADICIONAIS
  // ============================================

  /**
   * Lista todos os grupos de adicionais da empresa
   */
  getAllGrupos(): Observable<GrupoAdicional[]> {
    return this.http.get<GrupoAdicional[]>(`${this.API_URL}/grupos-adicionais`);
  }

  /**
   * Busca grupo por ID com adicionais
   */
  getGrupoById(id: number): Observable<GrupoAdicional> {
    return this.http.get<GrupoAdicional>(`${this.API_URL}/grupos-adicionais/${id}`);
  }

  /**
   * Cria novo grupo de adicionais
   */
  createGrupo(data: CreateGrupoAdicionalDto): Observable<GrupoAdicional> {
    return this.http.post<GrupoAdicional>(`${this.API_URL}/grupos-adicionais`, data);
  }

  /**
   * Atualiza grupo existente
   */
  updateGrupo(id: number, data: UpdateGrupoAdicionalDto): Observable<GrupoAdicional> {
    return this.http.put<GrupoAdicional>(`${this.API_URL}/grupos-adicionais/${id}`, data);
  }

  /**
   * Exclui grupo de adicionais
   */
  deleteGrupo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/grupos-adicionais/${id}`);
  }

  /**
   * Duplica grupo com todos os adicionais
   */
  duplicateGrupo(id: number): Observable<GrupoAdicional> {
    return this.http.post<GrupoAdicional>(`${this.API_URL}/grupos-adicionais/${id}/duplicate`, {});
  }

  /**
   * Verifica se grupo está vinculado a produtos
   */
  checkVinculosProdutos(id: number): Observable<{ vinculado: boolean; produtos: any[] }> {
    return this.http.get<{ vinculado: boolean; produtos: any[] }>(`${this.API_URL}/grupos-adicionais/${id}/vinculos`);
  }

  // ============================================
  // ADICIONAIS (ITENS DO GRUPO)
  // ============================================

  /**
   * Lista adicionais de um grupo
   */
  getAdicionaisByGrupo(grupoId: number): Observable<Adicional[]> {
    return this.http.get<Adicional[]>(`${this.API_URL}/grupos-adicionais/${grupoId}/adicionais`);
  }

  /**
   * Cria novo adicional em um grupo
   */
  createAdicional(data: CreateAdicionalDto): Observable<Adicional> {
    return this.http.post<Adicional>(`${this.API_URL}/adicionais`, data);
  }

  /**
   * Atualiza adicional existente
   */
  updateAdicional(id: number, data: UpdateAdicionalDto): Observable<Adicional> {
    return this.http.put<Adicional>(`${this.API_URL}/adicionais/${id}`, data);
  }

  /**
   * Exclui adicional
   */
  deleteAdicional(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/adicionais/${id}`);
  }

  /**
   * Duplica adicional
   */
  duplicateAdicional(id: number): Observable<Adicional> {
    return this.http.post<Adicional>(`${this.API_URL}/adicionais/${id}/duplicate`, {});
  }

  /**
   * Reordena adicionais dentro de um grupo
   */
  reorderAdicionais(grupoId: number, ids: number[]): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/grupos-adicionais/${grupoId}/adicionais/reorder`, { ids });
  }
}
