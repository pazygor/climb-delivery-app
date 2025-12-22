import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';

import { AdicionalService } from '../../../../core/services/adicional.service';
import { GrupoAdicional, Adicional } from '../../../../core/models/adicional.model';
import { ModalGrupoAdicionalComponent } from '../modals/modal-grupo-adicional/modal-grupo-adicional.component';

@Component({
  selector: 'app-menu-adicionais',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    TableModule,
    TagModule,
    TooltipModule,
    ConfirmDialogModule,
    ToastModule,
    ModalGrupoAdicionalComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './menu-adicionais.component.html',
  styleUrls: ['./menu-adicionais.component.scss']
})
export class MenuAdicionaisComponent implements OnInit {
  grupos: GrupoAdicional[] = [];
  loading = false;
  searchTerm = '';
  
  // Grupo selecionado para visualizar adicionais
  grupoSelecionado: GrupoAdicional | null = null;
  adicionaisGrupo: Adicional[] = [];
  loadingAdicionais = false;

  // Controle do modal
  modalGrupoVisible = false;
  grupoEmEdicao?: GrupoAdicional;

  constructor(
    private adicionalService: AdicionalService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadGrupos();
  }

  /**
   * Carrega todos os grupos de adicionais
   */
  loadGrupos(): void {
    this.loading = true;
    this.adicionalService.getAllGrupos().subscribe({
      next: (data: GrupoAdicional[]) => {
        this.grupos = data;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erro ao carregar grupos:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar os grupos de adicionais'
        });
        this.loading = false;
      }
    });
  }

  /**
   * Filtra grupos baseado na busca
   */
  get gruposFiltrados(): GrupoAdicional[] {
    if (!this.searchTerm) {
      return this.grupos;
    }

    const term = this.searchTerm.toLowerCase();
    return this.grupos.filter(g => 
      g.nome.toLowerCase().includes(term) ||
      g.descricao?.toLowerCase().includes(term)
    );
  }

  /**
   * Abre modal para criar novo grupo
   */
  criarGrupo(): void {
    this.grupoEmEdicao = undefined;
    this.modalGrupoVisible = true;
  }

  /**
   * Callback ao salvar grupo (criar ou editar)
   */
  onGrupoSalvo(grupo: GrupoAdicional): void {
    this.loadGrupos();
  }

  // ============================================
  // AÇÕES DE GRUPO
  // ============================================

  visualizarGrupo(grupo: GrupoAdicional): void {
    this.grupoSelecionado = grupo;
    this.loadAdicionaisGrupo(grupo.id);
  }

  loadAdicionaisGrupo(grupoId: number): void {
    this.loadingAdicionais = true;
    this.adicionalService.getAdicionaisByGrupo(grupoId).subscribe({
      next: (data: Adicional[]) => {
        this.adicionaisGrupo = data;
        this.loadingAdicionais = false;
      },
      error: (error: any) => {
        console.error('Erro ao carregar adicionais:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar os adicionais'
        });
        this.loadingAdicionais = false;
      }
    });
  }

  fecharVisualizacao(): void {
    this.grupoSelecionado = null;
    this.adicionaisGrupo = [];
  }

  editarGrupo(grupo: GrupoAdicional, event: Event): void {
    event.stopPropagation();
    this.grupoEmEdicao = grupo;
    this.modalGrupoVisible = true;
  }

  duplicarGrupo(grupo: GrupoAdicional, event: Event): void {
    event.stopPropagation();
    
    this.confirmationService.confirm({
      message: `Deseja duplicar o grupo "${grupo.nome}" com todos os adicionais?`,
      header: 'Confirmar Duplicação',
      icon: 'pi pi-clone',
      accept: () => {
        this.adicionalService.duplicateGrupo(grupo.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Grupo duplicado com sucesso'
            });
            this.loadGrupos();
          },
          error: (error: any) => {
            console.error('Erro ao duplicar grupo:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Não foi possível duplicar o grupo'
            });
          }
        });
      }
    });
  }

  excluirGrupo(grupo: GrupoAdicional, event: Event): void {
    event.stopPropagation();
    
    // Verifica vínculos com produtos
    this.adicionalService.checkVinculosProdutos(grupo.id).subscribe({
      next: (result: { vinculado: boolean; produtos: any[] }) => {
        if (result.vinculado) {
          this.confirmationService.confirm({
            message: `O grupo "${grupo.nome}" está vinculado a ${result.produtos.length} produto(s). Ao excluir, ele será removido de todos os produtos. Confirma?`,
            header: 'Atenção: Grupo Vinculado',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => this.confirmarExclusaoGrupo(grupo.id)
          });
        } else {
          this.confirmationService.confirm({
            message: `Deseja excluir o grupo "${grupo.nome}"?`,
            header: 'Confirmar Exclusão',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => this.confirmarExclusaoGrupo(grupo.id)
          });
        }
      },
      error: (error: any) => {
        console.error('Erro ao verificar vínculos:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível verificar vínculos do grupo'
        });
      }
    });
  }

  private confirmarExclusaoGrupo(grupoId: number): void {
    this.adicionalService.deleteGrupo(grupoId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Grupo excluído com sucesso'
        });
        this.loadGrupos();
        if (this.grupoSelecionado?.id === grupoId) {
          this.fecharVisualizacao();
        }
      },
      error: (error: any) => {
        console.error('Erro ao excluir grupo:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível excluir o grupo'
        });
      }
    });
  }

  // ============================================
  // AÇÕES DE ADICIONAL
  // ============================================

  criarAdicional(): void {
    if (!this.grupoSelecionado) return;
    
    // TODO: Implementar modal
    this.messageService.add({
      severity: 'info',
      summary: 'Em desenvolvimento',
      detail: `Criar adicional no grupo: ${this.grupoSelecionado.nome}`
    });
  }

  editarAdicional(adicional: Adicional): void {
    // TODO: Implementar modal
    this.messageService.add({
      severity: 'info',
      summary: 'Em desenvolvimento',
      detail: `Editar adicional: ${adicional.nome}`
    });
  }

  duplicarAdicional(adicional: Adicional): void {
    this.adicionalService.duplicateAdicional(adicional.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Adicional duplicado com sucesso'
        });
        if (this.grupoSelecionado) {
          this.loadAdicionaisGrupo(this.grupoSelecionado.id);
        }
      },
      error: (error: any) => {
        console.error('Erro ao duplicar adicional:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível duplicar o adicional'
        });
      }
    });
  }

  excluirAdicional(adicional: Adicional): void {
    this.confirmationService.confirm({
      message: `Deseja excluir o adicional "${adicional.nome}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.adicionalService.deleteAdicional(adicional.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Adicional excluído com sucesso'
            });
            if (this.grupoSelecionado) {
              this.loadAdicionaisGrupo(this.grupoSelecionado.id);
            }
          },
          error: (error: any) => {
            console.error('Erro ao excluir adicional:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Não foi possível excluir o adicional'
            });
          }
        });
      }
    });
  }

  // ============================================
  // HELPERS
  // ============================================

  getTipoSelecaoLabel(grupo: GrupoAdicional): string {
    if (grupo.maximo === 1) {
      return 'Escolha única';
    }
    return 'Múltipla escolha';
  }

  getTipoSelecaoIcon(grupo: GrupoAdicional): string {
    return grupo.maximo === 1 ? 'pi-circle' : 'pi-check-square';
  }

  getObrigatorioSeverity(obrigatorio: boolean): string {
    return obrigatorio ? 'warn' : 'info';
  }

  getAtivoSeverity(ativo: boolean): string {
    return ativo ? 'success' : 'secondary';
  }

  formatarPreco(preco: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  }
}
