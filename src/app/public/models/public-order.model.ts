// Models para pedidos públicos

export enum TipoPedido {
  ENTREGA = 'ENTREGA',
  RETIRADA = 'RETIRADA',
}

export enum FormaPagamento {
  DINHEIRO = 'DINHEIRO',
  CARTAO_DEBITO = 'CARTAO_DEBITO',
  CARTAO_CREDITO = 'CARTAO_CREDITO',
  PIX = 'PIX',
}

export interface PublicOrderRequest {
  nomeCliente: string;
  telefoneCliente: string;
  emailCliente?: string;
  tipoPedido: TipoPedido;
  endereco?: AddressData;
  itens: OrderItem[];
  formaPagamento: FormaPagamento;
  trocoPara?: number;
  observacoes?: string;
}

export interface OrderItem {
  produtoId: number;
  quantidade: number;
  observacoes?: string;
  adicionais: OrderAdicional[];
}

export interface OrderAdicional {
  adicionalId: number;
  quantidade: number;
}

export interface AddressData {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  referencia?: string;
}

export interface PublicOrderResponse {
  id: number;
  numero: string;
  status: string;
  total: number;
  tempoEstimado?: number;
  createdAt: Date;
}
