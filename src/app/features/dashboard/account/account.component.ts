import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { User, UserRole } from '../../../core/models/user.model';

// PrimeNG Modules
import { InputTextModule } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { FileUpload } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    Password,
    ButtonModule,
    ToastModule,
    FileUpload
  ],
  providers: [MessageService],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss'
})
export class AccountComponent implements OnInit {
  currentUser: User | null = null;
  UserRole = UserRole;
  
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  
  loadingProfile = false;
  loadingPassword = false;
  photoPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadUserData();
  }

  loadUserData(): void {
    if (!this.currentUser?.id) return;

    // Busca os dados atualizados do backend
    this.userService.getById(this.currentUser.id).subscribe({
      next: (user) => {
        // Atualiza o currentUser com os dados do banco
        this.currentUser = {
          ...this.currentUser,
          ...user,
          nome: user.nome,
          name: user.nome,
          email: user.email,
          telefone: user.telefone,
          avatar: user.foto,
          foto: user.foto
        };

        // Atualiza o localStorage com os dados mais recentes
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

        // Reinicializa os forms com os dados atualizados
        this.initForms();
        
        if (this.currentUser?.foto || this.currentUser?.avatar) {
          this.photoPreview = this.currentUser.foto || this.currentUser.avatar || null;
        }
      },
      error: (error) => {
        console.error('Erro ao carregar dados do usuário:', error);
        // Se falhar, usa os dados do localStorage
        this.initForms();
        if (this.currentUser?.avatar || this.currentUser?.foto) {
          this.photoPreview = this.currentUser.avatar || this.currentUser.foto || null;
        }
      }
    });
  }

  initForms(): void {
    // Formulário de perfil
    this.profileForm = this.fb.group({
      nome: [this.currentUser?.nome || '', Validators.required],
      email: [this.currentUser?.email || '', [Validators.required, Validators.email]],
      telefone: [this.currentUser?.telefone || '']
    });

    // Formulário de senha
    this.passwordForm = this.fb.group({
      senhaAtual: ['', Validators.required],
      novaSenha: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const novaSenha = form.get('novaSenha');
    const confirmarSenha = form.get('confirmarSenha');
    
    if (novaSenha && confirmarSenha && novaSenha.value !== confirmarSenha.value) {
      confirmarSenha.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onPhotoSelect(event: any): void {
    const file = event.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto(): void {
    this.photoPreview = null;
  }

  onSubmitProfile(): void {
    if (this.profileForm.invalid || !this.currentUser) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha todos os campos obrigatórios'
      });
      Object.keys(this.profileForm.controls).forEach(key => {
        this.profileForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loadingProfile = true;
    const formData = this.profileForm.value;

    // Se tiver foto nova, adiciona ao payload
    if (this.photoPreview && this.photoPreview !== this.currentUser.avatar) {
      formData.foto = this.photoPreview;
    }

    this.userService.updateProfile(this.currentUser.id, formData).subscribe({
      next: (updatedUser) => {
        // Atualiza o usuário no localStorage
        const currentUserData = this.authService.getCurrentUser();
        if (currentUserData) {
          const updatedUserData = {
            ...currentUserData,
            nome: updatedUser.nome,
            name: updatedUser.nome,
            email: updatedUser.email,
            telefone: updatedUser.telefone,
            avatar: updatedUser.foto
          };
          localStorage.setItem('currentUser', JSON.stringify(updatedUserData));
          this.currentUser = updatedUserData;
        }

        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Perfil atualizado com sucesso!'
        });
        this.loadingProfile = false;
      },
      error: (error) => {
        console.error('Erro ao atualizar perfil:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao atualizar perfil. Tente novamente.'
        });
        this.loadingProfile = false;
      }
    });
  }

  onSubmitPassword(): void {
    if (this.passwordForm.invalid || !this.currentUser) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha todos os campos corretamente'
      });
      Object.keys(this.passwordForm.controls).forEach(key => {
        this.passwordForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loadingPassword = true;
    const { senhaAtual, novaSenha } = this.passwordForm.value;

    this.userService.changePassword(this.currentUser.id, { senhaAtual, novaSenha }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Senha alterada com sucesso!'
        });
        this.passwordForm.reset();
        this.loadingPassword = false;
      },
      error: (error) => {
        console.error('Erro ao alterar senha:', error);
        const errorMessage = error.error?.message || 'Erro ao alterar senha. Verifique sua senha atual.';
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: errorMessage
        });
        this.loadingPassword = false;
      }
    });
  }

  isFieldInvalid(formName: 'profile' | 'password', fieldName: string): boolean {
    const form = formName === 'profile' ? this.profileForm : this.passwordForm;
    const field = form.get(fieldName);
    return !!(field && field.invalid && field.touched);
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

  getFormattedDate(): string {
    if (this.currentUser?.createdAt) {
      return new Date(this.currentUser.createdAt).toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric'
      });
    }
    return 'Novembro 2025';
  }
}
