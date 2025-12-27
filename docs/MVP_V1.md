# 📦 ClimbDelivery — MVP 1.0

**Documento Técnico de Escopo (Fechado)**

---

## 🎯 Objetivo do MVP

Entregar um sistema SaaS funcional para restaurantes, permitindo:

✅ Configuração de cardápio  
✅ Geração de link público  
✅ Recebimento de pedidos  
✅ Impressão automática dos pedidos na cozinha e opcional dentro do modal do pedido

**O MVP deve ser:**
- ✅ Vendável
- ✅ Operável em restaurante real
- ✅ Com baixo custo de suporte

---

## 🖥️ Área Logada do Restaurante (Frontend)

### 1️⃣ Meus Pedidos (CORE) ⭐

**Status:** ✅ Tela básica implementada | 🔴 Precisa melhorias

**Header da Tela:**
- [ ] Botão **"Atualizar"** - Recarrega a lista de pedidos
- [ ] Botão **"+ Novo Pedido"** - Abre modal para criar pedido manualmente
  - [ ] Modal deve conter formulário completo de pedido
  - [ ] Permite selecionar cliente, produtos, adicionais, forma de pagamento
  - [ ] Ao criar, pedido entra com status `ANALISE`

**Funcionalidades:**
- [ ] Listagem de pedidos em tempo real
- [ ] Filtros por status (Análise, Preparando, Pronto, Entregue, Cancelado)
- [ ] Filtro por período (hoje, ontem, últimos 7 dias, personalizado)
- [ ] Modal de detalhes do pedido
- [ ] Ações:
  - [ ] Aceitar pedido
  - [ ] Cancelar pedido
  - [ ] Marcar como preparando
  - [ ] Marcar como pronto
  - [ ] Marcar como entregue
  - [ ] Reimprimir pedido (opcional no modal)
- [ ] Notificação sonora para novos pedidos
- [ ] Badge de contador de pedidos pendentes

**Regras de Negócio:**
- Novos pedidos entram com status `ANALISE`
- Pedidos criados manualmente via "+ Novo Pedido" também entram em `ANALISE`
- Apenas pedidos em `ANALISE` podem ser aceitos ou cancelados
- Fluxo: `ANALISE` → `PREPARANDO` → `PRONTO` → `ENTREGUE`
- Pedidos aparecem em ordem cronológica (mais recentes primeiro)

---

### 2️⃣ Gestor de Cardápio (CORE) ⭐

**Status:** 🔴 Não implementado

**Estrutura do Menu:**
- 📋 **Gestor** - Tela principal (categorias + produtos)
- ➕ **Adicionais** - Gerenciamento de grupos de adicionais

---

#### 📋 TELA: Gestor

**Conceito:** Visualização hierárquica onde cada categoria contém seus produtos (itens).

**Header da Tela:**
- [ ] Barra de busca/filtro (pesquisar por categoria ou produto)
- [ ] Botão **"+ Nova categoria"** (cria categoria)
- [ ] Dropdown de ações globais

**Estrutura Hierárquica:**

##### 🗂️ CATEGORIA (Nível 1)
- [ ] **Visual:** Card/linha expansível com:
  - Nome da categoria
  - Indicador de quantidade de itens
  - Badge "Itens principais" (opcional)
  - Toggle expandir/colapsar
  
- [ ] **Toggle "Esgotar tudo":**
  - [ ] Esgota TODOS os itens daquela categoria de uma vez
  - [ ] Feedback visual: categoria fica com indicador de "esgotada"
  - [ ] Ao desmarcar: volta todos os itens para disponível

- [ ] **Botão "Ações categoria"** (dropdown):
  - [ ] **Editar** - Abre modal/drawer para editar nome e descrição
  - [ ] **Duplicar** - Cria cópia da categoria com todos os produtos
  - [ ] **Excluir** - Valida se tem produtos antes de excluir
    - Se tiver produtos: exibe aviso e opções (mover produtos, excluir tudo)
    - Se não tiver: exclui direto com confirmação

- [ ] **Campos da Categoria:**
  - Nome (obrigatório)
  - Descrição (opcional)
  - Ordem de exibição (drag-and-drop ou número)
  - Ativo/Inativo

##### 🍔 ITEM/PRODUTO (Nível 2 - Dentro da Categoria)

**Visual:** Cards/linhas dentro da categoria expandida

