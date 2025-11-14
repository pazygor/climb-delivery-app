import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

/**
 * Guard para proteger rotas administrativas
 * Permite acesso apenas para usuários com role SUPER_ADMIN
 */
export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.getCurrentUser();

  // Verifica se o usuário está autenticado e tem permissão de SUPER_ADMIN
  if (currentUser && currentUser.role === UserRole.SUPER_ADMIN) {
    return true;
  }

  // Redireciona para dashboard se não for super admin
  console.warn('Acesso negado: usuário não tem permissão de administrador');
  router.navigate(['/dashboard']);
  return false;
};
