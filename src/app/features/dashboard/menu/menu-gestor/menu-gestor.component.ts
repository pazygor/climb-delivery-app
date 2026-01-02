import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { SelectButtonModule } from 'primeng/selectbutton';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MessageService, ConfirmationService } from 'primeng/api';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../../../core/services/auth.service';
import { CategoriaService } from '../../../../core/services/categoria.service';
import { ProdutoService } from '../../../../core/services/produto.service';
import { Categoria } from '../../../../core/models/categoria.model';
import { Produto } from '../../../../core/models/produto.model';
import { ModalCategoriaComponent } from '../modals/modal-categoria/modal-categoria.component';
import { ModalProdutoComponent } from '../modals/modal-produto/modal-produto.component';

@Component({
  selector: 'app-menu-gestor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    TooltipModule,
    ConfirmDialogModule,
    ToastModule,
    SelectButtonModule,
    InputSwitchModule,
    ModalCategoriaComponent,
    ModalProdutoComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './menu-gestor.component.html',
  styleUrls: ['./menu-gestor.component.scss']
})
export class MenuGestorComponent implements OnInit {
  categorias: Categoria[] = [];
  produtos: Produto[] = [];
  empresaId: number | null = null;
  loading = false;
  searchTerm = '';
  filtroStatus: 'todos' | 'disponiveis' | 'esgotados' = 'todos';
  
  // Controle de expansão das categorias
  categoriasExpandidas: Set<number> = new Set();

  // Controle dos modais
  modalCategoriaVisible = false;
  modalProdutoVisible = false;
  categoriaEmEdicao?: Categoria;
  produtoEmEdicao?: Produto;
  categoriaIdParaNovoProduto?: number;

  // Opções do filtro
  filtroStatusOptions = [
    { label: 'Todos', value: 'todos' },
    { label: 'Disponíveis', value: 'disponiveis' },
    { label: 'Esgotados', value: 'esgotados' }
  ];

