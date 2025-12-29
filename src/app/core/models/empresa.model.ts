export interface Empresa {
  id: number;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  telefone?: string;
  email?: string;
  // Endereço
  endereco: string;
  numero?: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  // Configurações
  ativo: boolean;
  logo?: string;
  horarioAbertura?: string;
  horarioFechamento?: string;
  taxaEntrega: number;
  tempoMedioEntrega?: number;
  pedidoMinimo?: number;
  descricao?: string;
  chavePix?: string;
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEmpresaDto {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  telefone?: string;
  email?: string;
  endereco: string;
  numero?: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  ativo?: boolean;
  logo?: string;
  horarioAbertura?: string;
  horarioFechamento?: string;
  taxaEntrega?: number;
  tempoMedioEntrega?: number;
  pedidoMinimo?: number;
  descricao?: string;
  chavePix?: string;
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
}

export interface UpdateEmpresaDto extends Partial<CreateEmpresaDto> {}
