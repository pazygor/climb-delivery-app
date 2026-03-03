import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../../core/services/auth.service';
import { CategoriaService } from '../../../../core/services/categoria.service';
import { ProdutoService } from '../../../../core/services/produto.service';
import { OrderService } from '../../../../core/services/order.service';
import { Categoria } from '../../../../core/models/categoria.model';
import { Produto } from '../../../../core/models/produto.model';

interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
  subtotal: number;
}

interface DadosCliente {
  telefone: string;
  nome: string;
  cpfCnpj?: string;
}

@Component({
  selector: 'app-modal-novo-pedido',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './modal-novo-pedido.component.html',
  styleUrls: ['./modal-novo-pedido.component.scss']
})
export class ModalNovoPedidoComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() pedidoCriado = new EventEmitter<void>();

  empresaId: number = 0;
  usuarioId: number = 0;
  
  // Estado da tela
  categorias: Categoria[] = [];
  categoriaSelecionada: Categoria | null = null;
  produtos: Produto[] = [];
  produtoSelecionado: Produto | null = null;
  quantidade: number = 1;
  
  // Carrinho
  itensCarrinho: ItemCarrinho[] = [];
  
  // Dados do cliente
  dadosCliente: DadosCliente = {
    telefone: '',
    nome: '',
    cpfCnpj: ''
  };
  
  // Pesquisa
  searchTerm: string = '';

  constructor(
    private authService: AuthService,
    private categoriaService: CategoriaService,
    private produtoService: ProdutoService,
    private orderService: OrderService,
    private messageService: MessageService
  ) {
    const currentUser = this.authService.getCurrentUser();
    this.empresaId = currentUser?.empresaId || 0;
    this.usuarioId = Number(currentUser?.id) || 0;
  }

  onShow(): void {
    this.voltarTelaInicial();
    this.carregarCategorias();
  }

  carregarCategorias(): void {
    this.categoriaService.getByEmpresa(this.empresaId).subscribe({
      next: (categorias) => {
        this.categorias = categorias;
      },
      error: (error) => {
        console.error('Erro ao carregar categorias:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar as categorias'
        });
      }
    });
  }

  get categoriasFiltradas(): Categoria[] {
    if (!this.searchTerm) {
      return this.categorias;
    }
    const termo = this.searchTerm.toLowerCase();
    return this.categorias.filter(cat => 
      cat.nome.toLowerCase().includes(termo)
    );
  }

  selecionarCategoria(categoria: Categoria): void {
    this.categoriaSelecionada = categoria;
    this.carregarProdutos(categoria.id);
  }

  carregarProdutos(categoriaId: number): void {
    this.produtoService.getByCategoria(categoriaId).subscribe({
      next: (produtos) => {
        this.produtos = produtos;
      },
      error: (error) => {
        console.error('Erro ao carregar produtos:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível carregar os produtos'
        });
      }
    });
  }

  voltarCategorias(): void {
    this.categoriaSelecionada = null;
    this.produtos = [];
  }

  selecionarProduto(produto: Produto): void {
    this.produtoSelecionado = produto;
    this.quantidade = 1;
  }

  voltarProdutos(): void {
    this.produtoSelecionado = null;
    this.quantidade = 1;
  }

  aumentarQuantidade(): void {
    this.quantidade++;
  }

  diminuirQuantidade(): void {
    if (this.quantidade > 1) {
      this.quantidade--;
    }
  }

  finalizarItem(): void {
    if (!this.produtoSelecionado) return;

    const subtotal = this.produtoSelecionado.preco * this.quantidade;

    this.itensCarrinho.push({
      produto: this.produtoSelecionado,
      quantidade: this.quantidade,
      subtotal: subtotal
    });

    this.messageService.add({
      severity: 'success',
      summary: 'Item adicionado',
      detail: `${this.quantidade}x ${this.produtoSelecionado.nome}`
    });

    // Volta para a tela de produtos
    this.voltarProdutos();
  }

  removerItem(index: number): void {
    const item = this.itensCarrinho[index];
    this.itensCarrinho.splice(index, 1);
    
    this.messageService.add({
      severity: 'info',
      summary: 'Item removido',
      detail: `${item.quantidade}x ${item.produto.nome}`
    });
  }

  calcularSubtotal(): number {
    return this.itensCarrinho.reduce((total, item) => total + item.subtotal, 0);
  }

  calcularTotal(): number {
    return this.calcularSubtotal(); // Taxa de entrega 0 para balcão
  }

  formatarPreco(valor: number | string): string {
    const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
    return numero.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  converterParaDecimal(valor: number | string): string {
    const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
    return numero.toFixed(2);
  }

  podeConcluirPedido(): boolean {
    return this.itensCarrinho.length > 0 && 
           this.dadosCliente.telefone.trim() !== '' && 
           this.dadosCliente.nome.trim() !== '';
  }

  gerarPedido(): void {
    if (!this.podeConcluirPedido()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha todos os dados do cliente e adicione pelo menos um item'
      });
      return;
    }

    const subtotal = this.calcularSubtotal();
    const taxaEntrega = 0; // Balcão não tem taxa de entrega
    const total = this.calcularTotal();

    const pedidoManual = {
      empresaId: this.empresaId,
      usuarioId: this.usuarioId,
      telefone: this.dadosCliente.telefone,
      nomeCliente: this.dadosCliente.nome,
      cpfCnpj: this.dadosCliente.cpfCnpj || undefined,
      subtotal: this.converterParaDecimal(subtotal),
      taxaEntrega: this.converterParaDecimal(taxaEntrega),
      total: this.converterParaDecimal(total),
      formaPagamento: 'DINHEIRO', // Pode ser expandido depois
      itens: this.itensCarrinho.map(item => ({
        produtoId: item.produto.id,
        quantidade: item.quantidade,
        precoUnitario: this.converterParaDecimal(item.produto.preco),
        subtotal: this.converterParaDecimal(item.subtotal)
      }))
    };

    this.orderService.createManualOrder(pedidoManual).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Pedido criado com sucesso!'
        });
        
        // Aguarda um pouco para o usuário ver a mensagem
        setTimeout(() => {
          this.fecharModal();
          this.pedidoCriado.emit();
        }, 1000);
      },
      error: (error) => {
        console.error('Erro ao criar pedido:', error);
        let errorMessage = 'Erro ao criar o pedido';
        
        if (error.error?.message) {
          if (Array.isArray(error.error.message)) {
            errorMessage = error.error.message.join(', ');
          } else {
            errorMessage = error.error.message;
          }
        }
        
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: errorMessage
        });
      }
    });
  }

  voltarTelaInicial(): void {
    this.categoriaSelecionada = null;
    this.produtoSelecionado = null;
    this.produtos = [];
    this.quantidade = 1;
    this.itensCarrinho = [];
    this.dadosCliente = {
      telefone: '',
      nome: '',
      cpfCnpj: ''
    };
    this.searchTerm = '';
  }

  fecharModal(): void {
    this.voltarTelaInicial();
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
