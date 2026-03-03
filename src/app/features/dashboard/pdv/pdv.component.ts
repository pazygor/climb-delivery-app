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
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

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
    TooltipModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './pdv.component.html',
  styleUrl: './pdv.component.scss'
})
export class PdvComponent implements OnInit {
  // Dados principais
  categorias: Categoria[] = [];
  produtos: Produto[] = [];
  categoriaSelecionada: Categoria | null = null;
  produtoSelecionado: Produto | null = null;
  quantidadeSelecionada: number = 1;
  empresaId: number | null = null;

  // Carrinho
  itensCarrinho: ItemCarrinho[] = [];
  itemCarrinhoSelecionado: ItemCarrinho | null = null;

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
    private messageService: MessageService,
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
    console.log('Categoria selecionada:', categoria);
    this.categoriaSelecionada = categoria;
    this.produtoSelecionado = null;
    this.quantidadeSelecionada = 1;
    this.carregarProdutosDaCategoria(categoria.id);
  }

  carregarProdutosDaCategoria(categoriaId: number): void {
    console.log('Carregando produtos da categoria:', categoriaId);
    this.loading = true;
    this.produtoService.getByCategoria(categoriaId).subscribe({
      next: (produtos) => {
        console.log('Produtos recebidos:', produtos);
        this.produtos = produtos.filter(p => p.disponivel);
        console.log('Produtos disponíveis após filtro:', this.produtos);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);
        this.produtos = [];
        this.loading = false;
      }
    });
  }

  selecionarProduto(produto: Produto): void {
    this.produtoSelecionado = produto;
    this.quantidadeSelecionada = 1;
  }

  aumentarQuantidade(): void {
    this.quantidadeSelecionada++;
  }

  diminuirQuantidade(): void {
    if (this.quantidadeSelecionada > 1) {
      this.quantidadeSelecionada--;
    }
  }

  finalizarItem(): void {
    if (!this.produtoSelecionado) return;

    const itemExistente = this.itensCarrinho.find(
      item => item.produto.id === this.produtoSelecionado!.id
    );

    if (itemExistente) {
      itemExistente.quantidade += this.quantidadeSelecionada;
      itemExistente.subtotal = itemExistente.quantidade * this.produtoSelecionado.preco;
    } else {
      this.itensCarrinho.push({
        produto: this.produtoSelecionado,
        quantidade: this.quantidadeSelecionada,
        subtotal: this.produtoSelecionado.preco * this.quantidadeSelecionada
      });
    }

    // Limpa a seleção
    this.produtoSelecionado = null;
    this.quantidadeSelecionada = 1;
  }

  voltarParaCategorias(): void {
    this.categoriaSelecionada = null;
    this.produtoSelecionado = null;
    this.quantidadeSelecionada = 1;
    this.produtos = [];
  }

  cancelarSelecao(): void {
    this.produtoSelecionado = null;
    this.quantidadeSelecionada = 1;
  }

  removerDoCarrinho(item: ItemCarrinho): void {
    const index = this.itensCarrinho.indexOf(item);
    if (index > -1) {
      this.itensCarrinho.splice(index, 1);
      if (this.itemCarrinhoSelecionado === item) {
        this.itemCarrinhoSelecionado = null;
      }
    }
  }

  selecionarItemCarrinho(item: ItemCarrinho): void {
    this.itemCarrinhoSelecionado = item;
  }

  calcularSubtotal(): number {
    return this.itensCarrinho.reduce((total, item) => total + item.subtotal, 0);
  }

  calcularTotal(): number {
    // Por enquanto, o total é igual ao subtotal (sem taxa de entrega)
    return this.calcularSubtotal();
  }

  converterParaDecimal(valor: number | string): string {
    const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
    return numero.toFixed(2);
  }

  gerarPedido(): void {
    console.log('Método gerarPedido chamado');
    console.log('podeConcluirPedido:', this.podeConcluirPedido);
    console.log('itensCarrinho:', this.itensCarrinho);
    console.log('dadosCliente:', this.dadosCliente);

    if (!this.podeConcluirPedido) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Adicione itens ao carrinho e preencha os dados do cliente'
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

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Usuário não identificado'
      });
      return;
    }

    // Prepara os dados do pedido
    const pedidoManual = {
      empresaId: this.empresaId,
      usuarioId: typeof currentUser.id === 'string' ? parseInt(currentUser.id) : currentUser.id,
      enderecoEntrega: 'BALCÃO - RETIRADA NO LOCAL',
      numero: '', // Será gerado pelo backend
      subtotal: this.converterParaDecimal(this.calcularSubtotal()),
      taxaEntrega: '0.00',
      total: this.converterParaDecimal(this.calcularTotal()),
      formaPagamento: 'A definir',
      observacoes: `Cliente: ${this.dadosCliente.nome}\nTelefone: ${this.dadosCliente.telefone}${this.dadosCliente.cpfCnpj ? '\nCPF/CNPJ: ' + this.dadosCliente.cpfCnpj : ''}`,
      itens: this.itensCarrinho.map(item => ({
        produtoId: item.produto.id,
        quantidade: item.quantidade,
        precoUnitario: this.converterParaDecimal(item.produto.preco),
        subtotal: this.converterParaDecimal(item.subtotal),
        observacoes: item.observacao || ''
      }))
    };

    console.log('Dados do pedido a ser enviado:', pedidoManual);

    this.loading = true;
    this.orderService.createManualOrder(pedidoManual).subscribe({
      next: (pedido) => {
        console.log('Pedido criado com sucesso:', pedido);
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: `Pedido #${pedido.numero} criado com sucesso!`,
          life: 5000
        });
        this.voltarTelaInicial();
      },
      error: (error) => {
        console.error('Erro ao criar pedido:', error);
        const errorMessage = error?.error?.message || 'Erro ao criar pedido. Tente novamente.';
        const detailMessage = Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage;
        this.messageService.add({
          severity: 'error',
          summary: 'Erro ao criar pedido',
          detail: detailMessage,
          life: 5000
        });
        this.loading = false;
      }
    });
  }

  limparCarrinho(): void {
    this.itensCarrinho = [];
    this.itemCarrinhoSelecionado = null;
    this.dadosCliente = {
      telefone: '',
      nome: ''
    };
  }

  voltarTelaInicial(): void {
    // Limpa tudo e volta para a tela de categorias
    this.itensCarrinho = [];
    this.itemCarrinhoSelecionado = null;
    this.dadosCliente = {
      telefone: '',
      nome: ''
    };
    this.categoriaSelecionada = null;
    this.produtoSelecionado = null;
    this.quantidadeSelecionada = 1;
    this.produtos = [];
    this.termoPesquisa = '';
    this.loading = false;
  }

  formatarPreco(valor: number): string {
    // Garante que o valor seja um número
    const numeroValor = typeof valor === 'string' ? parseFloat(valor) : valor;
    return numeroValor.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
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
