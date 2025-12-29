import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { InputTextarea } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { EmpresaService } from '../../../core/services/empresa.service';
import { AuthService } from '../../../core/services/auth.service';
import { Empresa, UpdateEmpresaDto } from '../../../core/models/empresa.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    InputTextarea,
    InputNumberModule,
    FileUploadModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  empresaForm!: FormGroup;
  loading = false;
  empresaId: number | null = null;
  logoPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private empresaService: EmpresaService,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadEmpresa();
  }

  initForm(): void {
    this.empresaForm = this.fb.group({
      // Informações Básicas
      razaoSocial: ['', Validators.required],
      nomeFantasia: [''],
      cnpj: ['', [Validators.required, Validators.minLength(14), Validators.maxLength(14)]],
      telefone: [''],
      email: ['', [Validators.email]],
      
      // Endereço
      cep: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]],
      endereco: ['', Validators.required],
      numero: [''],
      complemento: [''],
      bairro: ['', Validators.required],
      cidade: ['', Validators.required],
      uf: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
      
      // Configurações de Funcionamento
      horarioAbertura: [''],
      horarioFechamento: [''],
      tempoMedioEntrega: [null],
      taxaEntrega: [0],
      pedidoMinimo: [0],
      
      // Informações Adicionais
      descricao: [''],
      chavePix: [''],
      whatsapp: [''],
      instagram: [''],
      facebook: [''],
      
      // Logo
      logo: ['']
    });
  }

  loadEmpresa(): void {
    this.empresaId = this.authService.getEmpresaId();
    
    if (!this.empresaId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Empresa não identificada'
      });
      return;
    }

    this.loading = true;
    this.empresaService.getById(this.empresaId).subscribe({
      next: (empresa: Empresa) => {
        this.empresaForm.patchValue(empresa);
        if (empresa.logo) {
          this.logoPreview = empresa.logo;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar empresa:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar dados da empresa'
        });
        this.loading = false;
      }
    });
  }

  onLogoSelect(event: any): void {
    const file = event.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoPreview = e.target.result;
        this.empresaForm.patchValue({ logo: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }

  removeLogo(): void {
    this.logoPreview = null;
    this.empresaForm.patchValue({ logo: null });
  }

  onSubmit(): void {
    if (this.empresaForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha todos os campos obrigatórios'
      });
      Object.keys(this.empresaForm.controls).forEach(key => {
        this.empresaForm.get(key)?.markAsTouched();
      });
      return;
    }

    if (!this.empresaId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Empresa não identificada'
      });
      return;
    }

    this.loading = true;
    const formData: UpdateEmpresaDto = this.empresaForm.value;

    this.empresaService.update(this.empresaId, formData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Configurações atualizadas com sucesso!'
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao atualizar empresa:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao atualizar configurações'
        });
        this.loading = false;
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.empresaForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}
