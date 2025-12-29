import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Empresa, CreateEmpresaDto, UpdateEmpresaDto } from '../models/empresa.model';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  private API_URL = environment.api.baseUrl;

  constructor(private http: HttpClient) {}

  /**
   * Cria uma nova empresa
   */
  create(empresa: CreateEmpresaDto): Observable<Empresa> {
    return this.http.post<Empresa>(`${this.API_URL}/empresas`, empresa);
  }

  /**
   * Lista todas as empresas
   */
  getAll(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(`${this.API_URL}/empresas`);
  }

  /**
   * Busca uma empresa por ID
   */
  getById(id: number): Observable<Empresa> {
    return this.http.get<Empresa>(`${this.API_URL}/empresas/${id}`);
  }

  /**
   * Atualiza uma empresa
   */
  update(id: number, empresa: UpdateEmpresaDto): Observable<Empresa> {
    return this.http.patch<Empresa>(`${this.API_URL}/empresas/${id}`, empresa);
  }

  /**
   * Remove uma empresa
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/empresas/${id}`);
  }
}
