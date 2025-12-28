# 🌐 Implementação do Link Público - Cardápio Digital

**Documento Técnico de Implementação**

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Backend - API](#backend---api)
4. [Frontend - Angular](#frontend---angular)
5. [Fluxo de Navegação](#fluxo-de-navegação)
6. [Design & UX](#design--ux)
7. [Responsividade](#responsividade)
8. [Checklist de Implementação](#checklist-de-implementação)

---

## 🎯 Visão Geral

### Objetivo
Criar uma área pública totalmente funcional onde clientes podem:
- Visualizar o cardápio do restaurante
- Adicionar produtos ao carrinho com adicionais
- Realizar pedidos completos
- Acompanhar o status do pedido

### URL Pública
```
https://climbdelivery.app/{slug-do-restaurante}
```

### Referência Visual
Baseado nos prints fornecidos (similar ao iFood/Rappi):
- Header fixo com logo e navegação
- Banner hero grande
- Cards de produtos com imagens
- Categorias organizadas
- Carrinho flutuante lateral
- Design limpo e moderno

---

## 🏗️ Arquitetura

### Estrutura de Pastas

```
src/app/
├── public/                           # Módulo público (novo)
│   ├── public.routes.ts
│   ├── layout/
│   │   ├── public-layout.component.ts
│   │   ├── public-layout.component.html
│   │   ├── public-layout.component.scss
│   │   ├── public-header/
│   │   │   ├── public-header.component.ts
│   │   │   ├── public-header.component.html
│   │   │   └── public-header.component.scss
│   │   └── public-footer/
│   │       ├── public-footer.component.ts
│   │       ├── public-footer.component.html
│   │       └── public-footer.component.scss
│   ├── pages/
│   │   ├── home/                     # Página principal do cardápio
│   │   │   ├── home.component.ts
│   │   │   ├── home.component.html
│   │   │   ├── home.component.scss
│   │   │   └── components/
│   │   │       ├── product-card/
│   │   │       ├── category-nav/
│   │   │       ├── restaurant-info/
│   │   │       └── product-modal/
│   │   ├── cart/                     # Drawer/Sidebar do carrinho
│   │   │   ├── cart.component.ts
│   │   │   ├── cart.component.html
│   │   │   └── cart.component.scss
│   │   ├── checkout/                 # Finalização do pedido
│   │   │   ├── checkout.component.ts
│   │   │   ├── checkout.component.html
│   │   │   ├── checkout.component.scss
│   │   │   └── components/
│   │   │       ├── customer-form/
│   │   │       ├── address-form/
│   │   │       ├── payment-form/
│   │   │       └── order-summary/
│   │   ├── order-confirmation/       # Confirmação do pedido
│   │   │   ├── order-confirmation.component.ts
│   │   │   ├── order-confirmation.component.html
│   │   │   └── order-confirmation.component.scss
│   │   └── not-found/                # 404 para slug inválido
│   │       ├── not-found.component.ts
│   │       ├── not-found.component.html
│   │       └── not-found.component.scss
│   ├── services/
│   │   ├── public-restaurant.service.ts
│   │   ├── public-cart.service.ts
│   │   ├── public-order.service.ts
│   │   └── cep.service.ts
│   └── models/
│       ├── public-restaurant.model.ts
│       ├── cart.model.ts
│       └── public-order.model.ts
```

---

## 🔧 Backend - API

### 1️⃣ Adicionar campo `slug` na Empresa

#### Migration Prisma

```prisma
// Arquivo: prisma/schema.prisma

model Empresa {
  id                Int         @id @default(autoincrement())
  cnpj              String      @unique @db.VarChar(14)
  razaoSocial       String      @map("razao_social")
  nomeFantasia      String?     @map("nome_fantasia")
  slug              String      @unique @db.VarChar(100) // NOVO CAMPO
  telefone          String?
  email             String?
  whatsapp          String?     // NOVO CAMPO para contato
  // ... resto dos campos
}
```

#### Criar Migration

```bash
cd climb-delivery-api
npx prisma migrate dev --name add_slug_to_empresa
```

---

### 2️⃣ Criar Decorator @Public()

```typescript
// Arquivo: climb-delivery-api/src/common/decorators/public.decorator.ts

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

#### Atualizar JWT Guard

```typescript
// Arquivo: climb-delivery-api/src/auth/jwt-auth.guard.ts

import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }
    
    return super.canActivate(context);
  }
}
```

---

### 3️⃣ Criar Módulo Public

#### Public Module

```typescript
// Arquivo: climb-delivery-api/src/public/public.module.ts

import { Module } from '@nestjs/common';
import { PublicCardapioController } from './controllers/public-cardapio.controller';
import { PublicPedidoController } from './controllers/public-pedido.controller';
import { PublicService } from './public.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PublicCardapioController, PublicPedidoController],
  providers: [PublicService],
})
export class PublicModule {}
```

#### Public Service

```typescript
// Arquivo: climb-delivery-api/src/public/public.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublicService {
  constructor(private prisma: PrismaService) {}

  /**
   * Busca empresa por slug
   */
  async getEmpresaBySlug(slug: string) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { slug },
      select: {
        id: true,
        nomeFantasia: true,
        razaoSocial: true,
        logo: true,
        telefone: true,
        whatsapp: true,
        horarioAbertura: true,
        horarioFechamento: true,
        taxaEntrega: true,
        tempoMedioEntrega: true,
        endereco: true,
        numero: true,
        bairro: true,
        cidade: true,
        uf: true,
        ativo: true,
      },
    });

    if (!empresa) {
      throw new NotFoundException('Restaurante não encontrado');
    }

    if (!empresa.ativo) {
      throw new NotFoundException('Restaurante temporariamente indisponível');
    }

    return empresa;
  }

  /**
   * Busca cardápio completo do restaurante
   */
  async getCardapio(slug: string) {
    const empresa = await this.getEmpresaBySlug(slug);

    // Busca configurações visuais do restaurante
    const configuracaoVisual = await this.prisma.configuracaoLinkPublico.findUnique({
      where: { empresaId: empresa.id },
    });

    const categorias = await this.prisma.categoria.findMany({
      where: {
        empresaId: empresa.id,
        ativo: true,
      },
      orderBy: {
        ordem: 'asc',
      },
      include: {
        produtos: {
          where: {
            // Retorna todos produtos (disponíveis e esgotados)
            // Frontend que vai filtrar/marcar como esgotado
          },
          orderBy: {
            ordem: 'asc',
          },
          include: {
            gruposProduto: {
              include: {
                grupoAdicional: {
                  where: {
                    ativo: true,
                  },
                  include: {
                    adicionais: {
                      where: {
                        ativo: true,
                      },
                      orderBy: {
                        ordem: 'asc',
                      },
                    },
                  },
                },
              },
              orderBy: {
                ordem: 'asc',
              },
            },
          },
        },
      },
    });

    return {
      empresa,
      categorias,
      configuracaoVisual, // NOVO: Configurações de customização visual
    };
  }

  /**
   * Verifica se restaurante está aberto
   */
  isRestauranteAberto(horarioAbertura: string, horarioFechamento: string): boolean {
    // TODO: implementar lógica de horário
    return true;
  }
}
```

---

### 4️⃣ Controllers Públicos

#### Cardápio Controller

```typescript
// Arquivo: climb-delivery-api/src/public/controllers/public-cardapio.controller.ts

import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { PublicService } from '../public.service';

@Controller('public/:slug')
export class PublicCardapioController {
  constructor(private readonly publicService: PublicService) {}

  /**
   * GET /public/:slug
   * Retorna informações do restaurante
   */
  @Public()
  @Get()
  async getRestaurante(@Param('slug') slug: string) {
    return this.publicService.getEmpresaBySlug(slug);
  }

