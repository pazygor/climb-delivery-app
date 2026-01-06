import { PublicProduto, PublicAdicional } from './public-restaurant.model';

export interface CartItem {
  id: string; // UUID temporário
  produto: PublicProduto;
  quantidade: number;
  observacoes?: string;
  adicionaisSelecionados: CartAdicional[];
  precoTotal: number; // produto + adicionais * quantidade
}

export interface CartAdicional {
  adicional: PublicAdicional;
  quantidade: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  taxaEntrega: number;
  total: number;
  quantidadeItens: number;
}
