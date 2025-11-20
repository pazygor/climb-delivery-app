# Documentação do Schema Prisma - Climb Delivery

## Índice
- [Visão Geral](#visão-geral)
- [Configuração do Banco](#configuração-do-banco)
- [Tabelas Core do Sistema](#tabelas-core-do-sistema)
- [Tabelas de Delivery](#tabelas-de-delivery)
- [Sistema de Adicionais](#sistema-de-adicionais)
- [Tabelas de Pedidos](#tabelas-de-pedidos)
- [Relacionamentos](#relacionamentos)
- [Convenções e Padrões](#convenções-e-padrões)

---

## Visão Geral

O schema Prisma do Climb Delivery foi projetado para suportar um sistema completo de delivery multi-empresa, com gestão de produtos, pedidos, adicionais customizáveis e controle de permissões.

### Principais Características:
- **Multi-empresa**: Sistema preparado para múltiplas empresas
- **Sistema de Adicionais Flexível**: Grupos de adicionais com validações
- **Controle de Permissões**: Diferentes níveis de acesso (admin, cliente, entregador)
- **Rastreamento Completo**: Histórico de mudanças de status dos pedidos
- **Soft Delete**: Desativação via flag `ativo` ao invés de exclusão física

---

## Configuração do Banco

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

- **Banco de Dados**: MySQL
- **Cliente**: prisma-client-js
- **Conexão**: Variável de ambiente `DATABASE_URL`

---

## Tabelas Core do Sistema

### 1. Empresa

Representa cada estabelecimento cadastrado no sistema.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | Int | Identificador único (auto-incremento) |
| `cnpj` | String(14) | CNPJ único da empresa |
| `razaoSocial` | String | Razão social da empresa |
| `nomeFantasia` | String? | Nome fantasia (opcional) |
| `telefone` | String? | Telefone de contato |
| `email` | String? | E-mail de contato |
| **Endereço** | | |
| `endereco` | String | Logradouro |
| `numero` | String? | Número do estabelecimento |
| `complemento` | String? | Complemento (sala, andar, etc) |
| `bairro` | String | Bairro |
| `cidade` | String | Cidade |
| `uf` | String(2) | Unidade Federativa (sigla) |
| `cep` | String(8) | CEP sem formatação |
| **Configurações** | | |
| `ativo` | Boolean | Status da empresa (padrão: true) |
| `logo` | String? | URL ou base64 da logo |
| `horarioAbertura` | String? | Horário de abertura (ex: "08:00") |
| `horarioFechamento` | String? | Horário de fechamento (ex: "22:00") |
| `taxaEntrega` | Decimal(10,2) | Taxa de entrega padrão |
| `tempoMedioEntrega` | Int? | Tempo médio em minutos |
| `createdAt` | DateTime | Data de criação |
| `updatedAt` | DateTime | Data de atualização |

**Relacionamentos:**
- `usuarios[]`: Lista de usuários da empresa
- `categorias[]`: Categorias de produtos
- `produtos[]`: Produtos da empresa
- `pedidos[]`: Pedidos recebidos
- `gruposAdicionais[]`: Grupos de adicionais

**Índices:**
- `cnpj`: UNIQUE

---

### 2. Usuario

Representa todos os usuários do sistema (administradores, clientes, entregadores).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | Int | Identificador único |
| `empresaId` | Int | FK para Empresa |
| `nome` | String | Nome completo |
| `email` | String | E-mail único no sistema |
| `senha` | String | Senha hash (bcrypt) |
| `telefone` | String? | Telefone de contato |
| `cpf` | String(11)? | CPF único (opcional) |
| `foto` | String? | URL ou base64 da foto |
| `permissaoId` | Int | FK para Permissao |
| `ativo` | Boolean | Status do usuário |
| `createdAt` | DateTime | Data de criação |
| `updatedAt` | DateTime | Data de atualização |

**Relacionamentos:**
- `empresa`: Empresa (CASCADE on delete)
- `permissao`: Permissao
- `enderecos[]`: Endereços do usuário
- `pedidos[]`: Pedidos realizados

**Índices:**
- `email`: UNIQUE
- `cpf`: UNIQUE

---

### 3. Permissao

Define os níveis de acesso no sistema.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | Int | Identificador único |
| `nome` | String | Nome da permissão (UNIQUE) |
| `descricao` | String? | Descrição da permissão |

**Valores Esperados:**
- `admin`: Administrador do sistema
- `cliente`: Cliente que faz pedidos
- `entregador`: Responsável pelas entregas

**Relacionamentos:**
- `usuarios[]`: Usuários com esta permissão

**Índices:**
- `nome`: UNIQUE

---

## Tabelas de Delivery

### 4. Categoria

Organiza os produtos em categorias (ex: Lanches, Bebidas, Sobremesas).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | Int | Identificador único |
| `empresaId` | Int | FK para Empresa |
| `nome` | String | Nome da categoria |
| `descricao` | String? | Descrição da categoria |
| `ordem` | Int | Ordem de exibição (padrão: 0) |
| `ativo` | Boolean | Status da categoria |
| `createdAt` | DateTime | Data de criação |
| `updatedAt` | DateTime | Data de atualização |

**Relacionamentos:**
- `empresa`: Empresa (CASCADE on delete)
- `produtos[]`: Produtos da categoria

---

### 5. Produto

Representa cada item do cardápio.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | Int | Identificador único |
| `empresaId` | Int | FK para Empresa |
| `categoriaId` | Int | FK para Categoria |
| `nome` | String | Nome do produto |
| `descricao` | String? | Descrição detalhada |
| `preco` | Decimal(10,2) | Preço base do produto |
| `imagem` | String? | URL ou base64 da imagem |
| `disponivel` | Boolean | Produto disponível para venda |
| `destaque` | Boolean | Produto em destaque |
| `vendidoPorKg` | Boolean | Se vendido por peso |
| `ordem` | Int | Ordem de exibição |
| `createdAt` | DateTime | Data de criação |
| `updatedAt` | DateTime | Data de atualização |

**Relacionamentos:**
- `empresa`: Empresa (CASCADE on delete)
- `categoria`: Categoria (CASCADE on delete)
- `itensPedido[]`: Itens de pedido
- `gruposProduto[]`: Grupos de adicionais vinculados

---

## Sistema de Adicionais

O sistema de adicionais é estruturado em 3 níveis para máxima flexibilidade:

### Hierarquia:
```
Produto
  └─ ProdutoGrupoAdicional (vincula produto a grupos)
       └─ GrupoAdicional (ex: "Pontos da Carne")
            └─ Adicional (ex: "Mal Passada", "Ao Ponto", "Bem Passada")
```

---

### 6. GrupoAdicional

Define um grupo de opções para produtos (ex: "Pontos da Carne", "Molhos", "Bebidas Extras").

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | Int | Identificador único |
| `empresaId` | Int | FK para Empresa |
| `nome` | String | Nome do grupo |
| `descricao` | String? | Descrição do grupo |
| `minimo` | Int | Mínimo de adicionais a escolher (padrão: 0) |
| `maximo` | Int | Máximo de adicionais a escolher (padrão: 1) |
| `obrigatorio` | Boolean | Se o grupo é obrigatório |
| `tipoPrecificacao` | String | "somatorio" ou "substitui" |
| `ordem` | Int | Ordem de exibição |
| `ativo` | Boolean | Status do grupo |
| `createdAt` | DateTime | Data de criação |
| `updatedAt` | DateTime | Data de atualização |

**Tipos de Precificação:**
- `somatorio`: O preço dos adicionais é somado ao produto
- `substitui`: O adicional substitui o preço base (usado para variações)

**Relacionamentos:**
- `empresa`: Empresa (CASCADE on delete)
- `adicionais[]`: Adicionais do grupo
- `produtos[]`: Produtos vinculados via ProdutoGrupoAdicional

**Exemplos de Uso:**

1. **Pontos da Carne** (Obrigatório, escolha única):
   - minimo: 1, maximo: 1, obrigatorio: true
   - tipoPrecificacao: "substitui"

2. **Adicionais** (Opcional, múltipla escolha):
   - minimo: 0, maximo: 5, obrigatorio: false
   - tipoPrecificacao: "somatorio"

3. **Tamanho** (Obrigatório, escolha única):
   - minimo: 1, maximo: 1, obrigatorio: true
   - tipoPrecificacao: "substitui"

---

### 7. Adicional

Representa cada opção dentro de um grupo de adicionais.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | Int | Identificador único |
| `grupoAdicionalId` | Int | FK para GrupoAdicional |
| `nome` | String | Nome do adicional |
| `descricao` | String? | Descrição do adicional |
| `preco` | Decimal(10,2) | Preço adicional (padrão: 0) |
| `ordem` | Int | Ordem de exibição |
| `ativo` | Boolean | Status do adicional |
| `createdAt` | DateTime | Data de criação |
| `updatedAt` | DateTime | Data de atualização |

**Relacionamentos:**
- `grupoAdicional`: GrupoAdicional (CASCADE on delete)
- `itensAdicional[]`: Registros de adicionais escolhidos em pedidos

---

### 8. ProdutoGrupoAdicional

Tabela de relacionamento N:N entre Produto e GrupoAdicional.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | Int | Identificador único |
| `produtoId` | Int | FK para Produto |
| `grupoAdicionalId` | Int | FK para GrupoAdicional |
| `ordem` | Int | Ordem de exibição no produto |
| `createdAt` | DateTime | Data de criação |

**Relacionamentos:**
- `produto`: Produto (CASCADE on delete)
- `grupoAdicional`: GrupoAdicional (CASCADE on delete)

**Índices:**
- `[produtoId, grupoAdicionalId]`: UNIQUE (evita duplicação)

**Exemplo:**
```
Produto: "Hambúrguer Premium"
  └─ Grupo 1: "Ponto da Carne" (ordem: 1)
  └─ Grupo 2: "Adicionais" (ordem: 2)
  └─ Grupo 3: "Bebidas" (ordem: 3)
```

---

## Tabelas de Pedidos

### 9. Endereco

Endereços de entrega cadastrados pelos usuários.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | Int | Identificador único |
| `usuarioId` | Int | FK para Usuario |
| `titulo` | String | Título do endereço (ex: "Casa", "Trabalho") |
| `cep` | String(8) | CEP sem formatação |
| `logradouro` | String | Rua/Avenida |
| `numero` | String | Número do imóvel |
| `complemento` | String? | Complemento (apto, bloco, etc) |
| `bairro` | String | Bairro |
| `cidade` | String | Cidade |
| `uf` | String(2) | Unidade Federativa (sigla) |
| `referencia` | String? | Ponto de referência |
| `principal` | Boolean | Se é o endereço principal |
| `createdAt` | DateTime | Data de criação |
| `updatedAt` | DateTime | Data de atualização |

**Relacionamentos:**
- `usuario`: Usuario (CASCADE on delete)
- `pedidos[]`: Pedidos enviados para este endereço

---

### 10. Pedido

Representa cada pedido realizado no sistema.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | Int | Identificador único |
| `empresaId` | Int | FK para Empresa |
| `usuarioId` | Int | FK para Usuario (cliente) |
| `enderecoId` | Int | FK para Endereco |
| `numero` | String | Número único do pedido (ex: "#001234") |
| `status` | String | Status atual do pedido |
| `subtotal` | Decimal(10,2) | Soma dos itens |
| `taxaEntrega` | Decimal(10,2) | Taxa de entrega aplicada |
| `total` | Decimal(10,2) | Total do pedido |
| `formaPagamento` | String | Forma de pagamento |
| `observacoes` | String? | Observações do cliente |
| `motivoCancelamento` | String? | Motivo se cancelado |
| `tempoEstimado` | Int? | Tempo estimado em minutos |
| `createdAt` | DateTime | Data de criação |
| `updatedAt` | DateTime | Data de atualização |

**Status Possíveis:**
- `pendente`: Pedido recebido, aguardando confirmação
- `confirmado`: Pedido confirmado pela empresa
- `preparando`: Pedido sendo preparado
- `saiu_entrega`: Pedido saiu para entrega
- `entregue`: Pedido entregue ao cliente
- `cancelado`: Pedido cancelado

**Formas de Pagamento:**
- `dinheiro`: Pagamento em dinheiro
- `cartao`: Pagamento com cartão
- `pix`: Pagamento via PIX

**Relacionamentos:**
- `empresa`: Empresa (CASCADE on delete)
- `usuario`: Usuario (CASCADE on delete)
- `endereco`: Endereco
- `itens[]`: Itens do pedido
- `historico[]`: Histórico de mudanças de status

**Índices:**
- `numero`: UNIQUE

---

### 11. ItemPedido

Representa cada produto dentro de um pedido.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | Int | Identificador único |
| `pedidoId` | Int | FK para Pedido |
| `produtoId` | Int | FK para Produto |
| `quantidade` | Int | Quantidade do produto |
| `precoUnitario` | Decimal(10,2) | Preço unitário no momento do pedido |
| `subtotal` | Decimal(10,2) | Quantidade × Preço Unitário |
| `observacoes` | String? | Observações específicas do item |

**Relacionamentos:**
- `pedido`: Pedido (CASCADE on delete)
- `produto`: Produto
- `adicionais[]`: Adicionais escolhidos para este item

**Cálculo do Subtotal:**
```
subtotal = (precoUnitario + soma dos adicionais) × quantidade
```

---

### 12. ItemAdicional

Registra os adicionais escolhidos para cada item do pedido.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | Int | Identificador único |
| `itemPedidoId` | Int | FK para ItemPedido |
| `adicionalId` | Int | FK para Adicional |
| `quantidade` | Int | Quantidade do adicional |
| `preco` | Decimal(10,2) | Preço no momento do pedido |

**Relacionamentos:**
- `itemPedido`: ItemPedido (CASCADE on delete)
- `adicional`: Adicional

**Nota Importante:**
O preço é salvo no momento do pedido para manter histórico, caso o preço do adicional mude futuramente.

---

### 13. HistoricoPedido

Registra todas as mudanças de status de um pedido.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | Int | Identificador único |
| `pedidoId` | Int | FK para Pedido |
| `status` | String | Novo status aplicado |
| `observacao` | String? | Observação sobre a mudança |
| `createdAt` | DateTime | Data/hora da mudança |

**Relacionamentos:**
- `pedido`: Pedido (CASCADE on delete)

**Utilidade:**
- Rastreamento completo do ciclo de vida do pedido
- Auditoria de mudanças
- Cálculo de tempo médio por status

---

## Relacionamentos

### Diagrama de Relacionamentos Principais:

```
Empresa (1) ──── (N) Usuario
Empresa (1) ──── (N) Categoria ──── (N) Produto
Empresa (1) ──── (N) Produto
Empresa (1) ──── (N) GrupoAdicional ──── (N) Adicional
Empresa (1) ──── (N) Pedido

Usuario (1) ──── (N) Endereco
Usuario (1) ──── (N) Pedido
Usuario (N) ──── (1) Permissao

Produto (N) ──── (N) GrupoAdicional (via ProdutoGrupoAdicional)

Pedido (1) ──── (N) ItemPedido ──── (N) ItemAdicional
Pedido (1) ──── (N) HistoricoPedido
Pedido (N) ──── (1) Endereco

ItemPedido (N) ──── (1) Produto
ItemAdicional (N) ──── (1) Adicional
```

### Cascatas de Exclusão:

Todas as relações com Empresa utilizam `CASCADE on delete`, garantindo que ao excluir uma empresa, todos os dados relacionados sejam removidos:
- Empresa → Usuarios, Categorias, Produtos, Pedidos, GruposAdicionais

Outras cascatas importantes:
- Usuario → Enderecos
- Pedido → ItensPedido → ItensAdicional
- Pedido → HistoricoPedido
- GrupoAdicional → Adicionais
- Categoria → Produtos

---

## Convenções e Padrões

### Nomenclatura:

1. **Tabelas**: Nome no singular (Produto, Usuario, Pedido)
2. **Mapeamento**: snake_case no banco (`@map("nome_campo")`)
3. **Models Prisma**: camelCase (empresaId, createdAt)

### Tipos de Dados:

- **IDs**: `Int @id @default(autoincrement())`
- **Dinheiro**: `Decimal(10,2)` - suporta até R$ 99.999.999,99
- **Textos longos**: `@db.Text` (descrições, observações)
- **Imagens**: `@db.Text` (URLs ou base64)
- **Datas**: `DateTime` com `@default(now())` e `@updatedAt`
- **CPF/CNPJ**: `@db.VarChar(N)` sem formatação

### Soft Delete:

O sistema utiliza **soft delete** através do campo `ativo`:
- `true`: Registro ativo
- `false`: Registro "excluído"

Aplicado em: Empresa, Usuario, Categoria, Produto, GrupoAdicional, Adicional

### Timestamps:

Todas as tabelas principais incluem:
```prisma
createdAt DateTime @default(now()) @map("created_at")
updatedAt DateTime @updatedAt @map("updated_at")
```

### Índices e Constraints:

- **UNIQUE**: Campos que não podem duplicar (email, cpf, cnpj, numero do pedido)
- **Foreign Keys**: Todas as relações implementam FKs
- **Composite UNIQUE**: ProdutoGrupoAdicional (evita duplicação)

---

## Migrations

O schema está sincronizado com migrations localizadas em:
```
climb-delivery-api/prisma/migrations/
```

### Comandos Úteis:

```bash
# Criar nova migration
npx prisma migrate dev --name nome_da_migration

# Aplicar migrations
npx prisma migrate deploy

# Resetar banco (CUIDADO!)
npx prisma migrate reset

# Gerar Prisma Client
npx prisma generate

# Visualizar banco no Prisma Studio
npx prisma studio
```

---

## Exemplos de Queries

### Buscar produtos com adicionais:

```typescript
const produto = await prisma.produto.findUnique({
  where: { id: 1 },
  include: {
    categoria: true,
    gruposProduto: {
      include: {
        grupoAdicional: {
          include: {
            adicionais: true
          }
        }
      }
    }
  }
});
```

### Buscar pedido completo:

```typescript
const pedido = await prisma.pedido.findUnique({
  where: { id: 1 },
  include: {
    usuario: true,
    endereco: true,
    empresa: true,
    itens: {
      include: {
        produto: true,
        adicionais: {
          include: {
            adicional: {
              include: {
                grupoAdicional: true
              }
            }
          }
        }
      }
    },
    historico: {
      orderBy: { createdAt: 'asc' }
    }
  }
});
```

### Criar pedido com adicionais:

```typescript
const pedido = await prisma.pedido.create({
  data: {
    empresaId: 1,
    usuarioId: 1,
    enderecoId: 1,
    numero: "#001234",
    status: "pendente",
    subtotal: 45.00,
    taxaEntrega: 5.00,
    total: 50.00,
    formaPagamento: "cartao",
    itens: {
      create: [
        {
          produtoId: 1,
          quantidade: 2,
          precoUnitario: 20.00,
          subtotal: 45.00,
          adicionais: {
            create: [
              {
                adicionalId: 1, // Bacon
                quantidade: 1,
                preco: 5.00
              }
            ]
          }
        }
      ]
    },
    historico: {
      create: {
        status: "pendente",
        observacao: "Pedido criado"
      }
    }
  }
});
```

---

## Notas Finais

Este schema foi projetado para ser:
- ✅ **Escalável**: Suporta múltiplas empresas
- ✅ **Flexível**: Sistema de adicionais configurável
- ✅ **Auditável**: Histórico completo de pedidos
- ✅ **Consistente**: Relacionamentos bem definidos
- ✅ **Performático**: Índices adequados
- ✅ **Seguro**: Validações e constraints

Para dúvidas ou sugestões de melhorias, consulte a equipe de desenvolvimento.
