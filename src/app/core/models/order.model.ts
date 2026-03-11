// Interface que mapeia o modelo Pedido do backend
export interface Order {
  id: number;
  empresaId: number;
  usuarioId?: number | null;
  clienteId?: number | null;
  enderecoId?: number | null;
  numero: string;
  tipoPedido: string;
  status: {
    id: number;
    codigo: string;
    nome: string;
    descricao?: string;
    cor?: string;
    ordem: number;
    ativo: boolean;
  };
  subtotal: number;
  taxaEntrega: number;
  total: number;
  formaPagamento: string;
  trocoPara?: number | null;
  observacoes?: string;
  tempoEstimado?: number;
  motivoCancelamento?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  
  // Relações incluídas nas queries
  empresa?: {
    id: number;
    nomeFantasia: string;
    logo?: string;
  };
  usuario?: {
    id: number;
    nome: string;
    telefone?: string;
    email?: string;
  };
  cliente?: Cliente;
  endereco?: {
    id: number;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  itens?: OrderItem[];
  _count?: {
    itens: number;
  };
}

export interface Cliente {
  id: number;
  empresaId: number;
  nome?: string | null;
  telefone: string;
  email?: string | null;
  cpf?: string | null;
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  uf?: string | null;
  referencia?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface OrderItem {
  id: number;
  pedidoId: number;
  produtoId: number;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  observacoes?: string;
  
  produto?: {
    id: number;
    nome: string;
    descricao?: string;
    preco: number;
  };
  adicionais?: ItemAdicional[];
}

export interface ItemAdicional {
  id: number;
  itemPedidoId: number;
  adicionalId: number;
  quantidade: number;
  preco: number;
  
  adicional?: {
    id: number;
    nome: string;
    descricao?: string;
    preco: number;
  };
}

// Enum para status dos pedidos (mantém compatibilidade com backend)
export enum OrderStatus {
  PENDENTE = 'pendente',           // Em Análise
  CONFIRMADO = 'confirmado',       // Confirmado
  EM_PREPARO = 'em_preparo',       // Em Produção
  PRONTO = 'pronto',               // Pronto para Entrega
  EM_ENTREGA = 'em_entrega',       // Saiu para Entrega
  ENTREGUE = 'entregue',           // Entregue
  CANCELADO = 'cancelado'          // Cancelado
}

export interface OrderStatusColumn {
  title: string;
  status: string[];
  color: string;
}

// DTO para criar pedido
export interface CreateOrderDto {
  empresaId: number;
  usuarioId: number;
  enderecoId: number;
  numero: string;
  statusId: number;
  subtotal: number;
  taxaEntrega: number;
  total: number;
  formaPagamento: string;
  observacoes?: string;
  tempoEstimado?: number;
  itens: CreateOrderItemDto[];
}

export interface CreateOrderItemDto {
  produtoId: number;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  observacoes?: string;
  adicionais?: CreateItemAdicionalDto[];
}

export interface CreateItemAdicionalDto {
  adicionalId: number;
  quantidade: number;
  preco: number;
}

// DTO para atualizar pedido
export interface UpdateOrderDto {
  status?: string;
  observacoes?: string;
  tempoEstimado?: number;
  motivoCancelamento?: string;
}