  constructor(
    private authService: AuthService,
    private categoriaService: CategoriaService,
    private produtoService: ProdutoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.empresaId = this.authService.getEmpresaId();
    if (!this.empresaId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Empresa não identificada'
      });
      return;
    }
    this.loadData();
  }

  /**
   * Carrega categorias e produtos da empresa
   */
  loadData(): void {
    if (!this.empresaId) return;
    
    this.loading = true;
    
    forkJoin({
      categorias: this.categoriaService.getByEmpresa(this.empresaId),
      produtos: this.produtoService.getByEmpresa(this.empresaId)
    }).subscribe({
      next: (data) => {
        this.categorias = data.categorias;
        this.produtos = data.produtos;
        
        // Organiza produtos por categoria
        this.categorias.forEach(cat => {
          cat.produtos = this.produtos.filter(p => p.categoriaId === cat.id);
        });
        
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erro ao carregar dados:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar os dados'
        });
        this.loading = false;
      }
    });
  }

  /**
   * Filtra categorias e produtos baseado na busca e filtro
   */
  get categoriasFiltradas(): Categoria[] {
    let filtradas = this.categorias;

    // Filtro por busca
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtradas = filtradas.filter(cat => 
        cat.nome.toLowerCase().includes(term) ||
        cat.produtos?.some((p: Produto) => p.nome.toLowerCase().includes(term))
      );
    }

    return filtradas;
  }

  /**
   * Filtra produtos de uma categoria
   */
  getProdutosFiltrados(produtos: Produto[] = []): Produto[] {
    if (this.filtroStatus === 'todos') {
      return produtos;
    }
    
    return produtos.filter(p => 
      this.filtroStatus === 'disponiveis' ? p.disponivel : !p.disponivel
    );
  }

  /**
   * Toggle expansão da categoria
   */
  toggleCategoria(categoriaId: number): void {
    if (this.categoriasExpandidas.has(categoriaId)) {
      this.categoriasExpandidas.delete(categoriaId);
    } else {
      this.categoriasExpandidas.add(categoriaId);
    }
  }

  isCategoriaExpandida(categoriaId: number): boolean {
    return this.categoriasExpandidas.has(categoriaId);
  }

  /**
   * Abre modal para criar nova categoria
   */
  criarCategoria(): void {
    this.categoriaEmEdicao = undefined;
    this.modalCategoriaVisible = true;
  }

  /**
   * Callback ao salvar categoria (criar ou editar)
   */
  onCategoriaSalva(categoria: Categoria): void {
    this.loadData();
  }

  // ============================================
  // AÇÕES DE CATEGORIA
  // ============================================

  editarCategoria(categoria: Categoria, event: Event): void {
    event.stopPropagation();
    this.categoriaEmEdicao = categoria;
    this.modalCategoriaVisible = true;
  }

  duplicarCategoria(categoria: Categoria, event: Event): void {
    event.stopPropagation();
    
    this.confirmationService.confirm({
      message: `Deseja duplicar a categoria "${categoria.nome}" com todos os produtos?`,
      header: 'Confirmar Duplicação',
      icon: 'pi pi-clone',
      accept: () => {
        this.categoriaService.duplicate(categoria.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Categoria duplicada com sucesso'
            });
            this.loadData();
          },
          error: (error: any) => {
            console.error('Erro ao duplicar categoria:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Não foi possível duplicar a categoria'
            });
          }
        });
      }
    });
  }

  excluirCategoria(categoria: Categoria, event: Event): void {
    event.stopPropagation();
    
    const temProdutos = (categoria._count?.produtos || 0) > 0;
    
    this.confirmationService.confirm({
      message: temProdutos 
        ? `A categoria "${categoria.nome}" possui ${categoria._count?.produtos} produto(s). Todos serão excluídos. Confirma?`
        : `Deseja excluir a categoria "${categoria.nome}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.categoriaService.delete(categoria.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Categoria excluída com sucesso'
            });
            this.loadData();
          },
          error: (error: any) => {
            console.error('Erro ao excluir categoria:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Não foi possível excluir a categoria'
            });
          }
        });
      }
    });
  }

  esgotarTodosCategoria(categoria: Categoria, esgotado: boolean): void {
    this.categoriaService.esgotarTodos(categoria.id, esgotado).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: esgotado 
            ? 'Todos os produtos foram esgotados'
            : 'Todos os produtos foram reativados'
        });
        this.loadData();
      },
      error: (error: any) => {
        console.error('Erro ao esgotar produtos:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível alterar disponibilidade dos produtos'
        });
      }
    });
  }

  // ============================================
  // AÇÕES DE PRODUTO
  // ============================================

  criarProduto(categoria: Categoria, event: Event): void {
    event.stopPropagation();
    this.produtoEmEdicao = undefined;
    this.categoriaIdParaNovoProduto = categoria.id;
    this.modalProdutoVisible = true;
  }

  /**
   * Callback ao salvar produto (criar ou editar)
   */
  onProdutoSalvo(produto: Produto): void {
    this.loadData();
    this.categoriaIdParaNovoProduto = undefined;
  }

  editarProduto(produto: Produto, event: Event): void {
    event.stopPropagation();
    this.produtoEmEdicao = produto;
    this.categoriaIdParaNovoProduto = undefined;
    this.modalProdutoVisible = true;
  }

  duplicarProduto(produto: Produto, event: Event): void {
    event.stopPropagation();
    
    this.produtoService.duplicate(produto.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Produto duplicado com sucesso'
        });
        this.loadData();
      },
      error: (error: any) => {
        console.error('Erro ao duplicar produto:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível duplicar o produto'
        });
      }
    });
  }

  editarAdicionaisProduto(produto: Produto, event: Event): void {
    event.stopPropagation();
    // TODO: Implementar modal
    this.messageService.add({
      severity: 'info',
      summary: 'Em desenvolvimento',
      detail: `Editar adicionais do produto: ${produto.nome}`
    });
  }

  excluirProduto(produto: Produto, event: Event): void {
    event.stopPropagation();
    
    this.confirmationService.confirm({
      message: `Deseja excluir o produto "${produto.nome}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.produtoService.delete(produto.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Produto excluído com sucesso'
            });
            this.loadData();
          },
          error: (error: any) => {
            console.error('Erro ao excluir produto:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Não foi possível excluir o produto'
            });
          }
        });
      }
    });
  }

  toggleDisponibilidadeProduto(produto: Produto): void {
    const novoStatus = !produto.disponivel;
    
    this.produtoService.toggleDisponibilidade(produto.id, novoStatus).subscribe({
      next: () => {
        produto.disponivel = novoStatus;
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: novoStatus ? 'Produto disponibilizado' : 'Produto esgotado'
        });
      },
      error: (error: any) => {
        console.error('Erro ao alterar disponibilidade:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível alterar a disponibilidade'
        });
      }
    });
  }

  /**
   * Retorna contador de produtos por categoria
   */
  getContadorProdutos(categoria: Categoria): string {
    const total = categoria._count?.produtos || 0;
    const esgotados = categoria.produtos?.filter((p: Produto) => !p.disponivel).length || 0;
    
    if (esgotados === 0) {
      return `${total} ${total === 1 ? 'item' : 'itens'}`;
    }
    
    return `${total} ${total === 1 ? 'item' : 'itens'} (${esgotados} esgotado${esgotados > 1 ? 's' : ''})`;
  }

  /**
   * Formata preço
   */
  formatarPreco(preco: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  }
}
