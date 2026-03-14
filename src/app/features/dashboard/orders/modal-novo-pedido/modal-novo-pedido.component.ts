import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { RadioButtonModule } from 'primeng/radiobutton';
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

interface DadosEndereco {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  referencia?: string;
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
    ToastModule,
    RadioButtonModule
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

  // Tipo de pedido
  tipoPedido: 'entrega' | 'retirada' = 'retirada';

  // Dados de endereço (para entrega)
  dadosEndereco: DadosEndereco = {
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    referencia: ''
  };

  // Controle de visualização de endereço
  mostrarEnderecoEntrega: boolean = false;
  
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
    const subtotal = this.calcularSubtotal();
    const taxaEntrega = this.calcularTaxaEntrega();
    return subtotal + taxaEntrega;
  }

  calcularTaxaEntrega(): number {
    return this.tipoPedido === 'entrega' ? 5.00 : 0;
  }

  selecionarTipoPedido(tipo: 'entrega' | 'retirada'): void {
    this.tipoPedido = tipo;
    this.mostrarEnderecoEntrega = false;
  }

  toggleEnderecoEntrega(): void {
    if (this.tipoPedido === 'entrega') {
      this.mostrarEnderecoEntrega = !this.mostrarEnderecoEntrega;
    }
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
    return this.itensCarrinho.length > 0;
  }

  gerarPedido(): void {
    if (!this.podeConcluirPedido()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Adicione pelo menos um item ao pedido'
      });
      return;
    }

    // Validar telefone obrigatório
    if (!this.dadosCliente.telefone.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Informe o telefone do cliente'
      });
      return;
    }

    // Validar endereço se for entrega
    if (this.tipoPedido === 'entrega') {
      if (!this.dadosEndereco.cep.trim() || !this.dadosEndereco.logradouro.trim() || 
          !this.dadosEndereco.numero.trim() || !this.dadosEndereco.bairro.trim() || 
          !this.dadosEndereco.cidade.trim() || !this.dadosEndereco.uf.trim()) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Atenção',
          detail: 'Preencha todos os campos obrigatórios do endereço'
        });
        return;
      }
    }

    const subtotal = this.calcularSubtotal();
    const taxaEntrega = this.calcularTaxaEntrega();
    const total = this.calcularTotal();

    // FASE 2: Novo formato do DTO com cliente estruturado
    const pedidoManual: any = {
      empresaId: this.empresaId,
      usuarioId: this.usuarioId,
      
      // Cliente estruturado (telefone obrigatório)
      cliente: {
        telefone: this.dadosCliente.telefone.trim(),
        nome: this.dadosCliente.nome.trim() || undefined,
        cpf: this.dadosCliente.cpfCnpj?.trim() || undefined
      },
      
      // Tipo do pedido (agora pode ser entrega ou retirada)
      tipoPedido: this.tipoPedido,
      
      numero: `BAL-${Date.now()}`,
      subtotal: this.converterParaDecimal(subtotal),
      taxaEntrega: this.converterParaDecimal(taxaEntrega),
      total: this.converterParaDecimal(total),
      formaPagamento: 'dinheiro', // Padrão, pode ser alterado depois
      
      // Observações agora só para observações reais do pedido
      observacoes: undefined,
      
      itens: this.itensCarrinho.map(item => ({
        produtoId: item.produto.id,
        quantidade: item.quantidade,
        precoUnitario: this.converterParaDecimal(item.produto.preco),
        subtotal: this.converterParaDecimal(item.subtotal)
      }))
    };

    // Adicionar endereço se for entrega
    if (this.tipoPedido === 'entrega') {
      pedidoManual.endereco = {
        cep: this.dadosEndereco.cep.trim(),
        logradouro: this.dadosEndereco.logradouro.trim(),
        numero: this.dadosEndereco.numero.trim(),
        complemento: this.dadosEndereco.complemento?.trim() || undefined,
        bairro: this.dadosEndereco.bairro.trim(),
        cidade: this.dadosEndereco.cidade.trim(),
        uf: this.dadosEndereco.uf.trim().toUpperCase(),
        referencia: this.dadosEndereco.referencia?.trim() || undefined
      };
    }

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
    this.dadosEndereco = {
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: '',
      referencia: ''
    };
    this.tipoPedido = 'retirada';
    this.mostrarEnderecoEntrega = false;
    this.searchTerm = '';
  }

  fecharModal(): void {
    this.voltarTelaInicial();
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
