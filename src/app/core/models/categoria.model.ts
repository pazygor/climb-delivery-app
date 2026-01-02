export interface Categoria {
  id: number;
  empresaId: number;
  nome: string;
  descricao?: string;
  ordem: number;
  ativo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  
  // Relacionamentos
  produtos?: Produto[];
  _count?: {
    produtos: number;
  };
}

export interface CreateCategoriaDto {
  empresaId: number;
  nome: string;
  descricao?: string;
  ordem?: number;
  ativo?: boolean;
}

export interface UpdateCategoriaDto extends Partial<CreateCategoriaDto> {
  id?: number;
}

// Import necessário para evitar erro circular
import { Produto } from './produto.model';
