# Plano de Padronização - Criação e Visualização de Pedidos

## 📋 Análise do Problema

### Fluxos Identificados:
1. **PDV (/dashboard/pdv)** - Criação rápida de pedido
2. **Modal Novo Pedido (/dashboard/orders)** - Criação via modal
3. **Link Público (/p/:slug/checkout)** - Cliente final cria pedido

---

## 🔴 Problemas Identificados

### 1. Estrutura de Dados Inconsistente

#### **Pedidos do Link Público (Sprint 8)**
- ✅ Usa tabela `Cliente` (multi-tenant)
- ✅ Campos: `clienteId`, `tipoPedido`, `trocoPara`
- ✅ Endereço armazenado no `Cliente` (não na tabela `Endereco`)
- ❌ **PROBLEMA**: Modal de detalhes NÃO exibe dados do cliente
- ❌ **PROBLEMA**: Itens do pedido não aparecem

#### **Pedidos do Dashboard (PDV/Modal)**
- ❌ Usa `usuarioId` (atendente) no lugar do cliente
- ❌ Dados do cliente vão para campo `observacoes`: "Cliente: Nome | Telefone: 11999..."
- ❌ Cria endereços "fake" com valores "N/A" na tabela `Endereco`
- ❌ Não usa tabela `Cliente`
- ❌ **PROBLEMA**: Exibe dados do USUÁRIO (atendente) em vez do CLIENTE
- ❌ **PROBLEMA**: Itens não aparecem no modal

### 2. Backend - PedidoService

#### **Método `findOne` - Linha 245**
```typescript
// ❌ PROBLEMA: NÃO inclui relação 'cliente'
findOne(id: number) {
  return this.prisma.pedido.findUnique({
    where: { id },
    include: {
      empresa: true,
      usuario: true,
      endereco: true,
      // ❌ FALTANDO: cliente: true
      itens: { ... },
      historico: { ... }
    }
  });
}
```

#### **Método `findByEmpresa` - Linha 184**
```typescript
// ❌ PROBLEMA: NÃO inclui relação 'cliente'
// ❌ PROBLEMA: NÃO inclui relação 'itens' completa
findByEmpresa(empresaId: number, status?: string) {
  return this.prisma.pedido.findMany({
    include: {
      usuario: { ... },
      endereco: true,
      status: true,
      // ❌ FALTANDO: cliente: true
      // ❌ FALTANDO: itens: { include: { produto, adicionais } }
      _count: { select: { itens: true } }
    }
  });
}
```

#### **Método `createManual` - Linha 68**
```typescript
// ❌ PROBLEMA: Cria endereços fake com "N/A"
// ❌ PROBLEMA: Coloca dados do cliente em 'observacoes'
// ❌ PROBLEMA: Usa 'usuarioId' (atendente) em vez de criar Cliente
async createManual(createPedidoManualDto: CreatePedidoManualDto) {
  // Cria endereço temporário FAKE
  const endereco = await this.prisma.endereco.create({
    data: {
      usuarioId: pedidoData.usuarioId,
      titulo: 'Endereço de Entrega',
      logradouro: enderecoEntrega, // String completa
      numero: 'S/N',
      bairro: 'N/A',
      cidade: 'N/A',
      uf: 'NA',
      cep: '00000000',
      principal: false,
    },
  });
  // observacoes contém: "Cliente: Nome | Telefone: 11999..."
}
```

### 3. Frontend - Modal de Detalhes

#### **modal-detalhes-pedido.component.html - Linha 36**
```html
<!-- ❌ PROBLEMA: Sempre busca usuario (atendente) -->
<p>{{ pedido.usuario?.nome || 'Cliente' }}</p>
<p>{{ pedido.usuario?.telefone }}</p>

<!-- ✅ DEVERIA SER: -->
<p>{{ pedido.cliente?.nome || pedido.usuario?.nome || 'Cliente' }}</p>
<p>{{ pedido.cliente?.telefone || pedido.usuario?.telefone }}</p>
```

#### **OrdersComponent - Linha 130**
```typescript
// ❌ PROBLEMA: Busca dados do usuário (atendente)
getCustomerName(order: Order): string {
  return order.usuario?.nome || 'Cliente';
}

getCustomerPhone(order: Order): string {
  return order.usuario?.telefone || '';
}
```

### 4. DTOs Inconsistentes

