# 📚 Documentação ClimbDelivery

Bem-vindo à documentação do projeto ClimbDelivery! Este diretório contém todos os padrões, convenções e guias de desenvolvimento do projeto.

## 📑 Índice de Documentos

### Padrões de Desenvolvimento
- [Estrutura do Projeto](./ESTRUTURA_PROJETO.md) - Organização de pastas e arquivos
- [Padrões de Componentes](./PADROES_COMPONENTES.md) - Como criar componentes standalone
- [Padrões de Estilos](./PADROES_ESTILOS.md) - PrimeNG, PrimeFlex e SCSS
- [Padrões de Telas](./PADROES_TELAS.md) - Layout e estrutura de páginas
- [Padrões de Roteamento](./PADROES_ROTEAMENTO.md) - Configuração de rotas e guards
- [Padrões de Serviços](./PADROES_SERVICOS.md) - Services, HTTP, interceptors e API

### Guias Práticos
- [Como Criar uma Nova Tela](./GUIA_NOVA_TELA.md) - Passo a passo completo
- [Formulários e Validação](./GUIA_FORMULARIOS.md) - Reactive Forms com validações
- [Gerenciamento de Estados](./GUIA_ESTADOS.md) - Loading, error, empty states

### Documentação de Features
- [Tela Meus Pedidos](./TELA_MEUS_PEDIDOS.md) - Componente de listagem de pedidos
- [Aprimoramento Tela Meus Pedidos](./APRIMORAR_TELA_MEUS_PEDIDOS.md) - Melhorias planejadas

## 🚀 Stack Tecnológica

- **Angular 19.2.19** - Framework principal (standalone components)
- **PrimeNG 20.3.0** - Biblioteca de componentes UI
- **PrimeFlex 4.0.0** - Utilitários CSS responsivos
- **PrimeIcons 7.0.0** - Biblioteca de ícones
- **Chart.js 4.4+** - Biblioteca de gráficos para dashboards
- **RxJS 7.8** - Programação reativa
- **TypeScript 5.7.2** - Linguagem
- **SCSS** - Pré-processador CSS

## 🎨 Design System

### Tema
- **Tema PrimeNG:** Lara (Light Blue)
- **Fonte:** Poppins (300, 400, 500, 600, 700)

### Cores Principais
```scss
--primary-color: #3B82F6;
--surface-ground: #f8fafc;
--text-color: #1e293b;
--text-color-secondary: #64748b;
```

## 📝 Convenções de Nomenclatura

### Arquivos
- Componentes: `nome-componente.component.ts`
- Services: `nome-service.service.ts`
- Models: `nome-model.model.ts`
- Guards: `nome.guard.ts`
- Interceptors: `nome.interceptor.ts`

### Classes e Interfaces
- Componentes: `PascalCase` (ex: `LoginComponent`)
- Services: `PascalCase` + `Service` (ex: `AuthService`)
- Interfaces: `PascalCase` (ex: `User`, `Order`)
- Enums: `PascalCase` (ex: `OrderStatus`, `UserRole`)

### Variáveis e Métodos
- camelCase (ex: `currentUser`, `loadOrders()`)
- Observables terminam com `$` (ex: `authState$`)

## 🏗️ Arquitetura do Projeto

### Áreas da Aplicação

#### 1. **Área de Autenticação** (`/auth`)
- Login, esqueceu senha, redefinir senha
- Sem layout (tela cheia)
- Roteamento baseado em função do usuário

#### 2. **Dashboard de Restaurantes** (`/dashboard`)
- Para usuários com permissões: `RESTAURANT_OWNER`, `RESTAURANT_MANAGER`, `RESTAURANT_EMPLOYEE`
- Layout com sidebar e header
- Módulos: Pedidos, Cardápio, Entregas, Relatórios, Conta, Configurações

#### 3. **Área Administrativa SaaS** (`/admin`)
- **Nova funcionalidade!** Para usuários com permissão `SUPER_ADMIN`
- Layout exclusivo com sidebar administrativa
- Módulos:
  - **Dashboard Admin**: KPIs, gráficos de faturamento, clientes ativos, tickets
  - **Clientes**: Gerenciamento de restaurantes cadastrados
  - **Assinaturas**: Controle de planos e cobranças
  - **Suporte**: Sistema de tickets
  - **Relatórios**: Análises avançadas
  - **Configurações**: Configurações globais do SaaS

### Sistema de Permissões (UserRole)

```typescript
enum UserRole {
  SUPER_ADMIN = 1,        // Acessa /admin (área SaaS)
  RESTAURANT_OWNER = 2,   // Acessa /dashboard (dono do restaurante)
  RESTAURANT_MANAGER = 3, // Acessa /dashboard (gerente)
  RESTAURANT_EMPLOYEE = 4 // Acessa /dashboard (funcionário)
}
```

