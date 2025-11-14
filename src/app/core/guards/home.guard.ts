import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

/**
 * Guard para redirecionar usuários autenticados para a área correta
 * baseado em seu role
 */
export const homeGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.getCurrentUser();

  // Se não está autenticado, redireciona para login
  if (!currentUser) {
    router.navigate(['/login']);
    return false;
  }

  // Redireciona baseado no role
  if (currentUser.role === UserRole.SUPER_ADMIN) {
    router.navigate(['/admin/dashboard']);
  } else {
    router.navigate(['/dashboard/orders']);
  }

  return false;
};