#### **CreatePedidoManualDto**
```typescript
// ❌ Campo obsoleto, deveria usar Cliente
@IsString()
enderecoEntrega: string; // Endereço como string

// ❌ Dados do cliente em observações
@IsString()
observacoes?: string; // "Cliente: Nome | Telefone: 999"
```

---

## ✅ Plano de Ação - Padronização

### FASE 1: Backend - Estrutura de Dados

#### **1.1. Atualizar DTOs (create-pedido-manual.dto.ts)**
```typescript
// ADICIONAR classe ClienteDto
class ClienteDto {
  @IsString()
  telefone: string; // Obrigatório
  
  @IsOptional()
  @IsString()
  nome?: string;
  
  @IsOptional()
  @IsString()
  email?: string;
  
  @IsOptional()
  @IsString()
  cpf?: string;
}

// ADICIONAR EnderecoDto (se tipoPedido === 'entrega')
class EnderecoDto {
  @IsString()
  cep: string;
  
  @IsString()
  logradouro: string;
  
  @IsString()
  numero: string;
  
  // ... outros campos
}

export class CreatePedidoManualDto {
  @IsInt()
  empresaId: number;
  
  @IsInt()
  usuarioId: number; // Atendente que registrou
  
  // ✅ NOVO: Dados do cliente
  @ValidateNested()
  @Type(() => ClienteDto)
  cliente: ClienteDto;
  
  @IsString()
  tipoPedido: string; // 'entrega' ou 'retirada'
  
  // ✅ NOVO: Endereço condicional
  @IsOptional()
  @ValidateNested()
  @Type(() => EnderecoDto)
  endereco?: EnderecoDto;
  
  // ... restante dos campos
  
  // ❌ REMOVER: enderecoEntrega (string)
  // ❌ REMOVER: observacoes contendo dados do cliente
}
```

#### **1.2. Refatorar PedidoService.createManual()**
```typescript
async createManual(createPedidoManualDto: CreatePedidoManualDto) {
  const { itens, cliente, endereco, status, ...pedidoData } = createPedidoManualDto;
  
  // ✅ USAR ClienteService.findOrCreate() (igual ao link público)
  const clienteCriado = await this.clienteService.findOrCreate(
    pedidoData.empresaId,
    cliente
  );
  
  // ✅ Atualizar endereço do cliente se fornecido e tipo for 'entrega'
  if (pedidoData.tipoPedido === 'entrega' && endereco) {
    await this.prisma.cliente.update({
      where: { id: clienteCriado.id },
      data: {
        cep: endereco.cep,
        logradouro: endereco.logradouro,
        numero: endereco.numero,
        complemento: endereco.complemento,
        bairro: endereco.bairro,
        cidade: endereco.cidade,
        uf: endereco.uf,
        referencia: endereco.referencia,
      }
    });
  }
  
  const statusPedido = await this.prisma.statusPedido.findFirst({
    where: { codigo: status || 'pendente' }
  });
  
  // ✅ Criar pedido com clienteId (não enderecoId)
  return this.prisma.pedido.create({
    data: {
      ...pedidoData,
      clienteId: clienteCriado.id, // ✅ Usar cliente
      usuarioId: pedidoData.usuarioId, // Atendente que registrou
      enderecoId: null, // ✅ Não usar tabela Endereco
      statusId: statusPedido.id,
      itens: { ... }
    },
    include: {
      cliente: true, // ✅ Incluir cliente
      usuario: true, // Atendente
      itens: { ... }
    }
  });
}
```

#### **1.3. Atualizar PedidoService.findOne()**
```typescript
findOne(id: number) {
  return this.prisma.pedido.findUnique({
    where: { id },
    include: {
      empresa: true,
      usuario: true, // Atendente que criou (pode ser null)
      cliente: true, // ✅ ADICIONAR
      endereco: true, // Mantém para pedidos legados
      status: true,
      itens: {
        include: {
          produto: true,
          adicionais: {
            include: {
              adicional: {
                include: {
                  grupoAdicional: true,
                },
              },
            },
          },
        },
      },
      historico: {
        include: {
          status: true
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });
}
```

#### **1.4. Atualizar PedidoService.findByEmpresa()**
```typescript
findByEmpresa(empresaId: number, status?: string) {
  return this.prisma.pedido.findMany({
    where: { ... },
    include: {
      usuario: true, // Atendente
      cliente: true, // ✅ ADICIONAR
      endereco: true, // Legado
      status: true,
      itens: { // ✅ ADICIONAR include completo
        include: {
          produto: true,
          adicionais: {
            include: {
              adicional: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}
```

