export enum TipoSelecaoGrupo {
  RADIO = 'RADIO',       // Escolha única (radio buttons)
  CHECKBOX = 'CHECKBOX'  // Múltipla escolha (checkboxes)
}

export interface GrupoAdicional {
  id: number;
  empresaId: number;
  nome: string;
  descricao?: string;
  minimo: number;
  maximo: number;
  obrigatorio: boolean;
  tipoPrecificacao: string;
  tipoSelecao: TipoSelecaoGrupo;
  minimoSelecao: number;
  maximoSelecao: number;
  ordem: number;
  ativo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  
  // Relacionamentos
  adicionais?: Adicional[];
  _count?: {
    adicionais: number;
    produtos: number;
  };
}

export interface Adicional {
  id: number;
  grupoAdicionalId: number;
  nome: string;
  descricao?: string;
  preco: number;
  ordem: number;
  ativo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateGrupoAdicionalDto {
  nome: string;
  descricao?: string;
  minimo?: number;
  maximo?: number;
  obrigatorio?: boolean;
  tipoPrecificacao?: string;
  tipoSelecao?: TipoSelecaoGrupo;
  minimoSelecao?: number;
  maximoSelecao?: number;
  ordem?: number;
  ativo?: boolean;
}

export interface UpdateGrupoAdicionalDto extends Partial<CreateGrupoAdicionalDto> {
  id?: number;
}

export interface CreateAdicionalDto {
  grupoAdicionalId: number;
  nome: string;
  descricao?: string;
  preco?: number;
  ordem?: number;
  ativo?: boolean;
}

export interface UpdateAdicionalDto extends Partial<CreateAdicionalDto> {
  id?: number;
}