  /**
   * GET /public/:slug/cardapio
   * Retorna cardápio completo
   */
  @Public()
  @Get('cardapio')
  async getCardapio(@Param('slug') slug: string) {
    return this.publicService.getCardapio(slug);
  }
}
```

#### Pedido Controller

```typescript
// Arquivo: climb-delivery-api/src/public/controllers/public-pedido.controller.ts

import { Controller, Post, Body, Param } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { CreatePedidoPublicoDto } from '../dto/create-pedido-publico.dto';
import { PublicPedidoService } from '../services/public-pedido.service';

@Controller('public/:slug')
export class PublicPedidoController {
  constructor(private readonly publicPedidoService: PublicPedidoService) {}

  /**
   * POST /public/:slug/pedidos
   * Cria novo pedido via área pública
   */
  @Public()
  @Post('pedidos')
  async create(
    @Param('slug') slug: string,
    @Body() createPedidoDto: CreatePedidoPublicoDto,
  ) {
    return this.publicPedidoService.createPedidoPublico(slug, createPedidoDto);
  }
}
```

---

### 5️⃣ DTOs

#### Create Pedido Publico DTO

```typescript
// Arquivo: climb-delivery-api/src/public/dto/create-pedido-publico.dto.ts

import { IsNotEmpty, IsString, IsEmail, IsArray, IsOptional, IsEnum, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

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

class ItemAdicionalDto {
  @IsNumber()
  adicionalId: number;

  @IsNumber()
  quantidade: number;
}

class ItemPedidoDto {
  @IsNumber()
  produtoId: number;

  @IsNumber()
  quantidade: number;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemAdicionalDto)
  adicionais: ItemAdicionalDto[];
}

class EnderecoDto {
  @IsString()
  @IsNotEmpty()
  cep: string;

  @IsString()
  @IsNotEmpty()
  logradouro: string;

  @IsString()
  @IsNotEmpty()
  numero: string;

  @IsOptional()
  @IsString()
  complemento?: string;

  @IsString()
  @IsNotEmpty()
  bairro: string;

  @IsString()
  @IsNotEmpty()
  cidade: string;

  @IsString()
  @IsNotEmpty()
  uf: string;

  @IsOptional()
  @IsString()
  referencia?: string;
}

export class CreatePedidoPublicoDto {
  // Dados do cliente
  @IsString()
  @IsNotEmpty()
  nomeCliente: string;

  @IsString()
  @IsNotEmpty()
  telefoneCliente: string;

  @IsOptional()
  @IsEmail()
  emailCliente?: string;

  // Tipo de pedido
  @IsEnum(TipoPedido)
  tipoPedido: TipoPedido;

  // Endereço (obrigatório se ENTREGA)
  @IsOptional()
  @ValidateNested()
  @Type(() => EnderecoDto)
  endereco?: EnderecoDto;

  // Itens do pedido
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemPedidoDto)
  itens: ItemPedidoDto[];

  // Pagamento
  @IsEnum(FormaPagamento)
  formaPagamento: FormaPagamento;

  @IsOptional()
  @IsNumber()
  trocoPara?: number;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
```

---

## 🎨 Frontend - Angular

### 1️⃣ Rotas Públicas

```typescript
// Arquivo: src/app/app.routes.ts

import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { homeGuard } from './core/guards/home.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [homeGuard],
    children: []
  },
  {
    path: 'login',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'dashboard',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
      }
    ]
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  // ============================================
  // ÁREA PÚBLICA (NOVO)
  // ============================================
  {
    path: ':slug',
    loadChildren: () => import('./public/public.routes').then(m => m.PUBLIC_ROUTES)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
```

```typescript
// Arquivo: src/app/public/public.routes.ts

import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layout/public-layout.component';

export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
        title: 'Cardápio'
      },
      {
        path: 'checkout',
        loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent),
        title: 'Finalizar Pedido'
      },
      {
        path: 'pedido-confirmado/:id',
        loadComponent: () => import('./pages/order-confirmation/order-confirmation.component').then(m => m.OrderConfirmationComponent),
        title: 'Pedido Confirmado'
      }
    ]
  }
];
```

---

### 2️⃣ Models

```typescript
// Arquivo: src/app/public/models/public-restaurant.model.ts

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

export interface CardapioResponse {
  empresa: PublicRestaurant;
  categorias: PublicCategoria[];
  configuracaoVisual?: ConfiguracaoVisual; // NOVO
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
```

```typescript
// Arquivo: src/app/public/models/cart.model.ts

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
```

---

### 3️⃣ Services

#### Public Restaurant Service

```typescript
// Arquivo: src/app/public/services/public-restaurant.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CardapioResponse, PublicRestaurant } from '../models/public-restaurant.model';

@Injectable({
  providedIn: 'root'
})
export class PublicRestaurantService {
  private apiUrl = `${environment.apiUrl}/public`;
  private restaurantSubject = new BehaviorSubject<PublicRestaurant | null>(null);
  public restaurant$ = this.restaurantSubject.asObservable();

  constructor(private http: HttpClient) {}

  getRestaurante(slug: string): Observable<PublicRestaurant> {
    return this.http.get<PublicRestaurant>(`${this.apiUrl}/${slug}`).pipe(
      tap(restaurant => this.restaurantSubject.next(restaurant))
    );
  }

  getCardapio(slug: string): Observable<CardapioResponse> {
    return this.http.get<CardapioResponse>(`${this.apiUrl}/${slug}/cardapio`);
  }

  isRestauranteAberto(restaurant: PublicRestaurant): boolean {
    // TODO: implementar lógica de horário
    return restaurant.ativo;
  }
}
```

#### Public Cart Service

```typescript
// Arquivo: src/app/public/services/public-cart.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Cart, CartItem, CartAdicional } from '../models/cart.model';
import { PublicProduto } from '../models/public-restaurant.model';

@Injectable({
  providedIn: 'root'
})
export class PublicCartService {
  private cartSubject = new BehaviorSubject<Cart>(this.getInitialCart());
  public cart$ = this.cartSubject.asObservable();
  
  private drawerOpenSubject = new BehaviorSubject<boolean>(false);
  public drawerOpen$ = this.drawerOpenSubject.asObservable();

  private readonly STORAGE_KEY = 'climb_delivery_cart';

  constructor() {
    this.loadCartFromStorage();
  }

  private getInitialCart(): Cart {
    return {
      items: [],
      subtotal: 0,
      taxaEntrega: 0,
      total: 0,
      quantidadeItens: 0
    };
  }

  addItem(
    produto: PublicProduto,
    quantidade: number,
    adicionais: CartAdicional[],
    observacoes?: string
  ): void {
    const cart = this.cartSubject.value;
    
    const precoAdicionais = adicionais.reduce(
      (sum, a) => sum + (a.adicional.preco * a.quantidade), 
      0
    );
    
    const precoTotal = (Number(produto.preco) + precoAdicionais) * quantidade;

    const item: CartItem = {
      id: this.generateId(),
      produto,
      quantidade,
      observacoes,
      adicionaisSelecionados: adicionais,
      precoTotal
    };

    cart.items.push(item);
    this.updateCart(cart);
    this.openDrawer();
  }

  removeItem(itemId: string): void {
    const cart = this.cartSubject.value;
    cart.items = cart.items.filter(item => item.id !== itemId);
    this.updateCart(cart);
  }

  updateItemQuantity(itemId: string, quantidade: number): void {
    const cart = this.cartSubject.value;
    const item = cart.items.find(i => i.id === itemId);
    
    if (item) {
      item.quantidade = quantidade;
      
      const precoAdicionais = item.adicionaisSelecionados.reduce(
        (sum, a) => sum + (a.adicional.preco * a.quantidade),
        0
      );
      
      item.precoTotal = (Number(item.produto.preco) + precoAdicionais) * quantidade;
      this.updateCart(cart);
    }
  }

