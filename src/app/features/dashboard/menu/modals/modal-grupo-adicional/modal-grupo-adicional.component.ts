import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';
import { AdicionalService } from '../../../../../core/services/adicional.service';
import { GrupoAdicional, CreateGrupoAdicionalDto, UpdateGrupoAdicionalDto, TipoSelecaoGrupo, Adicional, CreateAdicionalDto } from '../../../../../core/models/adicional.model';

@Component({
  selector: 'app-modal-grupo-adicional',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule
  ],
  templateUrl: './modal-grupo-adicional.component.html',
  styleUrl: './modal-grupo-adicional.component.scss'
})
export class ModalGrupoAdicionalComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() grupo?: GrupoAdicional;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() salvou = new EventEmitter<GrupoAdicional>();

  nome: string = '';
  tipoSelecao: TipoSelecaoGrupo = TipoSelecaoGrupo.CHECKBOX;
  obrigatorio: boolean = false;
  minimoSelecao: number = 0;
  maximoSelecao?: number;
  ativo: boolean = true;
  loading: boolean = false;

  // Adicionais do grupo
  adicionais: { 
    id?: number;
    nome: string; 
    preco: number; 
    ordem: number; 
    temp?: boolean;
    deleted?: boolean;
  }[] = [];
  novoAdicionalNome: string = '';
  novoAdicionalPreco: number = 0;

  readonly TipoSelecaoGrupo = TipoSelecaoGrupo;

  constructor(
    private adicionalService: AdicionalService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    if (this.grupo) {
      this.carregarDados();
    }
  }

  ngOnChanges(): void {
    if (this.visible && this.grupo) {
      this.carregarDados();
    } else if (this.visible && !this.grupo) {
      this.limparFormulario();
    }
  }

  carregarDados(): void {
    if (this.grupo) {
      this.nome = this.grupo.nome;
      this.tipoSelecao = this.grupo.tipoSelecao;
      this.obrigatorio = this.grupo.obrigatorio;
      this.minimoSelecao = this.grupo.minimoSelecao;
      this.maximoSelecao = this.grupo.maximoSelecao || undefined;
      this.ativo = this.grupo.ativo;

      // Carregar adicionais existentes para edição
      this.adicionalService.getAdicionaisByGrupo(this.grupo.id).subscribe({
        next: (adicionais: Adicional[]) => {
          this.adicionais = adicionais.map((a: Adicional, index: number) => ({
            id: a.id, // Mantém o ID para edição
            nome: a.nome,
            preco: a.preco,
            ordem: a.ordem || index,
            temp: false // Não é temporário, já existe no banco
          }));
        },
        error: (error: any) => {
          console.error('Erro ao carregar adicionais:', error);
        }
      });
    }
  }

  limparFormulario(): void {
    this.nome = '';
    this.tipoSelecao = TipoSelecaoGrupo.CHECKBOX;
    this.obrigatorio = false;
    this.minimoSelecao = 0;
    this.maximoSelecao = undefined;
    this.ativo = true;
    this.adicionais = [];
    this.novoAdicionalNome = '';
    this.novoAdicionalPreco = 0;
  }

  adicionarItem(): void {
    if (!this.novoAdicionalNome.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Digite o nome do adicional'
      });
      return;
    }

    this.adicionais.push({
      nome: this.novoAdicionalNome.trim(),
      preco: this.novoAdicionalPreco || 0,
      ordem: this.adicionais.length,
      temp: true
    });

    this.novoAdicionalNome = '';
    this.novoAdicionalPreco = 0;
  }

  removerItem(index: number): void {
    const adicional = this.adicionais[index];
    
    // Se é um adicional existente (tem ID), marca como deletado
    if (adicional.id && !adicional.temp) {
      adicional.deleted = true;
    } else {
      // Se é novo (temp), remove da lista
      this.adicionais.splice(index, 1);
    }
    
    // Reordenar
    this.adicionais
      .filter(a => !a.deleted)
      .forEach((a, i) => a.ordem = i);
  }

  moverItemCima(index: number): void {
    const visiveis = this.adicionaisVisiveis;
    if (visiveis.length === 0) return;
    
    const currentItem = this.adicionais[index];
    const currentIndexVisible = visiveis.indexOf(currentItem);
    
    if (currentIndexVisible === 0) return;
    
    const previousItem = visiveis[currentIndexVisible - 1];
    const previousIndex = this.adicionais.indexOf(previousItem);
    
    // Troca as posições
    const temp = this.adicionais[index];
    this.adicionais[index] = this.adicionais[previousIndex];
    this.adicionais[previousIndex] = temp;
    
    // Reordenar
    this.adicionaisVisiveis.forEach((a, i) => a.ordem = i);
  }

  moverItemBaixo(index: number): void {
    const visiveis = this.adicionaisVisiveis;
    if (visiveis.length === 0) return;
    
    const currentItem = this.adicionais[index];
    const currentIndexVisible = visiveis.indexOf(currentItem);
    
    if (currentIndexVisible === visiveis.length - 1) return;
    
    const nextItem = visiveis[currentIndexVisible + 1];
    const nextIndex = this.adicionais.indexOf(nextItem);
    
    // Troca as posições
    const temp = this.adicionais[index];
    this.adicionais[index] = this.adicionais[nextIndex];
    this.adicionais[nextIndex] = temp;
    
    // Reordenar
    this.adicionaisVisiveis.forEach((a, i) => a.ordem = i);
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
        detail: 'O nome do grupo é obrigatório'
      });
      return;
    }

    if (this.adicionais.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Adicione pelo menos um item ao grupo'
      });
      return;
    }

    // Validações de min/max
    if (this.maximoSelecao && this.minimoSelecao > this.maximoSelecao) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'O mínimo não pode ser maior que o máximo'
      });
      return;
    }

    this.loading = true;

    if (this.grupo) {
      this.atualizarGrupo();
    } else {
      this.criarGrupo();
    }
  }

  criarGrupo(): void {
    const dto: CreateGrupoAdicionalDto = {
      nome: this.nome.trim(),
      tipoSelecao: this.tipoSelecao,
      obrigatorio: this.obrigatorio,
      minimoSelecao: this.minimoSelecao,
      maximoSelecao: this.maximoSelecao,
      ativo: this.ativo,
      ordem: 0
    };

    this.adicionalService.createGrupo(dto).subscribe({
      next: (novoGrupo: GrupoAdicional) => {
        // Criar adicionais
        this.criarAdicionaisDoGrupo(novoGrupo.id, novoGrupo);
      },
      error: (error: any) => {
        console.error('Erro ao criar grupo:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao criar grupo de adicionais'
        });
        this.loading = false;
      }
    });
  }

  atualizarGrupo(): void {
    const dto: UpdateGrupoAdicionalDto = {
      nome: this.nome.trim(),
      tipoSelecao: this.tipoSelecao,
      obrigatorio: this.obrigatorio,
      minimoSelecao: this.minimoSelecao,
      maximoSelecao: this.maximoSelecao,
      ativo: this.ativo
    };

    this.adicionalService.updateGrupo(this.grupo!.id, dto).subscribe({
      next: (grupoAtualizado: GrupoAdicional) => {
        // Processar adicionais: criar novos, atualizar existentes, excluir removidos
        this.processarAdicionais(this.grupo!.id, grupoAtualizado);
      },
      error: (error: any) => {
        console.error('Erro ao atualizar grupo:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao atualizar grupo'
        });
        this.loading = false;
      }
    });
  }

  processarAdicionais(grupoId: number, grupo: GrupoAdicional): void {
    const promises: Promise<any>[] = [];

    // 1. Criar novos adicionais (temp = true)
    const novos = this.adicionais.filter(a => a.temp && !a.deleted);
    novos.forEach(adicional => {
      const dto: CreateAdicionalDto = {
        grupoAdicionalId: grupoId,
        nome: adicional.nome,
        preco: adicional.preco,
        ordem: adicional.ordem,
        ativo: true
      };
      promises.push(this.adicionalService.createAdicional(dto).toPromise());
    });

    // 2. Atualizar adicionais existentes que foram modificados
    const existentes = this.adicionais.filter(a => a.id && !a.temp && !a.deleted);
    existentes.forEach(adicional => {
      const dto = {
        nome: adicional.nome,
        preco: adicional.preco,
        ordem: adicional.ordem
      };
      promises.push(this.adicionalService.updateAdicional(adicional.id!, dto).toPromise());
    });

    // 3. Excluir adicionais marcados como deleted
    const deletados = this.adicionais.filter(a => a.deleted && a.id);
    deletados.forEach(adicional => {
      promises.push(this.adicionalService.deleteAdicional(adicional.id!).toPromise());
    });

    // Executar todas as operações
    Promise.all(promises)
      .then(() => {
        this.finalizarSalvar(grupo);
      })
      .catch((error) => {
        console.error('Erro ao processar adicionais:', error);
        this.messageService.add({
          severity: 'warn',
          summary: 'Atenção',
          detail: 'Grupo atualizado, mas houve problemas com alguns adicionais'
        });
        this.finalizarSalvar(grupo);
      });
  }

  criarAdicionaisDoGrupo(grupoId: number, grupo: GrupoAdicional): void {
    let adicionaisCriados = 0;
    const totalAdicionais = this.adicionais.length;

    this.adicionais.forEach((adicional) => {
      const dto: CreateAdicionalDto = {
        grupoAdicionalId: grupoId,
        nome: adicional.nome,
        preco: adicional.preco,
        ordem: adicional.ordem,
        ativo: true
      };

      this.adicionalService.createAdicional(dto).subscribe({
        next: () => {
          adicionaisCriados++;
          if (adicionaisCriados === totalAdicionais) {
            this.finalizarSalvar(grupo);
          }
        },
        error: (error: any) => {
          console.error('Erro ao criar adicional:', error);
          adicionaisCriados++;
          if (adicionaisCriados === totalAdicionais) {
            this.finalizarSalvar(grupo);
          }
        }
      });
    });
  }

  finalizarSalvar(grupo: GrupoAdicional): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: this.grupo ? 'Grupo atualizado com sucesso' : 'Grupo criado com sucesso'
    });
    this.salvou.emit(grupo);
    this.fechar();
    this.loading = false;
  }

  get tituloModal(): string {
    return this.grupo ? 'Editar Grupo de Adicionais' : 'Novo Grupo de Adicionais';
  }

  get adicionaisVisiveis() {
    return this.adicionais.filter(a => !a.deleted);
  }

  getIndexReal(adicional: any): number {
    return this.adicionais.indexOf(adicional);
  }

  formatarPreco(preco: number): string {
    return preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}