- [ ] **Elementos visuais:**
  - Imagem do produto (thumbnail)
  - Nome do item
  - Preço ("A partir de R$ X,XX" se tiver adicionais)
  - Link/ícone indicando se tem adicionais vinculados
  - Badge de status: "Disponível" | "Esgotado"

- [ ] **Toggle "Esgotar"** (individual por item):
  - [ ] Marca o item como esgotado
  - [ ] Item fica visualmente diferenciado (opacidade, cor)
  - [ ] No link público: item aparece como "Esgotado"

- [ ] **Botão "Ações do item"** (dropdown):
  - [ ] **Editar item** - Abre formulário completo do produto
  - [ ] **Duplicar item** - Cria cópia do produto na mesma categoria
  - [ ] **Editar adicionais** - Abre modal para vincular/desvincular grupos de adicionais
  - [ ] **Excluir item** - Confirmação antes de excluir

- [ ] **Campos do Item/Produto:**
  - Nome (obrigatório)
  - Descrição (opcional, texto longo)
  - Categoria (select, obrigatório)
  - Preço base (obrigatório)
  - Imagem (upload, formatos: jpg, png, webp, max 2MB)
  - Tempo de preparo em minutos (opcional)
  - Grupos de adicionais vinculados (múltipla seleção)
  - Status: Disponível/Esgotado

**Funcionalidades Adicionais:**
- [ ] **Drag-and-drop:**
  - [ ] Reordenar categorias
  - [ ] Reordenar produtos dentro da categoria
  - [ ] Mover produto de uma categoria para outra

- [ ] **Filtros/Busca:**
  - [ ] Buscar por nome de categoria ou produto
  - [ ] Filtrar por: Todos | Disponíveis | Esgotados
  - [ ] Filtrar por categoria específica

- [ ] **Indicadores visuais:**
  - [ ] Contador de itens por categoria: "5 itens (2 esgotados)"
  - [ ] Badge de "Esgotado" em produtos inativos
  - [ ] Ícone/badge indicando produtos com adicionais

---

#### ➕ TELA: Adicionais

**Conceito:** Gerenciamento de **Grupos de Adicionais reutilizáveis** que podem ser vinculados a múltiplos produtos.

**Header da Tela:**
- [ ] Barra de busca (pesquisar grupos)
- [ ] Botão **"+ Novo grupo de adicionais"**

**Listagem de Grupos:**
- [ ] Cards ou tabela com os grupos cadastrados
- [ ] Informações exibidas:
  - Nome do grupo
  - Tipo: Radio (escolha única) ou Checkbox (múltipla escolha)
  - Quantidade de itens no grupo
  - Quantidade de produtos usando este grupo
  - Status: Ativo/Inativo

**Ações por Grupo:**
- [ ] **Editar grupo** - Abre modal/drawer
- [ ] **Duplicar grupo** - Cria cópia
- [ ] **Excluir grupo** - Valida se está vinculado a produtos
  - Se estiver vinculado: exibe lista de produtos e pede confirmação
  - Se não estiver: exclui com confirmação simples
- [ ] **Gerenciar itens** - Abre tela para adicionar/editar/remover itens do grupo

**Estrutura de Grupo de Adicionais:**

##### Configurações do Grupo:
- [ ] **Nome do grupo** (ex: "Ponto da Carne", "Adicionais de Hambúrguer")
- [ ] **Tipo de seleção:**
  - `RADIO` - Escolha única obrigatória
  - `CHECKBOX` - Múltipla escolha
- [ ] **Obrigatório:** Sim/Não
  - Se sim: cliente precisa selecionar ao menos 1 item
- [ ] **Mínimo de seleções** (para CHECKBOX)
- [ ] **Máximo de seleções** (para CHECKBOX)
- [ ] **Ordem de exibição** (no produto)

##### Itens dentro do Grupo:
- [ ] **Listagem dos itens** (sub-itens do grupo)
- [ ] Cada item tem:
  - Nome do adicional (ex: "Queijo extra", "Bacon")
  - Preço adicional (R$ 0,00 se não cobrar extra)
  - Ordem de exibição
  - Status: Ativo/Inativo
- [ ] **Ações por item:**
  - Editar
  - Duplicar
  - Excluir
  - Reordenar (drag-and-drop)