#### **1.5. Injetar ClienteService no PedidoModule**
```typescript
// pedido.module.ts
@Module({
  imports: [PrismaModule, ClienteModule], // ✅ ADICIONAR
  controllers: [PedidoController],
  providers: [PedidoService],
  exports: [PedidoService],
})
export class PedidoModule {}
```

---

### FASE 2: Frontend - Models e Services

#### **2.1. Atualizar Order Model**
```typescript
// order.model.ts
export interface Order {
  id: number;
  numero: string;
  empresaId: number;
  usuarioId?: number; // Atendente (opcional)
  clienteId?: number; // Cliente (novo)
  tipoPedido: string; // 'entrega' | 'retirada'
  
  // Relacionamentos
  usuario?: Usuario; // Atendente
  cliente?: Cliente; // ✅ ADICIONAR
  endereco?: Endereco;
  itens?: ItemPedido[];
  
  // ... outros campos
}

// ✅ ADICIONAR interface Cliente
export interface Cliente {
  id: number;
  nome?: string;
  telefone: string;
  email?: string;
  cpf?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  referencia?: string;
}
```

#### **2.2. Atualizar OrderService**
```typescript
// order.service.ts

// ✅ ADICIONAR método helper
getCustomerName(order: Order): string {
  // Prioridade: cliente > usuario > 'Cliente'
  return order.cliente?.nome || order.usuario?.nome || 'Cliente';
}

getCustomerPhone(order: Order): string {
  return order.cliente?.telefone || order.usuario?.telefone || '';
}

getCustomerEmail(order: Order): string {
  return order.cliente?.email || order.usuario?.email || '';
}

getDeliveryAddress(order: Order): string {
  // Se tem cliente com endereço
  if (order.cliente?.logradouro) {
    return `${order.cliente.logradouro}, ${order.cliente.numero}${order.cliente.complemento ? ' - ' + order.cliente.complemento : ''} - ${order.cliente.bairro}, ${order.cliente.cidade}/${order.cliente.uf}`;
  }
  
  // Se tem endereco legado
  if (order.endereco) {
    return `${order.endereco.logradouro}, ${order.endereco.numero}...`;
  }
  
  return '';
}
```

---

### FASE 3: Frontend - Modal de Detalhes

#### **3.1. Atualizar modal-detalhes-pedido.component.ts**
```typescript
getCustomerName(): string {
  if (!this.pedido) return 'Cliente';
  return this.orderService.getCustomerName(this.pedido);
}

getCustomerPhone(): string {
  if (!this.pedido) return '';
  return this.orderService.getCustomerPhone(this.pedido);
}

getCustomerEmail(): string {
  if (!this.pedido) return '';
  return this.orderService.getCustomerEmail(this.pedido);
}

getDeliveryAddress(): string {
  if (!this.pedido) return '';
  return this.orderService.getDeliveryAddress(this.pedido);
}

getTipoPedido(): string {
  if (!this.pedido) return '';
  return this.pedido.tipoPedido === 'entrega' ? 'Entrega' : 'Retirada no Local';
}
```

#### **3.2. Atualizar modal-detalhes-pedido.component.html**
```html
<!-- Informações do Cliente -->
<div class="surface-section p-3 border-round mb-3">
  <h4 class="mt-0 mb-3 flex align-items-center gap-2">
    <i class="pi pi-user text-primary"></i>
    Cliente
  </h4>
  <div class="grid">
    <div class="col-12 md:col-6">
      <p class="text-600 text-sm m-0 mb-1">Nome</p>
      <p class="text-900 font-semibold m-0">{{ getCustomerName() }}</p>
    </div>
    <div class="col-12 md:col-6">
      <p class="text-600 text-sm m-0 mb-1">Telefone</p>
      <p class="text-900 font-semibold m-0">
        <i class="pi pi-phone mr-1"></i>
        {{ getCustomerPhone() }}
      </p>
    </div>
    <div class="col-12" *ngIf="getCustomerEmail()">
      <p class="text-600 text-sm m-0 mb-1">E-mail</p>
      <p class="text-900 m-0">{{ getCustomerEmail() }}</p>
    </div>
  </div>
</div>

<!-- Tipo de Pedido e Endereço -->
<div class="surface-section p-3 border-round mb-3">
  <h4 class="mt-0 mb-3 flex align-items-center gap-2">
    <i [class]="pedido?.tipoPedido === 'entrega' ? 'pi pi-map-marker' : 'pi pi-shopping-bag'" class="text-primary"></i>
    {{ getTipoPedido() }}
  </h4>
  
  <div *ngIf="pedido?.tipoPedido === 'entrega' && getDeliveryAddress()">
    <p class="text-900 m-0 mb-2">{{ getDeliveryAddress() }}</p>
    <p class="text-600 text-sm m-0" *ngIf="pedido.cliente?.cep">
      CEP: {{ pedido.cliente!.cep }}
    </p>
    <p class="text-600 text-sm m-0" *ngIf="pedido.cliente?.referencia">
      <i class="pi pi-info-circle mr-1"></i>
      Referência: {{ pedido.cliente!.referencia }}
    </p>
  </div>
  
  <div *ngIf="pedido?.tipoPedido === 'retirada'">
    <p class="text-900 font-semibold m-0">
      <i class="pi pi-shopping-bag mr-2"></i>
      Cliente retirará o pedido no local
    </p>
  </div>
</div>
```

