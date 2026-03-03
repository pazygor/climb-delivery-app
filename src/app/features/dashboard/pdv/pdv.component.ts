import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriaService } from '../../../core/services/categoria.service';
import { ProdutoService } from '../../../core/services/produto.service';
import { AuthService } from '../../../core/services/auth.service';
import { OrderService } from '../../../core/services/order.service';
import { Categoria } from '../../../core/models/categoria.model';
import { Produto } from '../../../core/models/produto.model';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';

interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
  observacao?: string;
  subtotal: number;
}

interface DadosCliente {
  telefone: string;
  nome: string;
  cpfCnpj?: string;
}

@Component({
  selector: 'app-pdv',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    TooltipModule
  ],
  templateUrl: './pdv.component.html',
  styleUrl: './pdv.component.scss'
})
export class PdvComponent implements OnInit {
  // Dados principais
  categorias: Categoria[] = [];
  produtos: Produto[] = [];
  categoriaSelecionada: Categoria | null = null;
  produtoSelecionado: Produto | null = null;
  empresaId: number | null = null;

  // Carrinho
  itensCarrinho: ItemCarrinho[] = [];
  itemSelecionado: ItemCarrinho | null = null;

  // Dados do cliente
  dadosCliente: DadosCliente = {
    telefone: '',
    nome: ''
  };

  // Filtros e pesquisa
  termoPesquisa: string = '';

  // Loading
  loading = false;

  constructor(
    private categoriaService: CategoriaService,
    private produtoService: ProdutoService,
    private authService: AuthService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.establishmentId) {
      this.empresaId = parseInt(currentUser.establishmentId);
      this.carregarCategorias();
    } else {
      console.error('Usuário não possui empresa associada');
    }
  }

  carregarCategorias(): void {
    if (!this.empresaId) return;

    this.loading = true;
    this.categoriaService.getByEmpresa(this.empresaId).subscribe({
      next: (categorias) => {
        this.categorias = categorias.filter(c => c.ativo);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar categorias:', error);
        this.loading = false;
      }
    });
  }

  selecionarCategoria(categoria: Categoria): void {
    this.categoriaSelecionada = categoria;
    this.carregarProdutosDaCategoria(categoria.id);
  }

  carregarProdutosDaCategoria(categoriaId: number): void {
    this.loading = true;
    this.produtoService.getByCategoria(categoriaId).subscribe({
      next: (produtos) => {
        this.produtos = produtos.filter(p => p.disponivel);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);
        this.loading = false;
      }
    });
  }

  adicionarAoCarrinho(produto: Produto): void {
    const itemExistente = this.itensCarrinho.find(item => item.produto.id === produto.id);

    if (itemExistente) {
      itemExistente.quantidade++;
      itemExistente.subtotal = itemExistente.quantidade * produto.preco;
    } else {
      this.itensCarrinho.push({
        produto: produto,
        quantidade: 1,
        subtotal: produto.preco
      });
    }
  }

  removerDoCarrinho(item: ItemCarrinho): void {
    const index = this.itensCarrinho.indexOf(item);
    if (index > -1) {
      this.itensCarrinho.splice(index, 1);
      if (this.itemSelecionado === item) {
        this.itemSelecionado = null;
      }
    }
  }

  selecionarItem(item: ItemCarrinho): void {
    this.itemSelecionado = item;
  }

  calcularSubtotal(): number {
    return this.itensCarrinho.reduce((total, item) => total + item.subtotal, 0);
  }

  calcularTotal(): number {
    // Por enquanto, o total é igual ao subtotal (sem taxa de entrega)
    return this.calcularSubtotal();
  }

  gerarPedido(): void {
    if (this.itensCarrinho.length === 0) {
      alert('Adicione itens ao carrinho antes de gerar o pedido');
      return;
    }

    if (!this.dadosCliente.telefone || !this.dadosCliente.nome) {
      alert('Preencha os dados do cliente antes de gerar o pedido');
      return;
    }

    // TODO: Implementar a criação do pedido
    console.log('Gerando pedido...', {
      itens: this.itensCarrinho,
      cliente: this.dadosCliente,
      total: this.calcularTotal()
    });

    // Limpar carrinho após gerar pedido
    this.limparCarrinho();
  }

  limparCarrinho(): void {
    this.itensCarrinho = [];
    this.itemSelecionado = null;
    this.dadosCliente = {
      telefone: '',
      nome: ''
    };
  }

  formatarPreco(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  get categoriasFiltradas(): Categoria[] {
    if (!this.termoPesquisa) return this.categorias;
    
    return this.categorias.filter(c => 
      c.nome.toLowerCase().includes(this.termoPesquisa.toLowerCase())
    );
  }

  get podeConcluirPedido(): boolean {
    return this.itensCarrinho.length > 0 && 
           !!this.dadosCliente.telefone && 
           !!this.dadosCliente.nome;
  }
}
