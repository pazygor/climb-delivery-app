# 🔐 Área Administrativa - ClimbDelivery SaaS

## 📋 Visão Geral

A área administrativa foi criada para gerenciar a plataforma ClimbDelivery de forma centralizada. Aqui você pode gerenciar clientes (restaurantes), assinaturas, suporte e muito mais.

## 🚀 Acesso

### Credenciais de Teste

**Área Administrativa (Super Admin):**
- **Email:** `admin@climbdelivery.com`
- **Senha:** `admin123`
- **Acesso:** `/admin`

**Área do Restaurante:**
- **Email:** `restaurante@climbdelivery.com`
- **Senha:** `rest123`
- **Acesso:** `/dashboard`

## 📂 Estrutura Criada

### 1. **Models** (`core/models/`)
- ✅ `customer.model.ts` - Gestão de clientes (restaurantes)
- ✅ `subscription.model.ts` - Assinaturas e planos
- ✅ `support.model.ts` - Sistema de suporte/tickets
- ✅ `admin-reports.model.ts` - Relatórios administrativos

### 2. **Services** (`core/services/`)
- ✅ `customer.service.ts` - CRUD de clientes com dados mock
- ✅ `subscription.service.ts` - Gestão de planos e cobranças
- ✅ `support.service.ts` - Tickets e base de conhecimento

### 3. **Guards** (`core/guards/`)
- ✅ `admin.guard.ts` - Protege rotas administrativas (apenas SUPER_ADMIN)

### 4. **Feature Admin** (`features/admin/`)
- ✅ `admin-dashboard/` - Dashboard com métricas consolidadas
- ✅ `customers/` - Lista e gestão de clientes
- ✅ `admin.routes.ts` - Rotas da área administrativa

### 5. **Layout Admin** (`layout/`)
- ✅ `admin-layout/` - Layout específico para área admin
- ✅ `admin-header/` - Cabeçalho customizado
- ✅ `admin-sidebar/` - Menu lateral com itens administrativos

## 🎨 Funcionalidades Implementadas

### 📊 Dashboard Administrativo
- KPIs principais (Total de Clientes, MRR, Tickets, Churn Rate)
- Gráfico de crescimento de clientes
- Gráfico de receita mensal
- Estatísticas de suporte
- Métricas financeiras consolidadas

### 🏢 Gestão de Clientes
- Lista completa de restaurantes cadastrados
- Filtros por status (Ativo, Trial, Suspenso, Inativo)
- Busca por nome, email ou CNPJ
- Ações: Visualizar, Ativar, Suspender, Excluir
- Informações: Plano, pedidos, receita, data de cadastro

### Menu Lateral (Sidebar)

#### 📊 Dashboard
- Visão geral da plataforma

#### 🏢 Gestão de Clientes
- Lista de Clientes
- Novo Cliente

#### 💳 Assinaturas & Planos
- Planos Disponíveis (Basic, Pro, Enterprise)
- Assinaturas Ativas
- Histórico de Cobrança

#### 📈 Relatórios
- Performance Geral
- Receita da Plataforma
- Churn Analysis
- Uso da Plataforma

#### 🎫 Suporte
- Tickets Abertos
- Base de Conhecimento

#### ⚙️ Configurações
- Configurações Gerais
- Integrações
- Usuários Admin
- Logs do Sistema

## 🔄 Fluxo de Autenticação

1. Usuário faz login em `/login`
2. Sistema verifica o `role` do usuário:
   - **SUPER_ADMIN (1)** → Redireciona para `/admin`
   - **RESTAURANT_OWNER (2+)** → Redireciona para `/dashboard`
3. O `adminGuard` protege todas as rotas `/admin/*`
4. Apenas usuários com role SUPER_ADMIN podem acessar

## 📊 Dados Mock Disponíveis

### Clientes
- 4 restaurantes cadastrados com diferentes status
- Dados completos: nome, proprietário, contato, endereço, plano, etc.

### Planos
- **Básico:** R$ 97/mês - até 500 pedidos
- **Pro:** R$ 197/mês - até 2000 pedidos
- **Enterprise:** R$ 497/mês - ilimitado

### Tickets de Suporte
- 4 tickets com diferentes status e categorias
- Histórico de mensagens

## 🎯 Próximos Passos (Sugestões)

### Componentes para Criar
- [ ] Formulário de cadastro/edição de clientes
- [ ] Detalhes completos do cliente
- [ ] Gestão de planos (criar, editar, desativar)
- [ ] Lista de assinaturas com filtros avançados
- [ ] Histórico de cobranças/faturas
- [ ] Sistema de tickets completo
- [ ] Editor de base de conhecimento
- [ ] Relatórios com gráficos avançados
- [ ] Configurações gerais da plataforma
- [ ] Gestão de usuários admin
- [ ] Logs de auditoria

### Integrações Futuras
- [ ] Gateway de pagamento (Stripe, Mercado Pago)
- [ ] Sistema de notificações por email
- [ ] Exportação de relatórios (PDF, Excel)
- [ ] Chat em tempo real com clientes
- [ ] Webhooks para eventos importantes
- [ ] API REST para integrações externas

## 💡 Dicas de Uso

1. **Desenvolvimento:** Use as credenciais mock para testar
2. **Dados Mock:** Todos os services têm delays simulando chamadas HTTP
3. **Expansão:** Para adicionar novos itens ao menu, edite `admin-sidebar.component.ts`
4. **Novos Componentes:** Crie em `features/admin/` e adicione rota em `admin.routes.ts`
5. **Proteção:** Sempre use `adminGuard` nas novas rotas administrativas

## 🔒 Segurança

- ✅ Guard de autenticação implementado
- ✅ Verificação de role antes do acesso
- ✅ Redirecionamento automático baseado em permissão
- ✅ Token JWT pronto para integração com backend
- ⏳ **TODO:** Implementar renovação de token
- ⏳ **TODO:** Implementar 2FA para super admins
- ⏳ **TODO:** Logs de auditoria para ações críticas

## 📱 Responsividade

- ✅ Layout adaptável para mobile, tablet e desktop
- ✅ Sidebar colapsável
- ✅ Tabelas com scroll horizontal em telas pequenas
- ✅ Cards empilháveis em mobile

---

**Desenvolvido para ClimbDelivery SaaS Platform** 🚀