  setTaxaEntrega(taxa: number): void {
    const cart = this.cartSubject.value;
    cart.taxaEntrega = taxa;
    this.updateCart(cart);
  }

  clearCart(): void {
    this.updateCart(this.getInitialCart());
    this.saveCartToStorage();
  }

  openDrawer(): void {
    this.drawerOpenSubject.next(true);
  }

  closeDrawer(): void {
    this.drawerOpenSubject.next(false);
  }

  toggleDrawer(): void {
    this.drawerOpenSubject.next(!this.drawerOpenSubject.value);
  }

  private updateCart(cart: Cart): void {
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.precoTotal, 0);
    cart.total = cart.subtotal + cart.taxaEntrega;
    cart.quantidadeItens = cart.items.reduce((sum, item) => sum + item.quantidade, 0);
    
    this.cartSubject.next(cart);
    this.saveCartToStorage();
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveCartToStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.cartSubject.value));
  }

  private loadCartFromStorage(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const cart = JSON.parse(saved);
        this.cartSubject.next(cart);
      } catch (e) {
        console.error('Erro ao carregar carrinho do storage', e);
      }
    }
  }
}
```

---

### 4️⃣ Layout Público

#### Public Layout Component

```typescript
// Arquivo: src/app/public/layout/public-layout.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { PublicHeaderComponent } from './public-header/public-header.component';
import { PublicFooterComponent } from './public-footer/public-footer.component';
import { CartComponent } from '../pages/cart/cart.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    PublicHeaderComponent,
    PublicFooterComponent,
    CartComponent
  ],
  template: `
    <div class="public-layout">
      <app-public-header />
      <main class="public-content">
        <router-outlet />
      </main>
      <app-public-footer />
      <app-cart />
    </div>
  `,
  styles: [`
    .public-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .public-content {
      flex: 1;
      padding-bottom: 80px; // Espaço para o footer
    }
  `]
})
export class PublicLayoutComponent {}
```

---

### 5️⃣ Componentes Principais

#### Home Component (Página do Cardápio)

```typescript
// Arquivo: src/app/public/pages/home/home.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PublicRestaurantService } from '../../services/public-restaurant.service';
import { PublicCartService } from '../../services/public-cart.service';
import { PublicRestaurant, PublicCategoria, PublicProduto } from '../../models/public-restaurant.model';

