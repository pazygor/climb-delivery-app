import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

export interface UpdateUserProfileDto {
  nome?: string;
  email?: string;
  telefone?: string;
  foto?: string;
}

export interface ChangePasswordDto {
  senhaAtual: string;
  novaSenha: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private API_URL = environment.api.baseUrl;

  constructor(private http: HttpClient) {}

  /**
   * Busca um usuário por ID
   */
  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/users/${id}`);
  }

  /**
   * Atualiza o perfil do usuário
   */
  updateProfile(id: number, data: UpdateUserProfileDto): Observable<User> {
    return this.http.patch<User>(`${this.API_URL}/users/${id}`, data);
  }

  /**
   * Altera a senha do usuário
   */
  changePassword(id: number, data: ChangePasswordDto): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/users/${id}/change-password`, data);
  }

  /**
   * Upload de foto do usuário
   */
  uploadPhoto(id: number, photo: string): Observable<User> {
    return this.http.patch<User>(`${this.API_URL}/users/${id}`, { foto: photo });
  }
}
