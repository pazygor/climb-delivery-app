import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User, LoginRequest, LoginResponse, AuthState, UserRole } from '../models/user.model';

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

  constructor(private router: Router) {
    this.loadAuthStateFromStorage();
  }

  /**
   * Mock de login - simula autenticação
   * Em produção, substituir por chamada HTTP ao backend NestJS
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    // Mock de validação - Super Admin (equipe do SaaS)
    if (credentials.email === 'admin@climbdelivery.com' && credentials.password === 'admin123') {
      const mockUser: User = {
        id: '1',
        name: 'Admin ClimbDelivery',
        email: credentials.email,
        role: UserRole.SUPER_ADMIN, // Acesso à área administrativa
        avatar: 'https://i.pravatar.cc/150?img=1'
      };

      const mockToken = 'mock-jwt-token-superadmin-' + Date.now();
      
      const response: LoginResponse = {
        user: mockUser,
        token: mockToken
      };

      // Simula delay de rede
      return of(response).pipe(
        delay(500),
        map(res => {
          this.setAuthState(res.user, res.token);
          // Redireciona para área administrativa
          this.router.navigate(['/admin']);
          return res;
        })
      );
    }

    // Mock de validação - Restaurante
    if (credentials.email === 'restaurante@climbdelivery.com' && credentials.password === 'rest123') {
      const mockUser: User = {
        id: '2',
        name: 'Restaurante Demo',
        email: credentials.email,
        role: UserRole.RESTAURANT_OWNER,
        establishmentId: 'est-001',
        avatar: 'https://i.pravatar.cc/150?img=2'
      };

      const mockToken = 'mock-jwt-token-restaurant-' + Date.now();
      
      const response: LoginResponse = {
        user: mockUser,
        token: mockToken
      };

      // Simula delay de rede
      return of(response).pipe(
        delay(500),
        map(res => {
          this.setAuthState(res.user, res.token);
          // Redireciona para dashboard do restaurante
          this.router.navigate(['/dashboard']);
          return res;
        })
      );
    }

    // Credenciais inválidas
    return throwError(() => new Error('Credenciais inválidas')).pipe(delay(500));
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
