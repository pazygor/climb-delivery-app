export interface CheckoutFormData {
  cliente: {
    telefone: string;
    nome?: string;
    email?: string;
    cpf?: string;
  };
  tipoPedido: 'entrega' | 'retirada';
  endereco?: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
    referencia?: string;
  };
  formaPagamento: 'dinheiro' | 'cartao' | 'pix';
  trocoPara?: number;
  observacoes?: string;
}

export interface EnderecoViaCep {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string; // cidade
  uf: string;
  erro?: boolean;
}

export interface CreatePedidoDto {
  cliente: {
    telefone: string;
    nome?: string;
    email?: string;
    cpf?: string;
  };
  tipoPedido: 'entrega' | 'retirada';
  endereco?: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
    referencia?: string;
  };
  itens: ItemPedidoDto[];
  formaPagamento: 'dinheiro' | 'cartao' | 'pix';
  trocoPara?: number;
  observacoes?: string;
}

export interface ItemPedidoDto {
  produtoId: number;
  quantidade: number;
  observacoes?: string;
  adicionais: AdicionalItemDto[];
}

export interface AdicionalItemDto {
  adicionalId: number;
  quantidade: number;
}

export interface Pedido {
  id: number;
  numero: string;
  empresaId: number;
  clienteId: number;
  tipoPedido: string;
  subtotal: number;
  taxaEntrega: number;
  total: number;
  formaPagamento: string;
  trocoPara?: number;
  observacoes?: string;
  tempoEstimado?: number;
  createdAt: string;
  updatedAt: string;
  status: StatusPedido;
  cliente: Cliente;
  empresa?: EmpresaInfo;
  itens: ItemPedido[];
}

export interface Cliente {
  id: number;
  nome?: string;
  telefone: string;
  email?: string;
  cpf?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  referencia?: string;
}

export interface EmpresaInfo {
  id: number;
  nomeFantasia?: string;
  razaoSocial: string;
  whatsapp?: string;
  telefone?: string;
  logo?: string;
}

export interface StatusPedido {
  id: number;
  codigo: string;
  nome: string;
  descricao?: string;
  cor?: string;
}

export interface ItemPedido {
  id: number;
  produtoId: number;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  observacoes?: string;
  produto: {
    id: number;
    nome: string;
    descricao?: string;
    preco: number;
    imagem?: string;
  };
  adicionais: ItemAdicionalPedido[];
}

export interface ItemAdicionalPedido {
  id: number;
  adicionalId: number;
  quantidade: number;
  preco: number;
  adicional: {
    id: number;
    nome: string;
    preco: number;
  };
}
