# 🚀 ClimbDelivery — Especificação Técnica  
## Módulo: **Meus Pedidos (Orders)**  
### Tópico: **Modal de Detalhes, Finalização e Notificações**

---

## 🧩 Contexto

Precisamos aprimorar a tela **Meus Pedidos** com as seguintes funcionalidades:

1. **Modal de detalhes do pedido** — exibido ao clicar em qualquer card de pedido.  
2. **Finalizar pedido** — ação disponível apenas nos pedidos "Pronto para Entrega".  
3. **Notificação sonora de novos pedidos** — reproduz um som de campainha ao detectar novos pedidos.

Essas implementações devem **manter o mesmo padrão de design, arquitetura e componentização Angular + PrimeNG + PrimeFlex** já existente no sistema.

---

## 📁 Estrutura do Projeto

Localização dos arquivos:
src/app/features/dashboard/orders/


### Novos Componentes e Serviços

| Nome | Caminho | Tipo | Função |
|------|----------|------|--------|
| `order-details-dialog.component` | `orders/components/order-details-dialog/` | Standalone Component | Modal com informações completas do pedido |
| `notification-sound.service.ts` | `core/services/` | Service | Gerencia sons de notificação de novos pedidos |
| (Extensão) `order-card.component` | `orders/components/order-card/` | Standalone Component | Detecta clique e emite evento de abertura de modal |
| (Extensão) `orders.component` | `orders/` | Standalone Component | Controla o carregamento de pedidos e som de notificação |
| (Extensão) `order.service.ts` | `core/services/` | Service | Inclui lógica para finalizar pedido |

---

## 🎨 Design e Layout

### 🪟 Modal de Detalhes do Pedido

**Abertura:**  
- Ao clicar em qualquer card de pedido (`order-card`).

**Layout do Modal:**



+───────────────────────────────+
| 🧾 Detalhes do Pedido #001 |
|───────────────────────────────|
| Cliente: João Silva |
| Telefone: (11) 98765-4321 |
| Tipo: 🚗 Delivery |
| Endereço: Rua das Flores, 123 |
| Criado há: 12 min |
| |
| 🧆 Itens do Pedido |
| 1x Pizza Margherita - R$45,00 |
| 1x Coca-Cola 2L - R$10,00 |
| Observações: Sem cebola |
| |
| 💰 Total: R$55,00 |
| |
| 🕒 Tempo estimado: 45 min |
|───────────────────────────────|
| [Cancelar Pedido] [Imprimir] |
| |
| Se status = “Pronto para Entrega”: |
| → [Finalizar Pedido ✅] |
+───────────────────────────────+


**Diretrizes de UI:**
- Usar `p-dialog` com `header` customizado.  
- Tamanho máximo: `700px`.  
- Espaçamento interno: `p-4`.  
- Responsividade total (`PrimeFlex`).  
- Cores e tipografia: **tema Lara Light Blue**.  
- Ícones: `pi pi-times`, `pi pi-print`, `pi pi-check-circle`.  

---

## ⚙️ Funcionalidades

### 1️⃣ Modal de Detalhes

**Fluxo de Ação:**
1. Clique em `order-card` → emite `@Output(onSelect(order))`.  
2. `orders.component` abre `order-details-dialog` com os dados do pedido.  
3. Modal exibe todas as informações e ações possíveis.  
4. Botões de ação:
   - **Cancelar Pedido** → abre `p-confirmDialog` (sem backend ainda).  
   - **Imprimir Pedido** → placeholder para futura integração.  
   - **Finalizar Pedido** → muda status para “Finalizado” e fecha modal.  

**Exemplo de lógica:**
```typescript
onFinalizeOrder(order: Order) {
  this.orderService.updateOrderStatus(order.id, OrderStatus.DELIVERED).subscribe(() => {
    this.messageService.add({
      severity: 'success',
      summary: 'Pedido Finalizado',
      detail: `${order.orderNumber} foi concluído.`
    });
    this.dialogVisible = false;
    this.loadOrders();
  });
}

2️⃣ Notificação Sonora de Novos Pedidos

Objetivo:
Emitir som de campainha sempre que novos pedidos forem detectados.

Comportamento Esperado:

Tocar o som apenas quando o número total de pedidos aumentar.

Não tocar no carregamento inicial.

Um toque por novo pedido detectado.

Implementação:

Service: notification-sound.service.ts

import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationSoundService {
  private audio = new Audio('assets/sounds/new-order.mp3');
  play() { this.audio.play().catch(() => {}); }
}


Integração no orders.component:

if (this.previousOrderCount && orders.length > this.previousOrderCount) {
  this.soundService.play();
}
this.previousOrderCount = orders.length;


Adicionar arquivo de som:
src/assets/sounds/new-order.mp3

3️⃣ Finalizar Pedido

Fluxo Atual:

Em Análise → Em Produção → Pronto para Entrega


Novo Fluxo:

Pronto para Entrega → ✅ Finalizado (DELIVERED)


Comportamento:

Botão “Finalizar Pedido” aparece apenas quando status = READY.

Ao clicar:

Confirmação via p-confirmDialog.

Atualiza o status do pedido para DELIVERED.

Exibe toast de sucesso.

Remove o card da coluna “Pronto para Entrega”.

Enum atualizado:

export enum OrderStatus {
  PENDING = 'pending',
  IN_PRODUCTION = 'in_production',
  READY = 'ready',
  DELIVERED = 'delivered',  // Novo status
  CANCELLED = 'cancelled'
}

🔔 Feedbacks Visuais e Auditivos
Ação	Feedback	Tipo
Novo pedido recebido	Som de campainha + Toast "Novo pedido recebido"	Auditivo + visual
Pedido finalizado	Toast "Pedido #xxx finalizado com sucesso"	Visual
Pedido cancelado	Toast "Pedido #xxx cancelado"	Visual
Impressão (placeholder)	Toast "Função de impressão em breve"	Visual
🧠 Requisitos Técnicos

Manter design, cores e tipografia padrão.

Componentes standalone com ChangeDetectionStrategy.OnPush.

Utilizar:

p-dialog

p-confirmDialog

p-toast

p-button

p-divider

p-badge

Responsividade total (mobile, tablet, desktop).

Modal deve fechar ao clicar fora ou pressionar ESC.

Testar para evitar múltiplos toques de som simultâneos.

🧭 Etapas de Implementação

Criar order-details-dialog.component

Integrar abertura via order-card

Implementar botões (Cancelar, Imprimir, Finalizar)

Criar NotificationSoundService

Integrar som de novo pedido em orders.component

Adicionar suporte a DELIVERED no OrderService

Configurar toasts e mensagens

Testar responsividade e compatibilidade visual

🎯 Entregável Esperado

Modal funcional e integrado ao design atual.

Ações básicas (cancelar, imprimir, finalizar) funcionando com mock.

Som de notificação tocando corretamente.

Código limpo, tipado e compatível com Angular 18 + PrimeNG + PrimeFlex.

Nenhum impacto negativo nas demais telas do dashboard.

⚠️ Dúvidas críticas sobre comportamento de status, layout ou integrações futuras devem ser levantadas antes da implementação para alinhamento com o fluxo do sistema.