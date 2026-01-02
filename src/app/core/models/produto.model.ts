export interface Produto {
  id: number;
  empresaId: number;
  categoriaId: number;
  nome: string;
  descricao?: string;
  preco: number;
  imagem?: string;
  disponivel: boolean;
  destaque: boolean;
  vendidoPorKg: boolean;
  ordem: number;
  tempoPreparo?: number;
  createdAt?: Date;
  updatedAt?: Date;
  
  // Relacionamentos
  categoria?: Categoria;
  gruposProduto?: ProdutoGrupoAdicional[];
  _count?: {
    gruposProduto: number;
  };
}

export interface ProdutoGrupoAdicional {
  id: number;
  produtoId: number;
  grupoAdicionalId: number;
  ordem: number;
  grupoAdicional?: GrupoAdicional;
}

export interface CreateProdutoDto {
  empresaId: number;
  categoriaId: number;
  nome: string;
  descricao?: string;
  preco: number;
  imagem?: string;
  disponivel?: boolean;
  destaque?: boolean;
  vendidoPorKg?: boolean;
  ordem?: number;
  tempoPreparo?: number;
  gruposAdicionaisIds?: number[];
}

export interface UpdateProdutoDto extends Partial<CreateProdutoDto> {
  id?: number;
}

// Imports necessários
import { Categoria } from './categoria.model';
import { GrupoAdicional } from './adicional.model';
