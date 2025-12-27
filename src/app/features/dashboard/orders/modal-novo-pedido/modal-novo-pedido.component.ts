import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { AuthService } from '../../../../core/services/auth.service';
import { CategoriaService } from '../../../../core/services/categoria.service';
import { ProdutoService } from '../../../../core/services/produto.service';
import { OrderService } from '../../../../core/services/order.service';
import { Categoria } from '../../../../core/models/categoria.model';
import { Produto } from '../../../../core/models/produto.model';
import { GrupoAdicional, Adicional } from '../../../../core/models/adicional.model';
import { forkJoin } from 'rxjs';

interface Cliente {
  nome: string;
  telefone: string;
  endereco: string;
}

interface AdicionalSelecionado {
  id: number;
  nome: string;
  valor: number;
}

interface GrupoAdicionalSelecionado {
  grupoId: number;
  grupoNome: string;
  adicionais: AdicionalSelecionado[];
}

interface ProdutoSelecionado {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
  observacao: string;
  gruposAdicionais: GrupoAdicionalSelecionado[];
  subtotal: number;
}

// Produto com gruposAdicionais expandido
interface ProdutoComGrupos extends Produto {
  gruposAdicionais: GrupoAdicional[];
}

interface CategoriaComProdutos extends Categoria {
  produtos: ProdutoComGrupos[];
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
    InputNumberModule
  ],
  templateUrl: './modal-novo-pedido.component.html',
  styleUrls: ['./modal-novo-pedido.component.scss']
})
export class ModalNovoPedidoComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() pedidoCriado = new EventEmitter<void>();

  empresaId: number = 0;
  usuarioId: number = 0;
  
  // Dados para seleção
  categorias: CategoriaComProdutos[] = [];
  
  // Etapa atual do modal (1: cliente, 2: produtos, 3: pagamento)
  etapaAtual = 1;
  
  // Dados do cliente (cliente final do pedido)
  cliente: Cliente = {
    nome: '',
    telefone: '',
    endereco: ''
  };
  
  // Produtos selecionados
  produtosSelecionados: ProdutoSelecionado[] = [];
  
  // Produto sendo configurado
  produtoEmConfiguracao: ProdutoComGrupos | null = null;
  quantidadeAtual = 1;
  observacaoAtual = '';
  gruposAdicionaisSelecionados: GrupoAdicionalSelecionado[] = [];
  
  // Dados de pagamento
  formaPagamento: 'PIX' | 'CARTAO' | 'DINHEIRO' = 'PIX';
  trocoNecessario = false;
  valorTroco = 0;
  
  // Loading
  salvando = false;

  constructor(
    private authService: AuthService,
    private categoriaService: CategoriaService,
    private produtoService: ProdutoService,
    private orderService: OrderService
  ) {
    const currentUser = this.authService.getCurrentUser();
    this.empresaId = currentUser?.empresaId || 0;
    this.usuarioId = Number(currentUser?.id) || 0;
  }

  onShow(): void {
    this.resetarModal();
    this.carregarDados();
  }

  carregarDados(): void {
    forkJoin({
      categorias: this.categoriaService.getByEmpresa(this.empresaId),
      produtos: this.produtoService.getByEmpresa(this.empresaId)
    }).subscribe({
      next: ({ categorias, produtos }) => {
        // Organizar produtos dentro das categorias
        this.categorias = categorias.map(cat => ({
          ...cat,
          produtos: produtos
            .filter(p => p.categoriaId === cat.id)
            .map(p => {
              // Extrair gruposAdicionais do gruposProduto
              const gruposAdicionais = (p.gruposProduto || [])
                .map(gp => gp.grupoAdicional)
                .filter((g): g is GrupoAdicional => g !== undefined);
              
              return {
                ...p,
                gruposAdicionais
              } as ProdutoComGrupos;
            })
        }));
      },
      error: (error) => {
        console.error('Erro ao carregar dados:', error);
      }
    });
  }

  resetarModal(): void {
    this.etapaAtual = 1;
    this.cliente = { nome: '', telefone: '', endereco: '' };
    this.produtosSelecionados = [];
    this.produtoEmConfiguracao = null;
    this.quantidadeAtual = 1;
    this.observacaoAtual = '';
    this.gruposAdicionaisSelecionados = [];
    this.formaPagamento = 'PIX';
    this.trocoNecessario = false;
    this.valorTroco = 0;
  }

  fecharModal(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  // === ETAPA 1: CLIENTE ===
  
  proximaEtapa(): void {
    if (this.etapaAtual === 1 && this.validarCliente()) {
      this.etapaAtual = 2;
    } else if (this.etapaAtual === 2 && this.produtosSelecionados.length > 0) {
      this.etapaAtual = 3;
    }
  }

  voltarEtapa(): void {
    if (this.etapaAtual > 1) {
      this.etapaAtual--;
    }
  }

  validarCliente(): boolean {
    return this.cliente.nome.trim() !== '' &&
           this.cliente.telefone.trim() !== '' &&
           this.cliente.endereco.trim() !== '';
  }

  // === ETAPA 2: PRODUTOS ===

  selecionarProduto(produto: ProdutoComGrupos): void {
    this.produtoEmConfiguracao = produto;
    this.quantidadeAtual = 1;
    this.observacaoAtual = '';
    this.gruposAdicionaisSelecionados = [];
    
    // Inicializar grupos de adicionais
    if (produto.gruposAdicionais && produto.gruposAdicionais.length > 0) {
      this.gruposAdicionaisSelecionados = produto.gruposAdicionais.map((grupo: GrupoAdicional) => ({
        grupoId: grupo.id,
        grupoNome: grupo.nome,
        adicionais: []
      }));
    }
  }

  cancelarConfiguracao(): void {
    this.produtoEmConfiguracao = null;
    this.quantidadeAtual = 1;
    this.observacaoAtual = '';
    this.gruposAdicionaisSelecionados = [];
  }

  toggleAdicional(grupoIndex: number, adicional: Adicional, grupo: GrupoAdicional): void {
    const grupoSelecionado = this.gruposAdicionaisSelecionados[grupoIndex];
    const adicionalIndex = grupoSelecionado.adicionais.findIndex(a => a.id === adicional.id);

    if (adicionalIndex >= 0) {
      // Remover adicional
      grupoSelecionado.adicionais.splice(adicionalIndex, 1);
    } else {
      // Adicionar adicional
      if (grupo.tipoSelecao === 'RADIO') {
        // Para RADIO, substitui a seleção
        grupoSelecionado.adicionais = [{
          id: adicional.id,
          nome: adicional.nome,
          valor: adicional.preco
        }];
      } else {
        // Para CHECKBOX, adiciona se não exceder o máximo
        if (grupoSelecionado.adicionais.length < grupo.maximoSelecao) {
          grupoSelecionado.adicionais.push({
            id: adicional.id,
            nome: adicional.nome,
            valor: adicional.preco
          });
        }
      }
    }
  }

  isAdicionalSelecionado(grupoIndex: number, adicionalId: number): boolean {
    return this.gruposAdicionaisSelecionados[grupoIndex]?.adicionais
      .some(a => a.id === adicionalId) || false;
  }

  adicionarProdutoAoPedido(): void {
    if (!this.produtoEmConfiguracao) return;

    const subtotal = this.calcularSubtotalProduto();
    
    this.produtosSelecionados.push({
      id: this.produtoEmConfiguracao.id,
      nome: this.produtoEmConfiguracao.nome,
      preco: this.produtoEmConfiguracao.preco,
      quantidade: this.quantidadeAtual,
      observacao: this.observacaoAtual,
      gruposAdicionais: JSON.parse(JSON.stringify(this.gruposAdicionaisSelecionados)),
      subtotal
    });

    this.cancelarConfiguracao();
  }

  calcularSubtotalProduto(): number {
    if (!this.produtoEmConfiguracao) return 0;
    
    let valorAdicionais = 0;
    this.gruposAdicionaisSelecionados.forEach(grupo => {
      grupo.adicionais.forEach(adicional => {
        valorAdicionais += adicional.valor;
      });
    });

    return (this.produtoEmConfiguracao.preco + valorAdicionais) * this.quantidadeAtual;
  }

  removerProduto(index: number): void {
    this.produtosSelecionados.splice(index, 1);
  }

  editarProduto(index: number): void {
    const produtoSelecionado = this.produtosSelecionados[index];
    
    // Encontrar o produto original
    const produtoOriginal = this.categorias
      .flatMap(c => c.produtos)
      .find(p => p?.id === produtoSelecionado.id);
    
    if (produtoOriginal) {
      this.produtoEmConfiguracao = produtoOriginal;
      this.quantidadeAtual = produtoSelecionado.quantidade;
      this.observacaoAtual = produtoSelecionado.observacao;
      this.gruposAdicionaisSelecionados = JSON.parse(JSON.stringify(produtoSelecionado.gruposAdicionais));
      
      // Remover o produto da lista (será readicionado ao confirmar)
      this.produtosSelecionados.splice(index, 1);
    }
  }

  calcularTotal(): number {
    return this.produtosSelecionados.reduce((total, produto) => total + produto.subtotal, 0);
  }

  // === ETAPA 3: PAGAMENTO ===

  onFormaPagamentoChange(): void {
    if (this.formaPagamento !== 'DINHEIRO') {
      this.trocoNecessario = false;
      this.valorTroco = 0;
    }
  }

  // === SALVAR PEDIDO ===

  salvarPedido(): void {
    if (this.salvando) return;

    this.salvando = true;

    // Calcula subtotal e total
    const subtotal = this.calcularTotal();
    const taxaEntrega = 5.00; // Pode ser parametrizável depois
    const total = subtotal + taxaEntrega;
    
    // Gera número único do pedido
    const numero = `PED-${Date.now()}`;
    
    // Monta observações com dados do cliente
    const observacoesCliente = `Cliente: ${this.cliente.nome} | Telefone: ${this.cliente.telefone}`;

    const pedido = {
      empresaId: this.empresaId,
      usuarioId: this.usuarioId, // Atendente logado
      enderecoEntrega: this.cliente.endereco, // Será usado para criar o endereço
      numero: numero,
      status: 'pendente',
      subtotal: subtotal,
      taxaEntrega: taxaEntrega,
      total: total,
      formaPagamento: this.formaPagamento,
      observacoes: observacoesCliente,
      trocoNecessario: this.trocoNecessario,
      valorTroco: this.trocoNecessario ? this.valorTroco : 0,
      itens: this.produtosSelecionados.map(produto => ({
        produtoId: produto.id,
        quantidade: produto.quantidade,
        precoUnitario: produto.preco,
        subtotal: produto.subtotal,
        observacoes: produto.observacao,
        adicionais: produto.gruposAdicionais.flatMap(grupo =>
          grupo.adicionais.map(adicional => ({
            adicionalId: adicional.id,
            quantidade: 1,
            preco: adicional.valor
          }))
        )
      }))
    };

    this.orderService.createManualOrder(pedido).subscribe({
      next: () => {
        this.salvando = false;
        this.fecharModal();
        this.pedidoCriado.emit();
      },
      error: (error) => {
        console.error('Erro ao criar pedido:', error);
        this.salvando = false;
        alert('Erro ao criar pedido. Por favor, tente novamente.');
      }
    });
  }

  getEtapaLabel(): string {
    switch (this.etapaAtual) {
      case 1: return 'Dados do Cliente';
      case 2: return 'Selecionar Produtos';
      case 3: return 'Pagamento e Confirmação';
      default: return '';
    }
  }
}