---

### FASE 4: Frontend - Modal Novo Pedido

#### **4.1. Atualizar modal-novo-pedido DTO**
```typescript
// Atualizar interface de criação
interface NovoPedidoData {
  empresaId: number;
  usuarioId: number; // Atendente
  
  // ✅ Dados do cliente
  cliente: {
    telefone: string;
    nome?: string;
    email?: string;
    cpf?: string;
  };
  
  tipoPedido: 'entrega' | 'retirada';
  
  // ✅ Endereço condicional
  endereco?: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
    referencia?: string;
  };
  
  itens: ItemPedido[];
  subtotal: number;
  taxaEntrega: number;
  total: number;
  formaPagamento: string;
  trocoPara?: number;
  observacoes?: string;
}
```

---

## 📅 Ordem de Implementação

### **Prioridade ALTA - Crítico**
1. ✅ Backend: Adicionar `cliente: true` nos includes (findOne, findByEmpresa)
2. ✅ Frontend: Atualizar modal de detalhes para exibir cliente
3. ✅ Backend: Injetar ClienteModule no PedidoModule

### **Prioridade MÉDIA - Importante**
4. ✅ Backend: Criar novo DTO para CreatePedidoManualDto
5. ✅ Backend: Refatorar método createManual() para usar ClienteService
6. ✅ Frontend: Atualizar modelo Order com interface Cliente
7. ✅ Frontend: Atualizar OrderService com helpers

### **Prioridade BAIXA - Refatoração**
8. ✅ Frontend: Atualizar modal-novo-pedido com novo DTO
9. ✅ Testes: Validar todos os 3 fluxos
10. ✅ Documentação: Atualizar README

---

## 🎯 Resultado Esperado

### Após Padronização:
1. ✅ **Todos os pedidos** usam tabela `Cliente` (multi-tenant)
2. ✅ **Modal de detalhes** exibe dados corretos (cliente ou usuário)
3. ✅ **Itens do pedido** aparecem em todos os casos
4. ✅ **Endereços** armazenados no Cliente (não tabela Endereco)
5. ✅ **Campo observacoes** usado apenas para observações reais
6. ✅ **Compatibilidade** com pedidos antigos mantida
7. ✅ **Consistência** entre PDV, Modal e Link Público

---

## 🔄 Migração de Dados Legados

### Script de Migração (Opcional)
```sql
-- Migrar pedidos antigos que usam observacoes para armazenar dados do cliente
-- Executar SOMENTE após implementar todas as mudanças

-- 1. Criar clientes a partir de observações
-- 2. Atualizar clienteId nos pedidos
-- 3. Limpar observações dos dados do cliente
```

---

## ✅ Checklist de Validação

Após implementar TODAS as mudanças, testar:

- [ ] Criar pedido via Link Público → Modal exibe cliente correto
- [ ] Criar pedido via PDV → Modal exibe cliente correto  
- [ ] Criar pedido via Modal Novo Pedido → Modal exibe cliente correto
- [ ] Itens aparecem em todos os casos
- [ ] Endereço exibe corretamente (entrega vs retirada)
- [ ] Observações aparecem apenas quando preenchidas
- [ ] Telefone do cliente (não do atendente) aparece
- [ ] Nome do cliente (não do atendente) aparece
- [ ] Listagem de pedidos exibe dados corretos
- [ ] Compatibilidade com pedidos antigos mantida