### Guards de Roteamento

- **`authGuard`**: Protege todas rotas autenticadas
- **`adminGuard`**: Restringe acesso a `SUPER_ADMIN` apenas
- **`homeGuard`**: Previne acesso de usuários autenticados às rotas de login

### Redirecionamento Inteligente

O sistema redireciona automaticamente após login baseado no papel do usuário:
- `SUPER_ADMIN` → `/admin/dashboard`
- Outros → `/dashboard/orders`

## 🔐 Credenciais de Teste

### Usuário Administrador SaaS
**Email:** admin@climbdelivery.com  
**Senha:** 123456  
**Permissão:** SUPER_ADMIN (1)  
**Acesso:** Área administrativa completa

### Usuário Restaurante
**Email:** restaurante@climbdelivery.com  
**Senha:** rest123  
**Permissão:** RESTAURANT_OWNER (2)  
**Acesso:** Dashboard de gerenciamento do restaurante

## 🎨 Componentes Principais

### Layout Components
- `MainLayoutComponent`: Layout para área de restaurantes
- `AdminLayoutComponent`: Layout para área administrativa
- `HeaderComponent`: Cabeçalho com perfil e notificações
- `SidebarComponent`: Menu lateral de restaurantes
- `AdminHeaderComponent`: Cabeçalho administrativo
- `AdminSidebarComponent`: Menu lateral administrativo com estrutura hierárquica

### Services
- `AuthService`: Autenticação e gerenciamento de sessão
- `OrderService`: Gerenciamento de pedidos
- `CustomerService`: Gerenciamento de clientes/restaurantes (admin)
- `SubscriptionService`: Gerenciamento de assinaturas (admin)
- `SupportService`: Sistema de tickets de suporte (admin)

### Models
- `User`: Modelo de usuário com role
- `Order`: Modelo de pedido
- `Customer`: Modelo de cliente/restaurante
- `Subscription`: Modelo de assinatura
- `SupportTicket`: Modelo de ticket de suporte
- `AdminReports`: Modelos para relatórios administrativos

## 📞 Suporte

Para dúvidas sobre os padrões ou estrutura do projeto, consulte os documentos específicos listados acima.

## 🆕 Últimas Atualizações

### v1.1.0 - Área Administrativa SaaS (Novembro 2025)

#### ✨ Novidades
- **Área administrativa completa** para equipe SaaS gerenciar restaurantes
- **Sistema de permissões** baseado em `UserRole` enum (4 níveis)
- **Dashboard administrativo** com KPIs, gráficos de clientes, faturamento e tickets
- **Gerenciamento de clientes** (restaurantes) com filtros e ações CRUD
- **Layout exclusivo** para admin com sidebar hierárquico
- **Redirecionamento inteligente** baseado no papel do usuário após login

#### 🛠️ Melhorias Técnicas
- Implementação de `adminGuard` e `homeGuard` para controle de acesso
- Integração de Chart.js para visualizações de dados
- Lazy loading de rotas administrativas (`/admin`)
- Services mock para Customer, Subscription e Support
- Estrutura preparada para integração com backend real

#### 🐛 Correções
- Compatibilidade com PrimeNG 20+ (severity "warn" ao invés de "warning")
- Uso correto de `filterGlobal()` via ViewChild no p-table
- Eliminação de conflitos de redirecionamento no login
- TypeScript strict mode com uso adequado de enums
- Remoção de operadores `?.` desnecessários

#### 📁 Novos Arquivos
**Models:**
- `customer.model.ts` - Restaurantes/clientes do SaaS
- `subscription.model.ts` - Planos e assinaturas
- `support.model.ts` - Tickets de suporte
- `admin-reports.model.ts` - Relatórios administrativos

**Services:**
- `customer.service.ts` - CRUD de clientes
- `subscription.service.ts` - Gerenciamento de assinaturas
- `support.service.ts` - Sistema de tickets

**Guards:**
- `admin.guard.ts` - Proteção de rotas admin
- `home.guard.ts` - Prevenção de acesso a login por usuários autenticados

**Components:**
- `admin-layout/` - Layout administrativo
- `admin-header/` - Cabeçalho admin
- `admin-sidebar/` - Menu lateral admin
- `admin-dashboard/` - Dashboard com KPIs e gráficos
- `customers-list/` - Listagem de clientes com filtros

**Routes:**
- `admin.routes.ts` - Rotas da área administrativa

---

**Documentação atualizada:** 11/11/2025
