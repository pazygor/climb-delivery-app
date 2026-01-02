import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { CategoriaService } from '../../../../../core/services/categoria.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { Categoria, CreateCategoriaDto, UpdateCategoriaDto } from '../../../../../core/models/categoria.model';

@Component({
  selector: 'app-modal-categoria',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule
  ],
  templateUrl: './modal-categoria.component.html',
  styleUrl: './modal-categoria.component.scss'
})
export class ModalCategoriaComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() categoria?: Categoria;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() salvou = new EventEmitter<Categoria>();

  nome: string = '';
  descricao: string = '';
  ativo: boolean = true;
  loading: boolean = false;
  empresaId: number | null = null;

  constructor(
    private categoriaService: CategoriaService,
    private messageService: MessageService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.empresaId = user?.empresaId || null;
    
    if (this.categoria) {
      this.carregarDados();
    }
  }

  ngOnChanges(): void {
    if (this.visible && this.categoria) {
      this.carregarDados();
    } else if (this.visible && !this.categoria) {
      this.limparFormulario();
    }
  }

  carregarDados(): void {
    if (this.categoria) {
      this.nome = this.categoria.nome;
      this.descricao = this.categoria.descricao || '';
      this.ativo = this.categoria.ativo;
    }
  }

  limparFormulario(): void {
    this.nome = '';
    this.descricao = '';
    this.ativo = true;
  }

  fechar(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.limparFormulario();
  }

  salvar(): void {
    if (!this.nome.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'O nome da categoria é obrigatório'
      });
      return;
    }

    this.loading = true;

    if (this.categoria) {
      // Editar
      const dto: UpdateCategoriaDto = {
        nome: this.nome.trim(),
        descricao: this.descricao.trim() || undefined,
        ativo: this.ativo
      };

      this.categoriaService.update(this.categoria.id, dto).subscribe({
        next: (categoriaAtualizada: Categoria) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Categoria atualizada com sucesso'
          });
          this.salvou.emit(categoriaAtualizada);
          this.fechar();
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Erro ao atualizar categoria:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao atualizar categoria'
          });
          this.loading = false;
        }
      });
    } else {
      // Criar
      if (!this.empresaId) {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Empresa não identificada'
        });
        this.loading = false;
        return;
      }

      const dto: CreateCategoriaDto = {
        empresaId: this.empresaId,
        nome: this.nome.trim(),
        descricao: this.descricao.trim() || undefined,
        ativo: this.ativo,
        ordem: 0
      };

      this.categoriaService.create(dto).subscribe({
        next: (novaCategoria: Categoria) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Categoria criada com sucesso'
          });
          this.salvou.emit(novaCategoria);
          this.fechar();
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Erro ao criar categoria:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao criar categoria'
          });
          this.loading = false;
        }
      });
    }
  }

  get tituloModal(): string {
    return this.categoria ? 'Editar Categoria' : 'Nova Categoria';
  }
}
