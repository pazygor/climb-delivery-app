# ClimbDelivery - Sistema de Gestão de Pedidos

## 📋 Sobre o Projeto

ClimbDelivery é um sistema web moderno e completo para gestão de pedidos de delivery, desenvolvido com Angular 19+ e PrimeNG.

## 🚀 Tecnologias Utilizadas

- **Angular 19.2+** - Framework frontend
- **PrimeNG 20+** - Biblioteca de componentes UI
- **PrimeFlex** - Utilitários CSS/Flex
- **PrimeIcons** - Biblioteca de ícones
- **SCSS** - Pré-processador CSS
- **RxJS** - Programação reativa
- **TypeScript** - Linguagem principal

## 📦 Estrutura do Projeto

```
src/app/
├── core/                  # Módulo principal (serviços, guards, interceptors, models)
│   ├── guards/           # Guards de roteamento (auth.guard.ts)
│   ├── interceptors/     # HTTP Interceptors (auth.interceptor.ts)
│   ├── services/         # Serviços globais (auth.service.ts, order.service.ts)
│   └── models/           # Interfaces e tipos (user.model.ts, order.model.ts)
├── shared/               # Componentes, pipes e diretivas compartilhadas
│   ├── components/
│   ├── directives/
│   └── pipes/
├── features/             # Módulos de funcionalidades
│   ├── auth/            # Módulo de autenticação
│   │   ├── login/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   └── dashboard/       # Módulo do dashboard
│       ├── orders/      # Tela de pedidos (principal)
│       ├── menu/        # Gestor de cardápio
│       ├── settings/    # Configurações
│       ├── account/     # Minha conta
│       ├── delivery/    # Entregadores
│       └── reports/     # Relatórios
└── layout/              # Componentes de layout
    ├── main-layout/    # Layout principal
    ├── sidebar/        # Menu lateral
    └── header/         # Cabeçalho
```

## 🔧 Instalação e Configuração

### Pré-requisitos

- Node.js 20.11+
- npm 10+
- Angular CLI 19+

### Passos para Instalação

1. **Instale as dependências**

```bash
npm install --legacy-peer-deps
```

2. **Execute o projeto**

```bash
npm start
# ou
ng serve
```

3. **Acesse no navegador**

```
http://localhost:4200
```

## 👤 Credenciais de Teste

### Área Administrativa (Super Admin)
- **Email:** admin@climbdelivery.com
- **Senha:** 123456
- **Acesso:** Área administrativa completa para gerenciar a plataforma SaaS

### Área do Restaurante
- **Email:** restaurante@climbdelivery.com
- **Senha:** rest123
- **Acesso:** Dashboard do restaurante para gerenciar pedidos e cardápio

## 📱 Funcionalidades Principais

### 🔐 Autenticação
- [x] Login com validação de formulário e redirecionamento baseado em role
- [x] Esqueci a senha (mock)
- [x] Redefinir senha (mock)
- [x] Guard de proteção de rotas
- [x] Interceptor para adicionar token JWT
- [x] Sistema de permissões (SUPER_ADMIN, RESTAURANT_OWNER, etc)

### 🛡️ Área Administrativa (Super Admin)
- [x] **Dashboard Admin** - Métricas consolidadas de toda a plataforma
  - KPIs (Total Clientes, MRR, Tickets, Churn Rate)
  - Gráficos de crescimento e receita
  - Estatísticas de suporte e financeiras
- [x] **Gestão de Clientes** - CRUD completo de restaurantes
  - Lista com filtros por status
  - Ativar/Suspender clientes
  - Visualizar detalhes completos
- [x] **Assinaturas & Planos** - Estrutura preparada
  - Planos (Básico R$97, Pro R$197, Enterprise R$497)
  - Assinaturas ativas e histórico
  - Gestão de cobranças
- [x] **Relatórios Consolidados** - Estrutura preparada
  - Performance geral da plataforma
  - Receita e faturamento
  - Análise de churn
  - Uso da plataforma por cliente
- [x] **Sistema de Suporte** - Estrutura preparada
  - Tickets com prioridades e categorias
  - Base de conhecimento
  - Métricas de atendimento
- [x] **Configurações da Plataforma** - Estrutura preparada

### 📊 Dashboard (Restaurantes)
- [x] **Meus Pedidos** - Gerenciamento de pedidos em kanban (3 colunas)
  - Em Análise
  - Em Produção
  - Pronto para Entrega
- [x] **Gestor de Cardápio** - Placeholder para produtos, categorias e adicionais
- [x] **Configurações** - Formulário de estabelecimento
- [x] **Minha Conta** - Gerenciamento de perfil e senha
- [x] **Entregadores** - Lista de entregadores (mock)
- [x] **Relatórios** - Dashboard de métricas e estatísticas