**Exemplo de Uso Completo:**
```
📦 Produto: X-Burguer Especial (R$ 25,00)
│
├─ 🔘 Grupo: "Ponto da Carne" (obrigatório, escolha única)
│  ├─ Mal passado (R$ 0,00)
│  ├─ Ao ponto (R$ 0,00) ✓ [selecionado]
│  └─ Bem passado (R$ 0,00)
│
├─ ☑️ Grupo: "Adicionais" (opcional, múltipla escolha, max: 5)
│  ├─ Queijo extra (R$ 3,00) ✓
│  ├─ Bacon (R$ 4,00) ✓
│  ├─ Ovo (R$ 2,50)
│  ├─ Cebola caramelizada (R$ 2,00)
│  └─ Molho especial (R$ 1,50)
│
└─ ☑️ Grupo: "Remover ingredientes" (opcional)
   ├─ Sem alface (R$ 0,00) ✓
   ├─ Sem tomate (R$ 0,00)
   └─ Sem cebola (R$ 0,00)

Total do item: R$ 25,00 + R$ 3,00 + R$ 4,00 = R$ 32,00
```

**Fluxo de Vinculação:**
1. Criar grupos de adicionais na tela "Adicionais"
2. Na tela "Gestor", ao editar um produto: selecionar quais grupos vincular
3. Cliente no link público verá apenas os grupos vinculados àquele produto

---

### 3️⃣ Configurações → Estabelecimento (CORE) ⭐

**Status:** 🔴 Não implementado

**Campos Obrigatórios:**
- [ ] Nome do restaurante
- [ ] Logo (upload de imagem)
- [ ] Horário de funcionamento
  - [ ] Horário de abertura
  - [ ] Horário de fechamento
  - [ ] Dias da semana (checkbox)
  - [ ] Horários especiais (feriados, etc) - OPCIONAL no MVP
- [ ] Taxa de entrega (valor fixo para MVP)
- [ ] Pedido mínimo
- [ ] WhatsApp de contato (para notificações)

**Campos Adicionais (MVP):**
- [ ] Endereço completo
- [ ] CNPJ
- [ ] Status: Aberto/Fechado (toggle manual)
- [ ] Tempo médio de entrega (minutos)

**Funcionalidades:**
- [ ] Upload de logo (max 2MB, formatos: jpg, png, webp)
- [ ] Preview da logo
- [ ] Validação de CNPJ
- [ ] Máscara de telefone/WhatsApp
- [ ] Geração automática do slug (baseado no nome)
- [ ] Visualização do link público: `https://climbdelivery.app/{slug}`

---

### 4️⃣ Minha Conta

**Status:** ✅ Tela básica implementada | 🔴 Precisa funcionalidades

**Funcionalidades:**
- [ ] Editar nome
- [ ] Editar email (com confirmação)
- [ ] Alterar senha
  - [ ] Senha atual (obrigatória)
  - [ ] Nova senha
  - [ ] Confirmar nova senha
  - [ ] Validação: mínimo 6 caracteres
- [ ] Upload de foto de perfil (opcional)
- [ ] Exibir role/permissão (read-only)
- [ ] Data de cadastro (read-only)

---

### 5️⃣ Relatórios → Pedidos (Básico)

**Status:** 🔴 Não implementado

**KPIs Principais:**
- [ ] Total de pedidos (no período)
- [ ] Faturamento total (no período)
- [ ] Ticket médio
- [ ] Taxa de cancelamento

**Filtros:**
- [ ] Filtro por período:
  - Hoje
  - Ontem
  - Últimos 7 dias
  - Últimos 30 dias
  - Personalizado (data início/fim)

**Visualizações:**
- [ ] Cards com totalizadores
- [ ] Gráfico de linha: Faturamento por dia
- [ ] Gráfico de pizza: Pedidos por forma de pagamento
- [ ] Tabela: Top 10 produtos mais vendidos

**Exportação (Opcional MVP):**
- [ ] Exportar para Excel/CSV

---

## 🌐 Link Público do Restaurante (CORE) ⭐

**Status:** 🔴 Não implementado

### URL Pública
```
https://climbdelivery.app/{slug-do-restaurante}
```

### Funcionalidades

#### 🏠 Página Principal
- [ ] Header:
  - Logo do restaurante
  - Nome do restaurante
  - Status: Aberto/Fechado
  - Horário de funcionamento
  - WhatsApp (link direto)
- [ ] Banner/Hero (opcional)
- [ ] Informações:
  - Taxa de entrega
  - Pedido mínimo
  - Tempo médio de entrega

#### 📋 Listagem de Produtos
- [ ] Categorias como menu/tabs fixos
- [ ] Produtos em cards:
  - Imagem
  - Nome
  - Descrição resumida
  - Preço
  - Botão "Adicionar"
