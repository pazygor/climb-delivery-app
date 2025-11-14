import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { User, UserRole } from '../../../core/models/user.model';

// PrimeNG Modules
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, InputTextModule, PasswordModule, ButtonModule],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss'
})
export class AccountComponent implements OnInit {
  currentUser: User | null = null;
  UserRole = UserRole; // Expor enum para o template

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  getRoleLabel(role: UserRole | undefined): string {
    if (!role) return 'Usuário';
    
    const roleLabels: Record<UserRole, string> = {
      [UserRole.SUPER_ADMIN]: 'Administrador da Plataforma',
      [UserRole.RESTAURANT_OWNER]: 'Proprietário',
      [UserRole.RESTAURANT_MANAGER]: 'Gerente',
      [UserRole.RESTAURANT_EMPLOYEE]: 'Funcionário'
    };
    
    return roleLabels[role] || 'Usuário';
  }
}