### 🎨 Layout e UX
- [x] Sidebar com menu hierárquico
- [x] Header com informações do usuário
- [x] Design responsivo (mobile, tablet, desktop)
- [x] Tema moderno Lara Light Blue
- [x] Animações e transições suaves
- [x] Feedback visual com toasts

## 🔄 Integração com Backend (Preparado)

O projeto está estruturado para fácil integração com backend NestJS + Prisma + PostgreSQL:

- **AuthService**: Métodos prontos para substituir mocks por chamadas HTTP
- **OrderService**: Estrutura preparada para requisições REST
- **Interceptor**: Configurado para adicionar JWT em headers
- **Models**: Interfaces TypeScript prontas para uso

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
npm start              # Inicia o servidor de desenvolvimento
ng serve              # Alternativa ao npm start

# Build
npm run build         # Build de produção
ng build              # Build de desenvolvimento

# Testes
npm test              # Executa testes unitários
```

## 🎯 Próximos Passos (Roadmap)

### Integração e Backend
- [ ] Integração com backend NestJS
- [ ] Sistema de notificações em tempo real (WebSocket)
- [ ] Gateway de pagamento (Stripe/Mercado Pago)

### Área Administrativa
- [ ] Formulário completo de cadastro de clientes
- [ ] Detalhes avançados do cliente com histórico
- [ ] Editor de planos e precificação dinâmica
- [ ] Relatórios com exportação (PDF/Excel)
- [ ] Sistema de tickets completo com chat
- [ ] Gestão de usuários admin com permissões granulares
- [ ] Logs de auditoria

### Área do Restaurante
- [ ] Implementar CRUD completo de produtos
- [ ] Implementar CRUD de categorias e adicionais
- [x] Impressão de pedidos (via navegador)
- [ ] Relatórios avançados com gráficos
- [ ] Módulo de cupons e promoções
- [ ] Gestão de estoque

---

## 🚀 Deploy em Produção

> **📦 Projeto com 2 Repositórios:**
> - Frontend: https://github.com/pazygor/climb-delivery-app
> - Backend: https://github.com/pazygor/climb-delivery-api
> 
> **📄 Arquivos de deploy neste diretório:** [DEPLOY_README.md](DEPLOY_README.md)

**🎯 Qual método escolher?** [Comparação completa dos 3 métodos](docs/COMPARACAO_METODOS_DEPLOY.md)

### Guia Rápido de Deploy

**📖 Passo a Passo Completo:** [Deploy Prático - climbdelivery.com.br](docs/DEPLOY_PRATICO_PASSO_A_PASSO.md)

1. **Configurar DNS** → Apontar domínio para `37.27.219.39`
2. **Clonar repos** → `git clone` dos 2 repositórios na VM
3. **Build Docker** → Build manual do backend e frontend
4. **Deploy Portainer** → Stack com `docker-compose.portainer.yml`
5. **Migrations** → `docker exec ... npx prisma migrate deploy`

**📁 Estrutura na VM:** 
```
/opt/
├── climb-delivery-app/     ← Frontend (repo)
└── climb-delivery-api/     ← Backend (repo)
```

**📚 Mais detalhes:** [Estrutura de Deploy](docs/ESTRUTURAS_DEPLOY.md)

### Portainer Stacks (⭐ Recomendado)

Melhor método se você já tem Portainer instalado:

1. **Build na VM:**
   ```bash
   cd /opt/climb-delivery
   ./build.sh
   ```

2. **Deploy via Portainer UI:**
   - Acesse Portainer → Stacks → Add stack
   - Use `docker-compose.portainer.yml`
   - Configure variáveis de ambiente
   - Deploy!

**📘 Guia completo:** [docs/DEPLOY_PORTAINER_STACKS.md](docs/DEPLOY_PORTAINER_STACKS.md)

### Métodos Alternativos

- **GitHub Actions:** Pipeline CI/CD automático - [docs/GUIA_DEPLOY_DOCKER.md](docs/GUIA_DEPLOY_DOCKER.md)
- **Deploy Tradicional:** Nginx + PM2 - [docs/GUIA_DEPLOY_HETZNER.md](docs/GUIA_DEPLOY_HETZNER.md)

### Requisitos de Infraestrutura

| Componente | Mínimo | Recomendado |
|------------|--------|-------------|
| RAM | 2GB | 4GB+ |
| CPU | 1 vCPU | 2+ vCPUs |
| Disco | 20GB | 40GB+ |
| Containers | MySQL, Backend, Frontend | + Redis (cache) |

---

**ClimbDelivery** - Sistema de Gestão de Pedidos para Delivery 🚀