- [ ] Busca de produtos (opcional MVP)
- [ ] Badge "Esgotado" em produtos inativos

#### ➕ Modal de Seleção de Adicionais
- [ ] Abrir ao clicar em "Adicionar"
- [ ] Exibir grupos de adicionais:
  - Radio buttons para escolha única
  - Checkboxes para múltipla escolha
  - Validação de obrigatoriedade
  - Validação de min/max seleções
- [ ] Campo de observações do item
- [ ] Cálculo do preço total (produto + adicionais)
- [ ] Contador de quantidade
- [ ] Botão "Adicionar ao carrinho"

#### 🛒 Carrinho
- [ ] Ícone flutuante com badge de quantidade
- [ ] Drawer/Sidebar do carrinho:
  - Listagem de itens
  - Quantidade de cada item
  - Editar item (reabrir modal de adicionais)
  - Remover item
  - Subtotal
  - Taxa de entrega
  - **Total geral**
- [ ] Validação de pedido mínimo
- [ ] Botão "Finalizar Pedido"

#### 📝 Finalização do Pedido
- [ ] Formulário com campos obrigatórios:
  - **Nome do cliente**
  - **Telefone** (com máscara)
  - **Tipo de pedido:**
    - 🚚 Entrega
    - 🏃 Retirada
  - **Se Entrega:**
    - Endereço completo
    - Número
    - Complemento
    - Bairro
    - CEP (com busca automática - opcional MVP)
    - Ponto de referência
  - **Forma de pagamento:**
    - Dinheiro (campo: troco para quanto?)
    - Cartão de Débito
    - Cartão de Crédito
    - PIX
  - **Observações** (opcional)
- [ ] Resumo do pedido (revisão antes de confirmar)
- [ ] Termos e condições (checkbox)
- [ ] Botão "Confirmar Pedido"

#### ✅ Confirmação do Pedido
- [ ] Tela de sucesso:
  - Número do pedido
  - Tempo estimado
  - WhatsApp do restaurante (para acompanhar)
  - Botão "Fazer novo pedido"
- [ ] **Salvar pedido no banco**
- [ ] **Disparar evento `order.created`**
- [ ] **Pedido aparece na área logada (Meus Pedidos)**
- [ ] **Enviar pedido para impressão automática**

### Responsividade
- [ ] Mobile first (maioria dos clientes usa celular)
- [ ] Desktop (visualização também)

### Performance
- [ ] Lazy loading de imagens
- [ ] Cache de cardápio
- [ ] SEO básico (meta tags)

---

## 🧾 Impressão de Pedidos (CORE) ⭐

**Status:** 🔴 Não implementado

### Conceito
Impressão automática do pedido na cozinha via **agente local** instalado no computador do restaurante.

### Arquitetura

#### Backend (NestJS)
- [ ] Endpoint de eventos (WebSocket ou SSE)
- [ ] Evento `order.created` ao criar pedido
- [ ] Autenticação por token do restaurante
- [ ] Payload do evento:
  ```json
  {
    "event": "order.created",
    "restaurantId": "uuid",
    "order": {
      "id": "uuid",
      "number": 123,
      "customer": {...},
      "items": [...],
      "total": 45.50,
      "createdAt": "2025-12-19T10:30:00Z"
    }
  }
  ```

#### Agente Local (Node.js)
- [ ] Aplicação standalone Node.js
- [ ] Escuta eventos do restaurante autenticado
- [ ] Conecta via WebSocket/SSE
- [ ] Reconexão automática
- [ ] Impressão via ESC/POS (biblioteca `node-thermal-printer`)
- [ ] Configuração via `.env`

**Exemplo `.env`:**
```env
RESTAURANT_ID=uuid-do-restaurante
API_URL=https://api.climbdelivery.app
API_TOKEN=token-jwt-do-restaurante
PRINTER_NAME=EPSON_TM_T20
PAPER_WIDTH=80
AUTO_PRINT=true
```

#### Impressoras Suportadas (MVP)
- [ ] Impressoras térmicas 80mm ESC/POS
- [ ] Modelos: Epson TM-T20, Daruma, Bematech, etc
- [ ] Conexão: USB (MVP) | Rede (futuro)

### Layout de Impressão (MVP)

**⚠ Layout fixo no MVP (sem customização)**

