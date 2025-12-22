import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Categoria, 
  CreateCategoriaDto, 
  UpdateCategoriaDto 
} from '../models/categoria.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private readonly API_URL = environment.api.baseUrl;

  constructor(private http: HttpClient) {}

  /**
   * Lista todas as categorias da empresa
   * Ordenadas por 'ordem' ASC
   */
  getAll(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.API_URL}/categorias`);
  }

  /**
   * Lista categorias por empresa
   */
  getByEmpresa(empresaId: number): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.API_URL}/categorias/empresa/${empresaId}`);
  }

  /**
   * Busca categoria por ID com produtos
   */
  getById(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.API_URL}/categorias/${id}`);
  }

  /**
   * Cria nova categoria
   */
  create(data: CreateCategoriaDto): Observable<Categoria> {
    return this.http.post<Categoria>(`${this.API_URL}/categorias`, data);
  }

  /**
   * Atualiza categoria existente
   */
  update(id: number, data: UpdateCategoriaDto): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.API_URL}/categorias/${id}`, data);
  }

  /**
   * Exclui categoria
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/categorias/${id}`);
  }

  /**
   * Duplica categoria com todos os produtos
   */
  duplicate(id: number): Observable<Categoria> {
    return this.http.post<Categoria>(`${this.API_URL}/categorias/${id}/duplicate`, {});
  }

  /**
   * Reordena categorias
   */
  reorder(ids: number[]): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/categorias/reorder`, { ids });
  }

  /**
   * Esgota todos os produtos de uma categoria
   */
  esgotarTodos(id: number, esgotado: boolean): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/categorias/${id}/esgotar-todos`, { esgotado });
  }
}
