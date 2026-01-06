// Models para o módulo público

export interface PublicRestaurant {
  id: number;
  nomeFantasia: string;
  razaoSocial: string;
  logo?: string;
  telefone?: string;
  whatsapp?: string;
  horarioAbertura?: string;
  horarioFechamento?: string;
  taxaEntrega: number;
  tempoMedioEntrega?: number;
  endereco: string;
  numero?: string;
  bairro: string;
  cidade: string;
  uf: string;
  ativo: boolean;
}

export interface PublicCategoria {
  id: number;
  nome: string;
  descricao?: string;
  ordem: number;
  produtos: PublicProduto[];
}

export interface PublicProduto {
  id: number;
  nome: string;
  descricao?: string;
  preco: number;
  imagem?: string;
  disponivel: boolean;
  destaque: boolean;
  tempoPreparo?: number;
  gruposProduto: ProdutoGrupoAdicional[];
}

export interface ProdutoGrupoAdicional {
  id: number;
  ordem: number;
  grupoAdicional: PublicGrupoAdicional;
}

export interface PublicGrupoAdicional {
  id: number;
  nome: string;
  descricao?: string;
  minimo: number;
  maximo: number;
  obrigatorio: boolean;
  tipoSelecao: 'RADIO' | 'CHECKBOX';
  minimoSelecao: number;
  maximoSelecao: number;
  ordem: number;
  adicionais: PublicAdicional[];
}

export interface PublicAdicional {
  id: number;
  nome: string;
  descricao?: string;
  preco: number;
  ordem: number;
}

export interface ConfiguracaoVisual {
  id: number;
  empresaId: number;
  // Banner
  bannerUrl?: string;
  bannerMobileUrl?: string;
  exibirBanner: boolean;
  mensagemBanner?: string;
  // Cores
  corPrimaria: string;
  corSecundaria: string;
  corAcento: string;
  corTexto: string;
  corFundo: string;
  corHeaderBackground: string;
  corHeaderTexto: string;
  // Logos
  logoUrl?: string;
  faviconUrl?: string;
  logoHeaderUrl?: string;
  // Estilo
  estiloBotao: 'rounded' | 'square' | 'pill';
  estiloCard: 'shadow' | 'border' | 'flat';
  tamanhoFonte: 'small' | 'medium' | 'large';
  // Exibição
  exibirPromocoes: boolean;
  exibirDestaques: boolean;
  // SEO
  metaTitulo?: string;
  metaDescricao?: string;
  metaKeywords?: string;
  // Redes Sociais
  urlFacebook?: string;
  urlInstagram?: string;
  urlTwitter?: string;
}

export interface CardapioResponse {
  empresa: PublicRestaurant;
  categorias: PublicCategoria[];
  configuracaoVisual?: ConfiguracaoVisual;
}