```
========================================
        NOME DO RESTAURANTE
========================================
Pedido Nº: 00123
Data: 19/12/2025 às 10:30

----------------------------------------
CLIENTE
Nome: João Silva
Tel: (11) 98765-4321
Tipo: 🚚 Entrega

ENDEREÇO
Rua das Flores, 123 - Apto 45
Bairro: Centro
Ref: Próximo ao mercado
----------------------------------------
ITENS

1x X-Burguer Especial............R$ 25,00
   + Queijo extra..............R$  3,00
   + Bacon......................R$  4,00
   Obs: Sem cebola

2x Coca-Cola 350ml...............R$ 12,00

1x Batata Frita..................R$ 15,00
   Obs: Bem crocante
----------------------------------------
Subtotal.........................R$ 59,00
Taxa de Entrega..................R$  5,00
========================================
TOTAL............................R$ 64,00
========================================

PAGAMENTO: Dinheiro
Troco para: R$ 100,00

OBSERVAÇÕES:
Entregar no portão dos fundos

========================================
    climbdelivery.app
========================================
```

### Funcionalidades da Impressão
- [ ] Impressão automática ao receber pedido
- [ ] Botão "Reimprimir" dentro do modal do pedido (área logada)
- [ ] Log de impressões (sucesso/erro)
- [ ] Fallback: se impressão falhar, exibir alerta na área logada

---

## 🗄️ Backend - Estrutura Necessária

### Módulos a Implementar/Ajustar

#### ✅ Já Existentes (Revisar)
- [x] AuthModule
- [x] UserModule
- [x] EmpresaModule (= Restaurante)
- [x] CategoriaModule
- [x] ProdutoModule
- [x] GrupoAdicionalModule
- [x] AdicionalModule
- [x] PedidoModule

#### 🔴 Precisa Implementar/Revisar
- [ ] **Pedido:**
  - [ ] Endpoint público `POST /public/:slug/pedidos`
  - [ ] Validações completas
  - [ ] Evento `order.created`
  - [ ] WebSocket/SSE para impressão
- [ ] **Configurações do Estabelecimento:**
  - [ ] CRUD completo
  - [ ] Upload de logo (integração com storage)
  - [ ] Geração/validação de slug único
- [ ] **Relatórios:**
  - [ ] Endpoint de estatísticas
  - [ ] Agregações no banco
- [ ] **Cardápio Público:**
  - [ ] Endpoint `GET /public/:slug/cardapio`
  - [ ] Retornar apenas itens ativos
  - [ ] Incluir grupos de adicionais

### Schema Prisma - Ajustes Necessários

**Revisar/Adicionar:**
- [ ] Tabela `Pedido`: adicionar campos de cliente/endereço
- [ ] Tabela `Empresa`: adicionar campos de configuração (logo, slug, etc)
- [ ] Tabela `StatusPedido`: enum ou tabela separada
- [ ] Relacionamento `Produto <-> GrupoAdicional` (many-to-many)
- [ ] Tabela `PedidoAdicional`: registrar adicionais selecionados

---

## 📋 Checklist de Progresso - MVP 1.0

### Frontend Angular

#### Core Features
- [ ] **Meus Pedidos** (melhorias)
  - [ ] Modal de detalhes completo
  - [ ] Ações de mudança de status
  - [ ] Notificação sonora
  - [ ] Reimprimir pedido
  - [ ] WebSocket para tempo real
- [ ] **Gestor de Cardápio** (novo)
  - [ ] Aba Categorias
  - [ ] Aba Itens/Produtos
  - [ ] Aba Adicionais
  - [ ] Upload de imagens
- [ ] **Configurações do Estabelecimento** (novo)
  - [ ] Formulário completo
  - [ ] Upload de logo
  - [ ] Geração de slug
- [ ] **Minha Conta** (melhorias)
  - [ ] Editar perfil
  - [ ] Alterar senha
- [ ] **Relatórios** (novo)
  - [ ] KPIs básicos
  - [ ] Gráficos
  - [ ] Filtros

#### Link Público
- [ ] **Página Pública** (novo)
  - [ ] Layout responsivo
  - [ ] Listagem de categorias
  - [ ] Listagem de produtos
  - [ ] Modal de adicionais
  - [ ] Carrinho
  - [ ] Finalização de pedido
  - [ ] Tela de confirmação

#### Infraestrutura
- [ ] Substituir todos os mock services por HTTP real
- [ ] Configurar ambiente/variáveis
- [ ] Tratamento de erros global
- [ ] Loading states
- [ ] Validações de formulários

### Backend NestJS