@Compone// Aplica configurações visuais personalizadas
        if (data.configuracaoVisual) {
          this.applyCustomTheme(data.configuracaoVisual);
        }
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar cardápio:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  applyCustomTheme(config: any): void {
    // Aplica cores personalizadas via CSS Variables
    document.documentElement.style.setProperty('--color-primary', config.corPrimaria);
    document.documentElement.style.setProperty('--color-primary-dark', config.corSecundaria);
    document.documentElement.style.setProperty('--color-primary-light', config.corAcento);
    document.documentElement.style.setProperty('--color-text', config.corTexto);
    document.documentElement.style.setProperty('--color-background', config.corFundo);
    document.documentElement.style.setProperty('--color-header-bg', config.corHeaderBackground);
    document.documentElement.style.setProperty('--color-header-text', config.corHeaderTexto);
    
    // Aplica classes de estilo
    document.body.classList.add(`button-${config.estiloBotao}`);
    document.body.classList.add(`card-${config.estiloCard}`);
    document.body.classList.add(`font-${config.tamanhoFonte}`);
    
    // Atualiza meta tags
    if (config.metaTitulo) {
      document.title = config.metaTitulo;
    }
    if (config.faviconUrl) {
      const favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (favicon) favicon.href = config.faviconUrl;
    }class HomeComponent implements OnInit {
  slug: string = '';
  restaurant: PublicRestaurant | null = null;
  categorias: PublicCategoria[] = [];
  loading = true;
  error = false;
  
  searchTerm = '';
  selectedCategory: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private restaurantService: PublicRestaurantService,
    private cartService: PublicCartService
  ) {}

  ngOnInit(): void {
    this.slug = this.route.snapshot.params['slug'];
    this.loadCardapio();
  }

  loadCardapio(): void {
    this.loading = true;
    this.restaurantService.getCardapio(this.slug).subscribe({
      next: (data) => {
        this.restaurant = data.empresa;
        this.categorias = data.categorias;
        
        // Atualiza taxa de entrega no carrinho
        this.cartService.setTaxaEntrega(Number(data.empresa.taxaEntrega));
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar cardápio:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  onProductClick(produto: PublicProduto): void {
    // Abre modal de adicionais
    // TODO: implementar modal
  }

  isRestauranteAberto(): boolean {
    return this.restaurant ? 
      this.restaurantService.isRestauranteAberto(this.restaurant) : 
      false;
  }

  scrollToCategory(categoriaId: number): void {
    const element = document.getElementById(`categoria-${categoriaId}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
```

---

## 🎨 Design & UX

### Sistema de Customização Visual

**⚠️ IMPORTANTE:** Cada restaurante poderá customizar as cores e elementos visuais do seu link público através da área administrativa.

### Tabela de Configuração Visual (Banco de Dados)

```prisma
// Arquivo: climb-delivery-api/prisma/schema.prisma

model ConfiguracaoLinkPublico {
  id                    Int       @id @default(autoincrement())
  empresaId             Int       @unique @map("empresa_id")
  
  // Banner Principal
  bannerUrl             String?   @db.Text @map("banner_url")
  bannerMobileUrl       String?   @db.Text @map("banner_mobile_url")
  exibirBanner          Boolean   @default(true) @map("exibir_banner")
  
  // Cores Personalizadas
  corPrimaria           String    @default("#cc0000") @map("cor_primaria") // Cor principal
  corSecundaria         String    @default("#b30000") @map("cor_secundaria") // Cor escura
  corAcento             String    @default("#ff0000") @map("cor_acento") // Cor de destaque
  corTexto              String    @default("#212121") @map("cor_texto") // Cor do texto
  corFundo              String    @default("#ffffff") @map("cor_fundo") // Cor de fundo
  corHeaderBackground   String    @default("#cc0000") @map("cor_header_background")
  corHeaderTexto        String    @default("#ffffff") @map("cor_header_texto")
  
  // Logos e Imagens
  logoUrl               String?   @db.Text @map("logo_url") // Logo principal
  faviconUrl            String?   @db.Text @map("favicon_url")
  logoHeaderUrl         String?   @db.Text @map("logo_header_url") // Logo para o header
  
  // Estilo e Layout
  estiloBotao           String    @default("rounded") @map("estilo_botao") // rounded, square, pill
  estiloCard            String    @default("shadow") @map("estilo_card") // shadow, border, flat
  tamanhoFonte          String    @default("medium") @map("tamanho_fonte") // small, medium, large
  
  // Informações Adicionais
  mensagemBanner        String?   @db.Text @map("mensagem_banner") // Texto no banner
  exibirPromocoes       Boolean   @default(true) @map("exibir_promocoes")
  exibirDestaques       Boolean   @default(true) @map("exibir_destaques")
  
  // SEO e Meta Tags
  metaTitulo            String?   @map("meta_titulo")
  metaDescricao         String?   @db.Text @map("meta_descricao")
  metaKeywords          String?   @db.Text @map("meta_keywords")
  
  // Redes Sociais
  urlFacebook           String?   @map("url_facebook")
  urlInstagram          String?   @map("url_instagram")
  urlTwitter            String?   @map("url_twitter")
  
  // Timestamps
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")

  // Relacionamento
  empresa               Empresa   @relation(fields: [empresaId], references: [id], onDelete: Cascade)

  @@map("configuracao_link_publico")
}
```

### Migration para Criar Tabela

```bash
cd climb-delivery-api
npx prisma migrate dev --name create_configuracao_link_publico
```

### Paleta de Cores Padrão (Fallback)

```scss
// Arquivo: src/styles/_public-variables.scss

// ============================================
// CORES PADRÃO (Usadas se não houver customização)
// ============================================

// Cores principais
$primary-default: #cc0000;
$primary-dark-default: #b30000;
$primary-light-default: #ff0000;

// Cores neutras
$white: #ffffff;
$black: #000000;
$gray-50: #f9f9f9;
$gray-100: #f5f5f5;
$gray-200: #eeeeee;
$gray-300: #e0e0e0;
$gray-400: #bdbdbd;
$gray-500: #9e9e9e;
$gray-600: #757575;
$gray-700: #616161;
$gray-800: #424242;
$gray-900: #212121;

// Status
$success: #4caf50;
$warning: #ff9800;
$error: #f44336;
$info: #2196f3;

// Sombras
$shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
$shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);

// Border radius
$radius-sm: 4px;
$radius-md: 8px;
$radius-lg: 12px;
$radius-xl: 16px;
$radius-full: 9999px;

// Espaçamentos
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;
$spacing-2xl: 48px;

// ============================================
// CORES DINÂMICAS (Aplicadas via CSS Variables)
// ============================================

:root {
  // Serão sobrescritas dinamicamente pelo Angular
  --color-primary: #{$primary-default};
  --color-primary-dark: #{$primary-dark-default};
  --color-primary-light: #{$primary-light-default};
  --color-text: #{$gray-900};
  --color-background: #{$white};
  --color-header-bg: #{$primary-default};
  --color-header-text: #{$white};
}
```

### Componentes Visuais Principais

#### 1. Header Público

**Elementos:**
- Logo do restaurante (esquerda)
- Nome do restaurante
- Busca de produtos (centro)
- Ícones: Início, Promoções, Pedidos, Entrar/Cadastrar
- Status: Aberto/Fechado
- Badge do carrinho (flutuante)

**Layout:**
```
┌────────────────────────────────────────────────────────┐
│ [Logo] Nome do Restaurante    [🔍 Buscar]             │
│ [🏠 Início] [🎁 Promoções] [📦 Pedidos] [👤 Entrar]   │
│                                           [🛒 Badge: 3]│
└────────────────────────────────────────────────────────┘
```

#### 2. Banner Hero

**Elementos:**
- Imagem grande do produto/restaurante
- Overlay com informações
- Status (Aberto/Fechado)
- Calcular taxa/tempo de entrega

**Dimensões:**
- Desktop: 100% width x 300-400px height
- Mobile: 100% width x 200-250px height

#### 3. Restaurant Info Card

**Elementos:**
- Logo circular (overlay no banner)
- Nome do restaurante
- Endereço
- Status e horário
- Link para WhatsApp
- Calcular taxa de entrega

#### 4. Category Navigation (Sticky)

**Elementos:**
- Lista horizontal de categorias
- Scroll horizontal suave
- Destaque da categoria ativa
- Fixo no topo ao scrollar

#### 5. Product Card

**Layout:**
```
┌─────────────────────────┐
│   [Imagem do Produto]   │
│                         │
│  Nome do Produto        │
│  Descrição breve...     │
│                         │
│  R$ 25,00  [+ Adicionar]│
└─────────────────────────┘
```

**Estados:**
- Normal: Borda sutil, hover com elevação
- Esgotado: Opacidade reduzida, badge "Esgotado"
- Com adicionais: Preço "A partir de R$..."

#### 6. Cart Drawer (Sidebar)

**Elementos:**
- Slide-in pela direita
- Overlay escuro no fundo
- Lista de itens com foto
- Controles de quantidade
- Editar/Remover item
- Subtotal, Taxa, Total
- Botão "Finalizar Pedido"
- Badge de quantidade

**Layout Mobile:**
- Bottom sheet (sobe de baixo)
- Altura: 70-80% da tela

---

## 📱 Responsividade

### Breakpoints

```scss
// Arquivo: src/styles/_breakpoints.scss

$breakpoint-xs: 0;
$breakpoint-sm: 576px;
$breakpoint-md: 768px;
$breakpoint-lg: 992px;
$breakpoint-xl: 1200px;
$breakpoint-xxl: 1400px;

@mixin mobile {
  @media (max-width: #{$breakpoint-sm - 1}) {
    @content;
  }
}

@mixin tablet {
  @media (min-width: #{$breakpoint-md}) and (max-width: #{$breakpoint-lg - 1}) {
    @content;
  }
}

@mixin desktop {
  @media (min-width: #{$breakpoint-lg}) {
    @content;
  }
}
```

### Layout Responsivo

#### Mobile (< 576px)
- 1 coluna para produtos
- Header simplificado
- Menu categorias: scroll horizontal
- Cart: bottom sheet
- Banner: altura reduzida

#### Tablet (576px - 991px)
- 2 colunas para produtos
- Header completo
- Cart: sidebar direita

#### Desktop (≥ 992px)
- 3-4 colunas para produtos
- Layout com sidebar (opcional)
- Cart: sidebar fixa (opcional)
- Max-width: 1200px centralizado

---

## 🔄 Fluxo de Navegação

### 1. Acesso Inicial

```
Cliente acessa: climbdelivery.app/frango-no-balde
         ↓
    Carrega dados do restaurante
         ↓
    Verifica se slug existe
         ↓
  [Existe] → Carrega cardápio
  [Não existe] → Página 404
```

### 2. Navegação no Cardápio

```
Página Home
    ↓
[Cliente navega por categorias]
    ↓
[Clica em produto]
    ↓
Modal de Adicionais abre
    ↓
[Seleciona adicionais + quantidade]
    ↓
[Adiciona ao carrinho]
    ↓
Carrinho atualiza (badge + sidebar)
```

### 3. Finalização de Pedido

```
[Cliente clica em "Finalizar Pedido"]
    ↓
Redireciona para /checkout
    ↓
Preenche formulário:
  - Dados pessoais
  - Tipo: Entrega ou Retirada
  - Endereço (se entrega)
  - Forma de pagamento
  - Observações
    ↓
Valida campos obrigatórios
    ↓
[Confirma pedido]
    ↓
POST /public/:slug/pedidos
    ↓
[Sucesso] → Redireciona para /pedido-confirmado/:id
[Erro] → Exibe mensagem de erro
```

### 4. Confirmação

```
Página de Confirmação
    ↓
Exibe:
  - Número do pedido
  - Tempo estimado
  - Resumo do pedido
  - Link WhatsApp restaurante
    ↓
Limpa carrinho
    ↓
[Cliente pode fazer novo pedido]
```

---

## ✅ Checklist de Implementação

### Backend

#### Banco de Dados
- [ ] Adicionar campo `slug` na tabela `Empresa`
- [ ] Adicionar campo `whatsapp` na tabela `Empresa`
- [ ] Criar tabela `ConfiguracaoLinkPublico`
- [ ] Relacionamento `ConfiguracaoLinkPublico` → `Empresa` (1:1)
- [ ] Criar migration `add_slug_to_empresa`
- [ ] Criar migration `create_configuracao_link_publico`
- [ ] Executar migrations
- [ ] Atualizar seed (se necessário)
- [ ] Criar registro padrão de configuração ao criar empresa

#### Decorators & Guards
- [ ] Criar decorator `@Public()`
- [ ] Atualizar `JwtAuthGuard` para respeitar rotas públicas
- [ ] Testar autenticação

#### Módulo Public
- [ ] Criar `PublicModule`
- [ ] Criar `PublicService`
- [ ] Criar `PublicCardapioController`
- [ ] Criar `PublicPedidoController`
- [ ] Criar `PublicPedidoService`
- [ ] Incluir configurações visuais no endpoint do cardápio

#### Módulo ConfiguracaoLinkPublico (NOVO)
- [ ] Criar `ConfiguracaoLinkPublicoModule`
- [ ] Criar `ConfiguracaoLinkPublicoService`
- [ ] Criar `ConfiguracaoLinkPublicoController`
- [ ] CRUD completo de configurações
- [ ] Upload de imagens (banner desktop, mobile, logos)
- [ ] Validações de URLs e cores
- [ ] Endpoint para obter configurações por empresa
- [ ] Criar configuração padrão ao criar empresa

#### DTOs
- [ ] Criar `CreatePedidoPublicoDto`
- [ ] Validações completas
- [ ] Testes de validação

#### Endpoints
- [ ] `GET /public/:slug` - Info do restaurante
- [ ] `GET /public/:slug/cardapio` - Cardápio completo
- [ ] `POST /public/:slug/pedidos` - Criar pedido
- [ ] Testar todos endpoints

#### Geração de Slug
- [ ] Criar método `generateSlug()` no `EmpresaService`
- [ ] Validar unicidade do slug
- [ ] Atualizar formulário de cadastro/edição

---

### Frontend

#### Estrutura
- [ ] Criar pasta `src/app/public/`
- [ ] Criar `public.routes.ts`
- [ ] Criar `PublicLayoutComponent`
- [ ] Criar `PublicHeaderComponent`
- [ ] Criar `PublicFooterComponent`

#### Models
- [ ] Criar `public-restaurant.model.ts`
- [ ] Criar `cart.model.ts`
- [ ] Criar `public-order.model.ts`
Carregar configurações visuais
  - [ ] Aplicar cores personalizadas via CSS Variables
  - [ ] Aplicar estilos personalizados (botões, cards)
  - [ ] Exibir banner personalizado
  - [ ] 
#### Services
- [ ] Criar `PublicRestaurantService`
- [ ] Criar `PublicCartService` (com localStorage)
- [ ] Criar `PublicOrderService`
- [ ] Criar `CepService` (integração ViaCEP)

#### Páginas
- [ ] **Home Component**
  - [ ] Template básico
  - [ ] Carregar cardápio
  - [ ] Exibir categorias
  - [ ] Exibir produtos
  - [ ] Busca de produtos
  - [ ] Responsivo

- [ ] **Cart Component (Drawer)**
  - [ ] Sidebar desktop
  - [ ] Bottom sheet mobile
  - [ ] Lista de itens
  - [ ] Controles de quantidade
  - [ ] Editar item
  - [ ] Remover item
  - [ ] Totalizadores
  - [ ] Badge flutuante

- [ ] **Checkout Component**
  - [ ] Formulário de dados pessoais
  - [ ] Tipo de pedido (Entrega/Retirada)
  - [ ] Formulário de endereço
  - [ ] Integração com ViaCEP
  - [ ] Forma de pagamento
  - [ ] Resumo do pedido
  - [ ] Validações
  - [ ] Submit

- [ ] **Order Confirmation Component**
  - [ ] Exibir dados do pedido
  - [ ] Número do pedido
  - [ ] Tempo estimado
  - [ ] Link WhatsApp
  - [ ] Botão "Novo pedido"

#### Componentes Compartilhados
- [ ] `ProductCardComponent`
- [ ] `ProductModalComponent` (adicionais)
- [ ] `CategoryNavComponent`
- [ ] `RestaurantInfoComponent`
- [ ] `CartItemComponent`
- [ ] `LoadingSpinnerComponent` (valores padrão)
- [ ] Criar `_public-mixins.scss`
- [ ] Sistema de CSS Variables para cores dinâmicas
- [ ] Estilos do header (com suporte a cores personalizadas)
- [ ] Estilos do banner (com suporte a imagens personalizadas)
- [ ] Estilos dos cards (múltiplos estilos: shadow, border, flat)
- [ ] Estilos dos botões (múltiplos estilos: rounded, square, pill)
- [ ] Estilos do carrinho
- [ ] Estilos do checkout
- [ ] Responsividade mobile
- [ ] Responsividade tablet

#### Área Administrativa - Configuração Link Público (NOVO)
- [ ] Criar página de configuração do link público
- [ ] Menu lateral: adicionar item "Link Público" em Configurações
- [ ] Seção de upload de banners
- [ ] Seção de upload de logos
- [ ] Color pickers para personalização
- [ ] Seleção de estilos (botões, cards)
- [ ] Formulário de SEO
- [ ] Formulário de redes sociais
- [ ] Preview em tempo real
- [ ] Botão copiar link público
- [ ] Botão abrir preview em nova aba
- [ ] Validações de formulário
- [ ] Integração com serviço de upload
- [ ] Responsivo
- [ ] Estilos do carrinho
- [ ] Estilos do checkout
- [ ] Responsividade mobile
- [ ] Responsividade tablet

---

### Integrações

#### ViaCEP
- [ ] Criar `CepService`
- [ ] Buscar endereço por CEP
- [ ] Auto-preencher formulário
- [ ] Tratamento de erros

#### WhatsApp
- [ ] Link direto para WhatsApp
- [ ] Formato: `https://wa.me/5511999999999`
- [ ] Mensagem pré-formatada (opcional)

---

### Testes

#### Backend
- [ ] Testes unitários dos services
- [ ] Testes dos controllers
- [ ] Testes E2E do fluxo completo
- [ ] Validação de DTOs

#### Frontend
- [ ] Testes de componentes
- [ ] Testes de servi7 dias)
1. ✅ Adicionar campo `slug` no banco
2. ✅ Criar tabela `ConfiguracaoLinkPublico` no banco
3. ✅ Criar decorator `@Public()`
4. ✅ Criar módulo `PublicModule`
5. ✅ Criar módulo `ConfiguracaoLinkPublicoModule` (CRUD completo)
6. ✅ Implementar endpoints de cardápio (com configurações visuais)
7. ✅ Criar estrutura de pastas frontend
8. ✅ Criar models e services
9. ✅ Implementar página de configuração visual na área administrativa
- [ ] Lazy loading de imagens
- [ ] Cache do cardápio (5 minutos)
- [ ] Otimização de imagens
- [ ] CDN para assets
- [ ] Bundle size analysis
- [ ] Lighthouse score > 90

---

### SEO & Acessibilidade

- [ ] Meta tags dinâmicas
- [ ] Open Graph tags
- [ ] Schema.org (Restaurant)
- [ ] Alt text em imagens
- [ ] ARIA labels
- [ ] Contraste de cores (WCAG)
- [ ] Navegação por teclado

---

## 🚀 Ordem de Implementação Sugerida

### 📅 Sprint 1 - Infraestrutura Backend: Banco de Dados (3 dias)

**Objetivo:** Preparar toda a base de dados necessária para o link público.

#### Banco de Dados
- [ ] Adicionar campo `slug` na tabela `Empresa`
- [ ] Adicionar campo `whatsapp` na tabela `Empresa`
- [ ] Criar tabela `ConfiguracaoLinkPublico`
- [ ] Relacionamento `ConfiguracaoLinkPublico` → `Empresa` (1:1)
- [ ] Criar migration `add_slug_to_empresa`
- [ ] Criar migration `create_configuracao_link_publico`
- [ ] Executar migrations
- [ ] Atualizar seed com dados de teste

#### Decorators & Guards
- [ ] Criar decorator `@Public()` em `src/common/decorators/public.decorator.ts`
- [ ] Atualizar `JwtAuthGuard` para respeitar rotas públicas
- [ ] Testar autenticação (endpoints protegidos vs públicos)

**Entregáveis:**
- ✅ Migrations executadas
- ✅ Decorator @Public() criado e funcionando
- ✅ Banco de dados pronto

---

### 📅 Sprint 2 - Scaffolding: Estrutura Backend + Frontend (4 dias)

**Objetivo:** Criar TODA a estrutura de pastas e arquivos básicos (sem implementação completa).

#### Backend - Estrutura de Pastas

```
climb-delivery-api/src/
├── public/                           # Módulo público (NOVO)
│   ├── public.module.ts
│   ├── controllers/
│   │   ├── public-cardapio.controller.ts
│   │   └── public-pedido.controller.ts
│   ├── services/
│   │   ├── public.service.ts
│   │   └── public-pedido.service.ts
│   └── dto/
│       ├── create-pedido-publico.dto.ts
│       └── index.ts
├── configuracao-link-publico/        # Módulo de configuração (NOVO)
│   ├── configuracao-link-publico.module.ts
│   ├── configuracao-link-publico.controller.ts
│   ├── configuracao-link-publico.service.ts
│   └── dto/
│       ├── create-configuracao.dto.ts
│       ├── update-configuracao.dto.ts
│       └── index.ts
└── common/
    └── decorators/
        └── public.decorator.ts (já criado na Sprint 1)
```

#### Backend - Criar Arquivos Base
- [ ] Criar pasta `src/public/`
- [ ] Criar `src/public/public.module.ts` (módulo básico)
- [ ] Criar pasta `src/public/controllers/`
- [ ] Criar `src/public/controllers/public-cardapio.controller.ts` (controller vazio com estrutura)
- [ ] Criar `src/public/controllers/public-pedido.controller.ts` (controller vazio com estrutura)
- [ ] Criar pasta `src/public/services/`
- [ ] Criar `src/public/services/public.service.ts` (service vazio com estrutura)
- [ ] Criar `src/public/services/public-pedido.service.ts` (service vazio com estrutura)
- [ ] Criar pasta `src/public/dto/`
- [ ] Criar `src/public/dto/create-pedido-publico.dto.ts` (DTO vazio com estrutura)
- [ ] Criar pasta `src/configuracao-link-publico/`
- [ ] Criar `src/configuracao-link-publico/configuracao-link-publico.module.ts`
- [ ] Criar `src/configuracao-link-publico/configuracao-link-publico.controller.ts`
- [ ] Criar `src/configuracao-link-publico/configuracao-link-publico.service.ts`
- [ ] Criar pasta `src/configuracao-link-publico/dto/`
- [ ] Criar DTOs de configuração (create, update)
- [ ] Registrar módulos no `app.module.ts`

#### Frontend - Estrutura de Pastas

```
src/app/
├── public/                           # Módulo público (NOVO)
│   ├── public.routes.ts
│   ├── layout/
│   │   ├── public-layout.component.ts
│   │   ├── public-layout.component.html
│   │   ├── public-layout.component.scss
│   │   ├── public-header/
│   │   │   ├── public-header.component.ts
│   │   │   ├── public-header.component.html
│   │   │   └── public-header.component.scss
│   │   └── public-footer/
│   │       ├── public-footer.component.ts
│   │       ├── public-footer.component.html
│   │       └── public-footer.component.scss
│   ├── pages/
│   │   ├── home/
│   │   │   ├── home.component.ts
│   │   │   ├── home.component.html
│   │   │   ├── home.component.scss
│   │   │   └── components/
│   │   │       ├── product-card/
│   │   │       ├── category-nav/
│   │   │       ├── restaurant-info/
│   │   │       └── product-modal/
│   │   ├── cart/
│   │   │   ├── cart.component.ts
│   │   │   ├── cart.component.html
│   │   │   └── cart.component.scss
│   │   ├── checkout/
│   │   │   ├── checkout.component.ts
│   │   │   ├── checkout.component.html
│   │   │   ├── checkout.component.scss
│   │   │   └── components/
│   │   │       ├── customer-form/
│   │   │       ├── address-form/
│   │   │       ├── payment-form/
│   │   │       └── order-summary/
│   │   ├── order-confirmation/
│   │   │   ├── order-confirmation.component.ts
│   │   │   ├── order-confirmation.component.html
│   │   │   └── order-confirmation.component.scss
│   │   └── not-found/
│   │       ├── not-found.component.ts
│   │       ├── not-found.component.html
│   │       └── not-found.component.scss
│   ├── services/
│   │   ├── public-restaurant.service.ts
│   │   ├── public-cart.service.ts
│   │   ├── public-order.service.ts
│   │   └── cep.service.ts
│   └── models/
│       ├── public-restaurant.model.ts
│       ├── cart.model.ts
│       └── public-order.model.ts
```

#### Frontend - Criar Arquivos Base
- [ ] Criar pasta `src/app/public/`
- [ ] Criar `src/app/public/public.routes.ts` (rotas básicas)
- [ ] Criar pasta `src/app/public/layout/`
- [ ] Criar `PublicLayoutComponent` (estrutura básica)
- [ ] Criar pasta `src/app/public/layout/public-header/`
- [ ] Criar `PublicHeaderComponent` (estrutura básica)
- [ ] Criar pasta `src/app/public/layout/public-footer/`
- [ ] Criar `PublicFooterComponent` (estrutura básica)
- [ ] Criar pasta `src/app/public/pages/home/`
- [ ] Criar `HomeComponent` (estrutura básica)
- [ ] Criar pasta `src/app/public/pages/home/components/`
- [ ] Criar subpastas: `product-card/`, `category-nav/`, `restaurant-info/`, `product-modal/`
- [ ] Criar componentes básicos (apenas estrutura)
- [ ] Criar pasta `src/app/public/pages/cart/`
- [ ] Criar `CartComponent` (estrutura básica)
- [ ] Criar pasta `src/app/public/pages/checkout/`
- [ ] Criar `CheckoutComponent` (estrutura básica)
- [ ] Criar pasta `src/app/public/pages/checkout/components/`
- [ ] Criar subpastas: `customer-form/`, `address-form/`, `payment-form/`, `order-summary/`
- [ ] Criar pasta `src/app/public/pages/order-confirmation/`
- [ ] Criar `OrderConfirmationComponent` (estrutura básica)
- [ ] Criar pasta `src/app/public/pages/not-found/`
- [ ] Criar `NotFoundComponent` (estrutura básica)
- [ ] Criar pasta `src/app/public/services/`
- [ ] Criar services vazios: `PublicRestaurantService`, `PublicCartService`, `PublicOrderService`, `CepService`
- [ ] Criar pasta `src/app/public/models/`
- [ ] Criar interfaces/types: `public-restaurant.model.ts`, `cart.model.ts`, `public-order.model.ts`
- [ ] Registrar rotas públicas no `app.routes.ts`

#### Estilos Base
- [ ] Criar `src/styles/_public-variables.scss`
- [ ] Criar `src/styles/_public-mixins.scss`
- [ ] Importar no `styles.scss`

**Entregáveis:**
- ✅ Estrutura completa do backend criada
- ✅ Estrutura completa do frontend criada
- ✅ Todos componentes/services/controllers existem (mesmo que vazios)
- ✅ Rotas configuradas
- ✅ Módulos registrados
- ✅ Projeto compila sem erros

---

### 📅 Sprint 3 - Backend: Endpoints Públicos e Cardápio (5 dias)

**Objetivo:** Implementar toda lógica do backend para buscar cardápio e dados do restaurante.

#### Public Service
- [ ] Implementar método `getEmpresaBySlug(slug)`
- [ ] Implementar validação de empresa ativa
- [ ] Implementar método `getCardapio(slug)` completo
- [ ] Incluir configurações visuais na resposta
- [ ] Buscar categorias com produtos ativos
- [ ] Incluir grupos de adicionais
- [ ] Implementar método `isRestauranteAberto()`
- [ ] Testes unitários do service

#### Public Cardapio Controller
- [ ] Implementar `GET /public/:slug`
- [ ] Implementar `GET /public/:slug/cardapio`
- [ ] Adicionar decorator `@Public()` nos endpoints
- [ ] Tratamento de erros (404, 500)
- [ ] Documentação Swagger

#### Geração de Slug
- [ ] Criar método `generateSlug()` no `EmpresaService`
- [ ] Implementar validação de unicidade
- [ ] Gerar slug automático ao criar empresa
- [ ] Permitir edição manual do slug
- [ ] Atualizar formulário de empresa (backend)

**Entregáveis:**
- ✅ Endpoints públicos retornando dados
- ✅ Cardápio completo funcionando
- ✅ Testes passando
- ✅ Documentação Swagger atualizada

---

### 📅 Sprint 4 - Backend: Módulo de Configuração Visual (5 dias)

**Objetivo:** Implementar CRUD completo para configuração visual do link público.

#### Configuracao Link Publico Service
- [ ] Implementar método `create()`
- [ ] Implementar método `findByEmpresaId()`
- [ ] Implementar método `update()`
- [ ] Validações de cores hexadecimais
- [ ] Validações de URLs
- [ ] Criar configuração padrão ao criar empresa (hook)
- [ ] Testes unitários

#### Configuracao Link Publico Controller
- [ ] Implementar `POST /configuracao-link-publico`
- [ ] Implementar `GET /configuracao-link-publico`
- [ ] Implementar `PUT /configuracao-link-publico/:id`
- [ ] Implementar `GET /configuracao-link-publico/empresa/:empresaId`
- [ ] Proteção com JWT (apenas empresa dona)
- [ ] Documentação Swagger

#### Upload de Imagens
- [ ] Endpoint para upload de banner desktop
- [ ] Endpoint para upload de banner mobile
- [ ] Endpoint para upload de logos
- [ ] Endpoint para upload de favicon
- [ ] Validação de formatos (jpg, png, webp)
- [ ] Validação de tamanhos
- [ ] Compressão automática
- [ ] Integração com serviço de storage (S3, Cloudinary, etc)

**Entregáveis:**
- ✅ CRUD de configurações funcionando
- ✅ Upload de imagens funcionando
- ✅ Validações implementadas
- ✅ Testes passando

---

### 📅 Sprint 5 - Frontend: Tela Administrativa de Configuração (5 dias)

**Objetivo:** Criar tela de configuração visual na área administrativa.

#### Estrutura
- [ ] Adicionar item "Link Público" no menu lateral (Configurações)
- [ ] Criar rota `/dashboard/configuracoes/link-publico`
- [ ] Criar `ConfiguracaoLinkPublicoComponent`
- [ ] Criar `ConfiguracaoLinkPublicoService`

#### Seções da Tela
- [ ] **Seção 1:** Upload de Banners (desktop e mobile)
- [ ] **Seção 2:** Identidade Visual (logos, favicon)
- [ ] **Seção 3:** Cores Personalizadas (7 color pickers)
- [ ] **Seção 4:** Estilo e Layout (botões, cards, fonte)
- [ ] **Seção 5:** Exibição de Seções (toggles)
- [ ] **Seção 6:** SEO e Meta Tags
- [ ] **Seção 7:** Redes Sociais
- [ ] **Seção 8:** Ações (preview, copiar link, salvar)

#### Funcionalidades
- [ ] Integração com serviço de upload
- [ ] Preview em tempo real
- [ ] Validação de formulário
- [ ] Feedback de sucesso/erro
- [ ] Botão "Copiar link público"
- [ ] Botão "Abrir preview em nova aba"
- [ ] Responsividade

**Entregáveis:**
- ✅ Tela de configuração completa
- ✅ Upload de imagens funcionando
- ✅ Salvamento de configurações funcionando
- ✅ Preview funcionando

---

### 📅 Sprint 6 - Frontend Público: Home e Cardápio (5 dias)

**Objetivo:** Implementar página principal do link público com listagem de produtos.

#### Services
- [ ] Implementar `PublicRestaurantService` completo
- [ ] Implementar método `getRestaurante(slug)`
- [ ] Implementar método `getCardapio(slug)`
- [ ] Implementar método `isRestauranteAberto()`
- [ ] Preparar `PublicCartService` (estrutura)

#### Layout Público
- [ ] Implementar `PublicLayoutComponent` completo
- [ ] Implementar `PublicHeaderComponent` com suporte a cores customizadas
- [ ] Implementar `PublicFooterComponent`
- [ ] Aplicar CSS Variables dinâmicas

#### Página Home
- [ ] Implementar `HomeComponent` completo
- [ ] Carregamento do cardápio via slug
- [ ] Implementar método `applyCustomTheme()` (CSS Variables)
- [ ] Loading e error states
- [ ] Tratamento de restaurante fechado

#### Componentes do Home
- [ ] Implementar Banner Hero (com banner personalizado)
- [ ] Implementar `RestaurantInfoComponent`
- [ ] Implementar `CategoryNavComponent` (scroll horizontal, sticky)
- [ ] Implementar `ProductCardComponent` (múltiplos estilos)
- [ ] Badge "Esgotado" em produtos indisponíveis

#### Funcionalidades
- [ ] Busca de produtos
- [ ] Filtro por categoria
- [ ] Scroll automático para categoria
- [ ] Exibir destaques e promoções
- [ ] Responsividade completa (mobile/tablet/desktop)

#### Estilos
- [ ] Implementar sistema de CSS Variables
- [ ] Classes dinâmicas de estilos (botões, cards)
- [ ] Suporte a 3 estilos de botão (rounded, square, pill)
- [ ] Suporte a 3 estilos de card (shadow, border, flat)
- [ ] Responsividade mobile-first

**Entregáveis:**
- ✅ Link público acessível via /:slug
- ✅ Cardápio exibido corretamente
- ✅ Customização visual aplicada
- ✅ Responsividade funcionando

---

### 📅 Sprint 7 - Frontend Público: Carrinho e Modal de Adicionais (4 dias)

**Objetivo:** Implementar carrinho de compras e seleção de adicionais.

#### Service de Carrinho
- [ ] Implementar `PublicCartService` completamente
- [ ] Método `addItem()`
- [ ] Método `removeItem()`
- [ ] Método `updateItemQuantity()`
- [ ] Método `setTaxaEntrega()`
- [ ] Método `clearCart()`
- [ ] Cálculos automáticos (subtotal, total)
- [ ] Persistência no localStorage
- [ ] Observable para estado do carrinho

#### Modal de Adicionais
- [ ] Criar `ProductModalComponent`
- [ ] Exibir informações do produto
- [ ] Listar grupos de adicionais
- [ ] Renderizar RADIO vs CHECKBOX
- [ ] Validações (obrigatório, min/max seleção)
- [ ] Campo de observações
- [ ] Contador de quantidade
- [ ] Cálculo em tempo real (produto + adicionais)
- [ ] Botão "Adicionar ao Carrinho"
- [ ] Responsividade

#### Drawer do Carrinho
- [ ] Implementar `CartComponent` completo
- [ ] Sidebar direita (desktop)
- [ ] Bottom sheet (mobile)
- [ ] Lista de itens com foto
- [ ] Controles de quantidade (+/-)
- [ ] Botão editar item (reabrir modal)
- [ ] Botão remover item
- [ ] Totalizadores (subtotal, taxa, total)
- [ ] Badge flutuante com quantidade
- [ ] Botão "Finalizar Pedido"
- [ ] Empty state (carrinho vazio)
- [ ] Overlay escuro no fundo

#### Integrações
- [ ] Abrir modal ao clicar em produto
- [ ] Atualizar badge ao adicionar item
- [ ] Abrir carrinho automaticamente ao adicionar item
- [ ] Navegação para checkout

**Entregáveis:**
- ✅ Modal de adicionais funcional
- ✅ Carrinho completo (desktop + mobile)
- ✅ Persistência funcionando
- ✅ Cálculos corretos

---

### 📅 Sprint 8 - Frontend Público: Checkout e Finalização (5 dias)

**Objetivo:** Implementar fluxo completo de finalização de pedido.

#### Backend - Pedido Service
- [ ] Criar `PublicPedidoService`
- [ ] Implementar `createPedidoPublico()`
- [ ] Criar ou buscar cliente existente
- [ ] Criar endereço (se entrega)
- [ ] Criar pedido com itens
- [ ] Criar itens de adicionais
- [ ] Validações completas
- [ ] Testes unitários

#### Backend - Pedido Controller
- [ ] Implementar `POST /public/:slug/pedidos`
- [ ] Adicionar decorator `@Public()`
- [ ] Validação do DTO
- [ ] Tratamento de erros
- [ ] Documentação Swagger

#### Integração ViaCEP
- [ ] Criar `CepService`
- [ ] Método `buscarEnderecoPorCep()`
- [ ] Tratamento de CEP inválido
- [ ] Auto-preenchimento de campos

#### Página de Checkout
- [ ] Implementar `CheckoutComponent` completo
- [ ] Criar `CustomerFormComponent` (nome, telefone, email)
- [ ] Tipo de Pedido: Radio (Entrega/Retirada)
- [ ] Criar `AddressFormComponent` (mostrar apenas se Entrega)
- [ ] Integração com ViaCEP
- [ ] Criar `PaymentFormComponent` (forma de pagamento)
- [ ] Campo "Troco para" (se Dinheiro)
- [ ] Campo de observações gerais
- [ ] Criar `OrderSummaryComponent` (resumo + totalizadores)
- [ ] Validações de formulário
- [ ] Botão "Confirmar Pedido"
- [ ] Loading durante envio
- [ ] Responsividade

#### Frontend - Order Service
- [ ] Implementar `PublicOrderService`
- [ ] Método `createPedido()`
- [ ] Método `getPedido()` (para confirmação)
- [ ] Tratamento de erros

#### Página de Confirmação
- [ ] Implementar `OrderConfirmationComponent`
- [ ] Exibir número do pedido
- [ ] Exibir tempo estimado
- [ ] Exibir resumo do pedido
- [ ] Link WhatsApp do restaurante
- [ ] Botão "Fazer novo pedido"
- [ ] Limpar carrinho ao confirmar

**Entregáveis:**
- ✅ Checkout completo
- ✅ Pedidos criados no banco
- ✅ ViaCEP integrado
- ✅ Confirmação funcionando
- ✅ WhatsApp funcionando

---

### 📅 Sprint 9 - Polimento, Testes e Deploy (4 dias)

**Objetivo:** Garantir qualidade, performance e preparar para produção.

#### Testes Backend
- [ ] Testes unitários dos services
- [ ] Testes de integração
- [ ] Testes E2E do fluxo completo
- [ ] Cobertura mínima: 70%

#### Testes Frontend
- [ ] Testes de componentes
- [ ] Testes de services
- [ ] Testes E2E (Cypress/Playwright)
- [ ] Testar fluxo completo (cardápio → carrinho → checkout → confirmação)

#### Performance
- [ ] Lazy loading de imagens
- [ ] Code splitting
- [ ] Bundle analysis
- [ ] Cache do cardápio (5 minutos)
- [ ] Otimização de imagens
- [ ] Lighthouse score > 90

#### SEO & Acessibilidade
- [ ] Meta tags dinâmicas por restaurante
- [ ] Open Graph tags
- [ ] Schema.org (Restaurant, MenuItem)
- [ ] Alt text em todas imagens
- [ ] ARIA labels
- [ ] Contraste de cores (WCAG AA)
- [ ] Navegação por teclado

#### Documentação
- [ ] Swagger/OpenAPI completo
- [ ] README atualizado
- [ ] Guia de configuração visual para clientes
- [ ] Guia de deploy
- [ ] Changelog

#### Deploy
- [ ] Deploy backend (staging)
- [ ] Deploy frontend (staging)
- [ ] Testes em staging
- [ ] Deploy produção
- [ ] Configurar domínio/SSL
- [ ] Configurar CDN
- [ ] Monitoramento (Sentry/LogRocket)
- [ ] Analytics (Google Analytics/Mixpanel)

**Entregáveis:**
- ✅ Sistema testado (cobertura > 70%)
- ✅ Performance otimizada (Lighthouse > 90)
- ✅ Deploy em produção
- ✅ Documentação completa
- ✅ Monitoramento ativo

---

## 📊 Resumo das Sprints

| Sprint | Foco | Duração | Acumulado |
|--------|------|---------|-----------|
| Sprint 1 | Infraestrutura: Banco de Dados | 3 dias | 3 dias |
| Sprint 2 | Scaffolding: Backend + Frontend | 4 dias | 7 dias |
| Sprint 3 | Backend: Endpoints Públicos | 5 dias | 12 dias |
| Sprint 4 | Backend: Configuração Visual | 5 dias | 17 dias |
| Sprint 5 | Admin: Tela de Configuração | 5 dias | 22 dias |
| Sprint 6 | Público: Home e Cardápio | 5 dias | 27 dias |
| Sprint 7 | Público: Carrinho e Adicionais | 4 dias | 31 dias |
| Sprint 8 | Público: Checkout e Pedido | 5 dias | 36 dias |
| Sprint 9 | Polimento, Testes e Deploy | 4 dias | **40 dias** |

**⏱️ Total Estimado: 40 dias úteis (~8 semanas)**

---

## 🎯 Critérios de Aceitação por Sprint

### ✅ Sprint 1 - Concluída quando:
- Migrations executadas
- Decorator @Public() criado
- Banco de dados pronto

### ✅ Sprint 2 - Concluída quando:
- Todas pastas e arquivos criados (backend + frontend)
- Módulos registrados
- Projeto compila sem erros

### ✅ Sprint 3 - Concluída quando:
- Endpoints públicos retornando dados
- Testes passando

### ✅ Sprint 4 - Concluída quando:
- CRUD de configurações funcionando
- Upload de imagens funcionando

### ✅ Sprint 5 - Concluída quando:
- Tela de configuração funcional
- Salvamento funcionando

### ✅ Sprint 6 - Concluída quando:
- Link público acessível
- Cardápio exibido corretamente
- Cores personalizadas aplicadas

### ✅ Sprint 7 - Concluída quando:
- Modal de adicionais funcional
- Carrinho salvando itens
- Persistência local funcionando

### ✅ Sprint 8 - Concluída quando:
- Pedido sendo criado no banco
- Integração ViaCEP funcionando
- Confirmação exibida

### ✅ Sprint 9 - Concluída quando:
- Testes com cobertura > 70%
- Lighthouse score > 90
- Deploy em produção funcionando

---

## 💡 Recomendações

1. **Trabalhar de forma incremental:** Entregar valor a cada sprint
2. **Testes contínuos:** Não deixar testes apenas para o final
3. **Code review:** Revisar código entre sprints
4. **Daily sync:** Reuniões diárias de 15 minutos
5. **Demo:** Apresentar resultados ao fim de cada sprint
6. **Retrospectiva:** Ajustar processo entre sprints

---

## 📚 Referências

- **Design inspirado em:** iFood, Rappi, Uber Eats
- **Bibliotecas recomendadas:**
  - PrimeNG (componentes UI)
  - ngx-mask (máscaras de input)
  - ngx-image-compress (otimização de imagens)
  - @angular/cdk (drag-and-drop, overlay)

---

## 📝 Notas Finais

- **Mobile First:** A maioria dos clientes usa celular
- **Performance:** Tempo de carregamento < 3 segundos
- **Cache:** Implementar cache do cardápio para reduzir chamadas
- **Analytics:** Adicionar Google Analytics/Mixpanel
- **Monitoramento:** Sentry para erros em produção

---

**Última atualização:** 27/12/2025  
**Versão:** 2.0  
**Status:** Pronto para implementação
