import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Produto, 
  CreateProdutoDto, 
  UpdateProdutoDto 
} from '../models/produto.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {
  private readonly API_URL = environment.api.baseUrl;

  constructor(private http: HttpClient) {}

  /**
   * Lista todos os produtos da empresa
   * Ordenados por categoria e ordem
   */
  getAll(): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${this.API_URL}/produtos`);
  }

  /**
   * Lista produtos por empresa
   */
  getByEmpresa(empresaId: number): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${this.API_URL}/produtos/empresa/${empresaId}`);
  }

  /**
   * Lista produtos por categoria
   */
  getByCategoria(categoriaId: number): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${this.API_URL}/categorias/${categoriaId}/produtos`);
  }

  /**
   * Busca produto por ID com grupos de adicionais
   */
  getById(id: number): Observable<Produto> {
    return this.http.get<Produto>(`${this.API_URL}/produtos/${id}`);
  }

  /**
   * Cria novo produto
   */
  create(data: CreateProdutoDto): Observable<Produto> {
    return this.http.post<Produto>(`${this.API_URL}/produtos`, data);
  }

  /**
   * Atualiza produto existente
   */
  update(id: number, data: UpdateProdutoDto): Observable<Produto> {
    return this.http.patch<Produto>(`${this.API_URL}/produtos/${id}`, data);
  }

  /**
   * Exclui produto
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/produtos/${id}`);
  }

  /**
   * Duplica produto
   */
  duplicate(id: number): Observable<Produto> {
    return this.http.post<Produto>(`${this.API_URL}/produtos/${id}/duplicate`, {});
  }

  /**
   * Marca/desmarca produto como esgotado
   */
  toggleDisponibilidade(id: number, disponivel: boolean): Observable<Produto> {
    return this.http.patch<Produto>(`${this.API_URL}/produtos/${id}/disponibilidade`, { disponivel });
  }

  /**
   * Upload de imagem do produto
   */
  uploadImagem(id: number, file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('imagem', file);
    return this.http.post<{ url: string }>(`${this.API_URL}/produtos/${id}/imagem`, formData);
  }

  /**
   * Vincula grupos de adicionais ao produto
   */
  vincularGruposAdicionais(id: number, gruposIds: number[]): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/produtos/${id}/grupos-adicionais`, { gruposIds });
  }

  /**
   * Reordena produtos dentro de uma categoria
   */
  reorder(categoriaId: number, ids: number[]): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/categorias/${categoriaId}/produtos/reorder`, { ids });
  }

  /**
   * Move produto para outra categoria
   */
  moverCategoria(id: number, novaCategoriaId: number): Observable<Produto> {
    return this.http.patch<Produto>(`${this.API_URL}/produtos/${id}/mover`, { categoriaId: novaCategoriaId });
  }
}