- [ ] **Autenticação**
  - [ ] Login JWT
  - [ ] Refresh token
  - [ ] Guards implementados
- [ ] **CRUD Estabelecimento**
  - [ ] Configurações completas
  - [ ] Upload de logo (S3 ou local)
  - [ ] Validação de slug único
- [ ] **CRUD Categorias**
  - [ ] Ordenação
  - [ ] Ativar/desativar
- [ ] **CRUD Produtos**
  - [ ] Upload de imagens
  - [ ] Vincular grupos de adicionais
- [ ] **CRUD Grupos de Adicionais**
  - [ ] Gerenciar itens do grupo
  - [ ] Validações min/max
- [ ] **CRUD Pedidos**
  - [ ] Endpoint público
  - [ ] Mudança de status
  - [ ] Histórico
- [ ] **Cardápio Público**
  - [ ] Endpoint por slug
  - [ ] Cache
- [ ] **Relatórios**
  - [ ] Agregações
  - [ ] Estatísticas
- [ ] **WebSocket/SSE**
  - [ ] Evento order.created
  - [ ] Autenticação
  - [ ] Sala por restaurante

### Agente de Impressão

- [ ] **Aplicação Node.js**
  - [ ] Conexão WebSocket
  - [ ] Autenticação
  - [ ] Reconexão automática
  - [ ] Integração ESC/POS
  - [ ] Layout de impressão
  - [ ] Configuração via .env
  - [ ] Logs
  - [ ] Tratamento de erros
- [ ] **Distribuível**
  - [ ] Executável Windows
  - [ ] Instalador simples
  - [ ] Documentação de setup

### Banco de Dados

- [ ] Ajustes no schema Prisma
- [ ] Migrations
- [ ] Seeds para testes

### DevOps/Deploy

- [ ] Frontend em produção (Vercel/Netlify)
- [ ] Backend em produção (Railway/Render/VPS)
- [ ] Domínio configurado
- [ ] SSL
- [ ] Variáveis de ambiente
- [ ] Backup do banco

---

## 🎯 Critérios de Aceitação do MVP

✅ **MVP está pronto quando:**

1. Um restaurante consegue se cadastrar e fazer login
2. Consegue configurar seu estabelecimento (logo, horários, etc)
3. Consegue criar categorias e produtos com adicionais
4. Link público funciona: clientes conseguem fazer pedidos
5. Pedidos aparecem na área logada em tempo real
6. Pedidos são impressos automaticamente na cozinha
7. Relatório básico mostra faturamento e total de pedidos
8. Sistema roda em ambiente de produção
9. Pelo menos 1 restaurante piloto operando

---

## 🚫 Fora do Escopo do MVP

❌ **NÃO incluir no MVP:**

- Sistema de entregadores próprios
- Integração com iFood/Rappi
- App mobile nativo
- Sistema de cupons/promoções
- Programa de fidelidade
- Agendamento de pedidos
- Múltiplos métodos de pagamento online
- Chat interno
- Avaliações/reviews
- Multi-idioma
- Temas customizáveis
- Relatórios avançados
- Gestão de estoque
- Gestão financeira completa
- Área administrativa SaaS (fica para v2.0)

---

## 📅 Próximos Passos Imediatos

### Hoje (Prioridade Máxima)

1. [ ] Decidir ordem de implementação
2. [ ] Configurar integração frontend ↔ backend
3. [ ] Começar pelo **Gestor de Cardápio** (base para tudo)

### Esta Semana

- [ ] Completar CRUD de categorias
- [ ] Completar CRUD de produtos
- [ ] Completar CRUD de adicionais
- [ ] Testar fluxo completo de cardápio

### Próxima Semana

- [ ] Desenvolver link público
- [ ] Implementar carrinho e checkout
- [ ] Integrar criação de pedidos

### Semana 3

- [ ] Melhorar área "Meus Pedidos"
- [ ] Implementar mudança de status
- [ ] WebSocket para tempo real

### Semana 4

- [ ] Desenvolver agente de impressão
- [ ] Testar impressão em restaurante piloto
- [ ] Ajustes finais

---

## 📞 Suporte Técnico

**Documento mantido por:** Equipe ClimbDelivery  
**Última atualização:** 19/12/2025  
**Versão:** 1.0 (Escopo fechado)

---

✅ **Este documento é a única fonte da verdade para o MVP 1.0**  
❌ **Qualquer feature fora deste escopo deve ser rejeitada até a v2.0**
