export interface ConfiguracaoLinkPublico {
  id?: number;
  empresaId: number;
  
  // Banner
  bannerUrl?: string;
  bannerMobileUrl?: string;
  exibirBanner?: boolean;
  mensagemBanner?: string;
  
  // Cores
  corPrimaria?: string;
  corSecundaria?: string;
  corAcento?: string;
  corTexto?: string;
  corFundo?: string;
  corHeaderBackground?: string;
  corHeaderTexto?: string;
  
  // Logos
  logoUrl?: string;
  faviconUrl?: string;
  logoHeaderUrl?: string;
  
  // Estilo
  estiloBotao?: 'rounded' | 'square' | 'pill';
  estiloCard?: 'shadow' | 'border' | 'flat';
  tamanhoFonte?: 'small' | 'medium' | 'large';
  
  // Exibição
  exibirPromocoes?: boolean;
  exibirDestaques?: boolean;
  
  // SEO
  metaTitulo?: string;
  metaDescricao?: string;
  metaKeywords?: string;
  
  // Redes Sociais
  urlFacebook?: string;
  urlInstagram?: string;
  urlTwitter?: string;
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

// Enums para tipos de estilo
export enum EstiloBotao {
  SQUARE = 'square',
  ROUNDED = 'rounded',
  PILL = 'pill'
}

export enum EstiloCard {
  FLAT = 'flat',
  BORDER = 'border',
  SHADOW = 'shadow'
}

export enum TamanhoFonte {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large'
}

export interface CreateConfiguracaoDto {
  empresaId: number;
  bannerUrl?: string;
  bannerMobileUrl?: string;
  exibirBanner?: boolean;
  mensagemBanner?: string;
  corPrimaria?: string;
  corSecundaria?: string;
  corAcento?: string;
  corTexto?: string;
  corFundo?: string;
  corHeaderBackground?: string;
  corHeaderTexto?: string;
  logoUrl?: string;
  faviconUrl?: string;
  logoHeaderUrl?: string;
  estiloBotao?: 'rounded' | 'square' | 'pill';
  estiloCard?: 'shadow' | 'border' | 'flat';
  tamanhoFonte?: 'small' | 'medium' | 'large';
  exibirPromocoes?: boolean;
  exibirDestaques?: boolean;
  metaTitulo?: string;
  metaDescricao?: string;
  metaKeywords?: string;
  urlFacebook?: string;
  urlInstagram?: string;
  urlTwitter?: string;
}

export interface UpdateConfiguracaoDto extends Partial<CreateConfiguracaoDto> {}
