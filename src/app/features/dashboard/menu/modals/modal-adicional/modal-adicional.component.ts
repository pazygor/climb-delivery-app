import { Component, EventEmitter, Input, Output, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextarea } from 'primeng/inputtextarea';
import { MessageService } from 'primeng/api';
import { AdicionalService } from '../../../../../core/services/adicional.service';
import { Adicional, CreateAdicionalDto, UpdateAdicionalDto } from '../../../../../core/models/adicional.model';

@Component({
  selector: 'app-modal-adicional',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    InputTextarea
  ],
  templateUrl: './modal-adicional.component.html',
  styleUrl: './modal-adicional.component.scss'
})
export class ModalAdicionalComponent implements OnInit, OnChanges {
  @Input() visible: boolean = false;
  @Input() adicional?: Adicional;
  @Input() grupoId!: number;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() salvou = new EventEmitter<Adicional>();

  nome: string = '';
  descricao: string = '';
  preco: number = 0;
  ativo: boolean = true;
  loading: boolean = false;

  constructor(
    private adicionalService: AdicionalService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    if (this.adicional) {
      this.carregarDados();
    }
  }

  ngOnChanges(): void {
    if (this.visible && this.adicional) {
      this.carregarDados();
    } else if (this.visible && !this.adicional) {
      this.limparFormulario();
    }
  }

  carregarDados(): void {
    if (this.adicional) {
      this.nome = this.adicional.nome;
      this.descricao = this.adicional.descricao || '';
      this.preco = this.adicional.preco;
      this.ativo = this.adicional.ativo;
    }
  }

  limparFormulario(): void {
    this.nome = '';
    this.descricao = '';
    this.preco = 0;
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
        detail: 'O nome do adicional é obrigatório'
      });
      return;
    }

    if (this.preco < 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'O preço não pode ser negativo'
      });
      return;
    }

    this.loading = true;

    if (this.adicional) {
      this.atualizarAdicional();
    } else {
      this.criarAdicional();
    }
  }

  criarAdicional(): void {
    const dto: CreateAdicionalDto = {
      grupoAdicionalId: this.grupoId,
      nome: this.nome.trim(),
      descricao: this.descricao.trim() || undefined,
      preco: this.preco,
      ativo: this.ativo,
      ordem: 999 // Será ajustado pelo backend
    };

    this.adicionalService.createAdicional(dto).subscribe({
      next: (novoAdicional: Adicional) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Adicional criado com sucesso'
        });
        this.salvou.emit(novoAdicional);
        this.fechar();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erro ao criar adicional:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao criar adicional'
        });
        this.loading = false;
      }
    });
  }

  atualizarAdicional(): void {
    const dto: UpdateAdicionalDto = {
      nome: this.nome.trim(),
      descricao: this.descricao.trim() || undefined,
      preco: this.preco,
      ativo: this.ativo
    };

    this.adicionalService.updateAdicional(this.adicional!.id, dto).subscribe({
      next: (adicionalAtualizado: Adicional) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Adicional atualizado com sucesso'
        });
        this.salvou.emit(adicionalAtualizado);
        this.fechar();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erro ao atualizar adicional:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao atualizar adicional'
        });
        this.loading = false;
      }
    });
  }

  get tituloModal(): string {
    return this.adicional ? 'Editar Adicional' : 'Novo Adicional';
  }

  formatarPreco(preco: number): string {
    return preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
