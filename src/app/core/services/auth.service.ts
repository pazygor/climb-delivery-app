import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User, LoginRequest, LoginResponse, AuthState, UserRole } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authStateSubject = new BehaviorSubject<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false
  });

  public authState$: Observable<AuthState> = this.authStateSubject.asObservable();
  private apiUrl = environment.api.baseUrl;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.loadAuthStateFromStorage();
  }

  /**
   * Login real com backend NestJS
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<{ access_token: string, user?: any }>(`${this.apiUrl}/auth/login`, {
      email: credentials.email,
      senha: credentials.password
    }).pipe(
      map(response => {
        // Decodifica o JWT para extrair informações do usuário
        const decodedToken = this.decodeToken(response.access_token);
        
        // Mapeia permissão do backend para role do frontend
        const role = this.mapPermissaoToRole(decodedToken.permissaoId);
        
        const user: User = {
          id: decodedToken.sub.toString(),
          name: decodedToken.nome,
          email: decodedToken.email,
          role: role,
          establishmentId: decodedToken.empresaId?.toString()
        };

        const loginResponse: LoginResponse = {
          user: user,
          token: response.access_token
        };

        this.setAuthState(user, response.access_token);
        
        // Redireciona baseado na permissão
        if (role === UserRole.SUPER_ADMIN) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/dashboard']);
        }

        return loginResponse;
      }),
      catchError(error => {
        console.error('Erro no login:', error);
        return throwError(() => new Error(error.error?.message || 'Credenciais inválidas'));
      })
    );
  }

  /**
   * Logout do usuário
   */
  logout(): void {
    this.clearAuthState();
    this.router.navigate(['/login']);
  }

  /**
   * Mock de recuperação de senha
   */
  forgotPassword(email: string): Observable<{ message: string }> {
    // Simula chamada ao backend
    return of({ message: 'Link de recuperação enviado para o email' }).pipe(delay(500));
  }

  /**
   * Mock de redefinição de senha
   */
  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    // Simula chamada ao backend
    return of({ message: 'Senha redefinida com sucesso' }).pipe(delay(500));
  }

  /**
   * Decodifica o JWT token (sem validação - apenas extração)
   */
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      return null;
    }
  }

  /**
   * Mapeia a permissão do backend para o role do frontend
   */
  private mapPermissaoToRole(permissaoId: number): UserRole {
    // 1 = admin_global
    // 2 = admin_restaurante
    // 3 = funcionario_restaurante
    switch (permissaoId) {
      case 1:
        return UserRole.SUPER_ADMIN;
      case 2:
        return UserRole.RESTAURANT_OWNER;
      case 3:
        return UserRole.RESTAURANT_EMPLOYEE;
      default:
        return UserRole.RESTAURANT_EMPLOYEE;
    }
  }

  /**
   * Verifica se usuário está autenticado
   */
  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  /**
   * Retorna o usuário atual
   */
  getCurrentUser(): User | null {
    return this.authStateSubject.value.user;
  }

  /**
   * Retorna o token atual
   */
  getToken(): string | null {
    return this.authStateSubject.value.token;
  }

  /**
   * Define o estado de autenticação
   */
  private setAuthState(user: User, token: string): void {
    const authState: AuthState = {
      user,
      token,
      isAuthenticated: true
    };

    this.authStateSubject.next(authState);
    this.saveAuthStateToStorage(authState);
  }

  /**
   * Limpa o estado de autenticação
   */
  private clearAuthState(): void {
    this.authStateSubject.next({
      user: null,
      token: null,
      isAuthenticated: false
    });
    localStorage.removeItem('authState');
  }

  /**
   * Salva o estado de autenticação no localStorage
   */
  private saveAuthStateToStorage(authState: AuthState): void {
    localStorage.setItem('authState', JSON.stringify(authState));
  }

  /**
   * Carrega o estado de autenticação do localStorage
   */
  private loadAuthStateFromStorage(): void {
    const storedState = localStorage.getItem('authState');
    if (storedState) {
      try {
        const authState: AuthState = JSON.parse(storedState);
        this.authStateSubject.next(authState);
      } catch (error) {
        console.error('Erro ao carregar estado de autenticação:', error);
        this.clearAuthState();
      }
    }
  }
}
