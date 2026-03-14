# 🖨️ Guia de Implementação - Impressão de Pedidos

**ClimbDelivery MVP v1.0**

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Comparativo de Soluções](#comparativo-de-soluções)
3. [SOLUÇÃO 1: Impressão via Navegador (RECOMENDADA PARA MVP)](#solução-1-impressão-via-navegador)
4. [SOLUÇÃO 2: Agente Local com Impressora Térmica](#solução-2-agente-local-com-impressora-térmica)
5. [Implementação Passo a Passo](#implementação-passo-a-passo)
6. [Layout do Comprovante](#layout-do-comprovante)
7. [Testes e Validação](#testes-e-validação)

---

## 🎯 Visão Geral

### Objetivo
Permitir que o restaurante imprima pedidos recebidos através de impressoras conectadas ao computador onde está acessando o sistema.

### Requisitos do MVP
- ✅ **Impressão Manual:** Botão de imprimir no modal de detalhes do pedido
- ✅ **Impressão Automática (opcional):** Configuração para imprimir automaticamente novos pedidos
- ✅ **Compatibilidade:** Funcionar com impressoras comuns (A4, térmicas via driver)
- ✅ **Simplicidade:** Mínima configuração necessária
- ✅ **Baixo custo:** Sem infraestrutura adicional obrigatória

---

## 🔍 Comparativo de Soluções

### SOLUÇÃO 1: Impressão via Navegador (`window.print()`)

**Como funciona:**
- Usa API nativa do navegador para impressão
- Funciona com qualquer impressora instalada no sistema
- Não requer instalação adicional

**✅ Vantagens:**
- ✅ **Zero configuração adicional** - usa impressora padrão do Windows
- ✅ **Funciona em qualquer navegador moderno**
- ✅ **Suporta qualquer tipo de impressora** (A4, térmica, etc)
- ✅ **Implementação rápida** - 1-2 dias
- ✅ **Sem custo adicional de infraestrutura**
- ✅ **Fácil manutenção**

**❌ Desvantagens:**
- ❌ Requer interação do usuário (clique em "Imprimir" no diálogo)
- ❌ Layout limitado ao CSS do navegador
- ❌ Não imprime automaticamente em segundo plano (sem interação)

**🎯 Ideal para:**
- MVP inicial
- Pequenos restaurantes
- Operação simples
- Baixo volume de pedidos

---

### SOLUÇÃO 2: Agente Local com Impressora Térmica

**Como funciona:**
- Aplicação Node.js rodando no computador do restaurante
- Conecta com backend via WebSocket
- Envia comandos ESC/POS direto para impressora térmica

**✅ Vantagens:**
- ✅ **Impressão automática** - sem interação do usuário
- ✅ **Controle total do layout** - comandos ESC/POS
- ✅ **Múltiplas impressoras** - pode imprimir em cozinha, balcão, etc
- ✅ **Corte automático** do papel
- ✅ **Profissional** - igual aos sistemas tradicionais

**❌ Desvantagens:**
- ❌ **Requer instalação** de aplicação no PC do restaurante
- ❌ **Manutenção adicional** - versões, atualizações, bugs
- ❌ **Complexidade técnica** maior
- ❌ **Suporte específico** por modelo de impressora
- ❌ **Implementação mais longa** - 5-7 dias

**🎯 Ideal para:**
- Fase 2 do produto
- Restaurantes médios/grandes
- Alto volume de pedidos
- Operação profissional

---

## ✨ SOLUÇÃO 1: Impressão via Navegador

### 🏗️ Arquitetura

```
┌─────────────────────────────────┐
│   Frontend (Angular)            │
│                                 │
│  ┌──────────────────────────┐  │
│  │ Modal Detalhes Pedido    │  │
│  │                          │  │
│  │ [Imprimir Pedido] ←──────┼──┼──── Usuário clica
│  └────────┬─────────────────┘  │
│           │                     │
│           ▼                     │
│  ┌──────────────────────────┐  │
│  │ Print Service            │  │
│  │ - Abre janela print      │  │
│  │ - Formata HTML           │  │
│  └────────┬─────────────────┘  │
│           │                     │
│           ▼                     │
│  ┌──────────────────────────┐  │
│  │ Component Impressão      │  │
│  │ (oculto, apenas p/print) │  │
│  └────────┬─────────────────┘  │
└───────────┼─────────────────────┘
            │
            ▼
    window.print() ───► Impressora
```

### 📦 Componentes Necessários

1. **Componente de Impressão** (`print-pedido.component.ts`)
2. **Serviço de Impressão** (`print.service.ts`)
3. **CSS de Impressão** (`print-pedido.component.scss`)
4. **Atualizar Modal de Detalhes** (adicionar botão)

---

## 🛠️ Implementação Passo a Passo

### FASE 1: Criar Componente de Impressão

#### 1.1. Criar Componente

```bash
cd src/app/features/dashboard/orders
ng generate component print-pedido --standalone
```

#### 1.2. Template do Componente (`print-pedido.component.html`)

```html
<div class="print-container" *ngIf="pedido">
  <!-- Cabeçalho -->
  <div class="print-header">
    <h1 class="restaurant-name">{{ nomeRestaurante }}</h1>
    <div class="order-info">
      <h2>Pedido Nº {{ pedido.numero }}</h2>
      <p class="date">{{ pedido.createdAt | date:'dd/MM/yyyy - HH:mm' }}</p>
    </div>
  </div>

  <div class="divider"></div>

  <!-- Dados do Cliente -->
  <div class="print-section">
    <h3>CLIENTE</h3>
    <p class="customer-name">{{ pedido.cliente?.nome || 'Cliente' }}</p>
    <p>Tel: {{ pedido.cliente?.telefone | mask: '(00) 00000-0000' }}</p>
    <p class="order-type">
      <i [class]="pedido.tipoPedido === 'entrega' ? 'pi pi-car' : 'pi pi-shopping-bag'"></i>
      {{ pedido.tipoPedido === 'entrega' ? '🚚 ENTREGA' : '📦 RETIRADA' }}
    </p>
  </div>

  <!-- Endereço (se entrega) -->
  <div class="print-section" *ngIf="pedido.tipoPedido === 'entrega' && pedido.cliente">
    <h3>ENDEREÇO DE ENTREGA</h3>
    <p>{{ pedido.cliente.logradouro }}, {{ pedido.cliente.numero }}</p>
    <p *ngIf="pedido.cliente.complemento">{{ pedido.cliente.complemento }}</p>
    <p>{{ pedido.cliente.bairro }} - {{ pedido.cliente.cidade }}/{{ pedido.cliente.uf }}</p>
    <p *ngIf="pedido.cliente.cep">CEP: {{ pedido.cliente.cep | mask: '00000-000' }}</p>
    <p *ngIf="pedido.cliente.referencia" class="reference">
      <strong>Ref:</strong> {{ pedido.cliente.referencia }}
    </p>
  </div>

  <div class="divider"></div>

  <!-- Itens do Pedido -->
  <div class="print-section">
    <h3>ITENS DO PEDIDO</h3>
    <div class="items-list">
      <div class="item" *ngFor="let item of pedido.itens">
        <div class="item-header">
          <span class="quantity">{{ item.quantidade }}x</span>
          <span class="product-name">{{ item.produto?.nome }}</span>
          <span class="price">{{ item.subtotal | currency:'BRL' }}</span>
        </div>
        
        <!-- Adicionais -->
        <div class="adicionais" *ngIf="item.adicionais && item.adicionais.length > 0">
          <div class="adicional" *ngFor="let adicional of item.adicionais">
            <span class="adicional-name">
              + {{ adicional.adicional?.nome }} ({{ adicional.quantidade }}x)
            </span>
            <span class="adicional-price">{{ adicional.preco | currency:'BRL' }}</span>
          </div>
        </div>

        <!-- Observações -->
        <p class="observation" *ngIf="item.observacoes">
          <strong>Obs:</strong> {{ item.observacoes }}
        </p>
      </div>
    </div>
  </div>

  <div class="divider"></div>

  <!-- Totais -->
  <div class="print-section totals">
    <div class="total-line">
      <span>Subtotal</span>
      <span>{{ pedido.subtotal | currency:'BRL' }}</span>
    </div>
    <div class="total-line" *ngIf="pedido.taxaEntrega > 0">
      <span>Taxa de Entrega</span>
      <span>{{ pedido.taxaEntrega | currency:'BRL' }}</span>
    </div>
    <div class="total-line total-final">
      <span><strong>TOTAL</strong></span>
      <span><strong>{{ pedido.total | currency:'BRL' }}</strong></span>
    </div>
  </div>

  <div class="divider"></div>

  <!-- Pagamento -->
  <div class="print-section">
    <h3>PAGAMENTO</h3>
    <p><strong>{{ getFormaPagamentoLabel(pedido.formaPagamento) }}</strong></p>
    <p *ngIf="pedido.trocoPara">Troco para: {{ pedido.trocoPara | currency:'BRL' }}</p>
    <p *ngIf="pedido.trocoPara" class="troco-calculado">
      Troco: {{ (pedido.trocoPara - pedido.total) | currency:'BRL' }}
    </p>
  </div>

  <!-- Observações -->
  <div class="print-section" *ngIf="pedido.observacoes">
    <h3>OBSERVAÇÕES</h3>
    <p class="observations">{{ pedido.observacoes }}</p>
  </div>

  <div class="divider"></div>

  <!-- Rodapé -->
  <div class="print-footer">
    <p>Status: {{ getStatusLabel(pedido.status.nome) }}</p>
    <p class="timestamp">Impresso em: {{ dataImpressao | date:'dd/MM/yyyy - HH:mm:ss' }}</p>
    <p class="powered-by">climbdelivery.app</p>
  </div>
</div>
```

#### 1.3. Componente TypeScript (`print-pedido.component.ts`)

```typescript
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order } from '../../../../core/models/order.model';

@Component({
  selector: 'app-print-pedido',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './print-pedido.component.html',
  styleUrls: ['./print-pedido.component.scss']
})
export class PrintPedidoComponent implements OnInit {
  @Input() pedido!: Order;
  @Input() nomeRestaurante: string = '';
  
  dataImpressao: Date = new Date();

  ngOnInit(): void {
    this.dataImpressao = new Date();
  }

  getFormaPagamentoLabel(forma: string): string {
    const formas: { [key: string]: string } = {
      'dinheiro': '💵 Dinheiro',
      'cartao': '💳 Cartão',
      'pix': '📱 PIX',
      'cartao_debito': '💳 Cartão de Débito',
      'cartao_credito': '💳 Cartão de Crédito'
    };
    return formas[forma] || forma.toUpperCase();
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pendente': 'EM ANÁLISE',
      'confirmado': 'CONFIRMADO',
      'em_preparo': 'EM PREPARO',
      'pronto': 'PRONTO',
      'em_entrega': 'EM ENTREGA',
      'entregue': 'ENTREGUE',
      'cancelado': 'CANCELADO'
    };
    return statusMap[status] || status.toUpperCase();
  }
}
```

#### 1.4. Estilos de Impressão (`print-pedido.component.scss`)

```scss
// Estilos visíveis na tela (esconder componente)
.print-container {
  display: none;
}

// Estilos aplicados somente na impressão
@media print {
  .print-container {
    display: block !important;
    width: 100%;
    max-width: 80mm; // Largura para impressora térmica
    font-family: 'Courier New', monospace;
    font-size: 12px;
    color: #000;
    background: white;
    padding: 10px;
  }

  // Cabeçalho
  .print-header {
    text-align: center;
    margin-bottom: 10px;

    .restaurant-name {
      font-size: 18px;
      font-weight: bold;
      margin: 0 0 5px 0;
      text-transform: uppercase;
    }

    .order-info {
      h2 {
        font-size: 16px;
        margin: 5px 0;
      }

      .date {
        font-size: 10px;
        margin: 0;
      }
    }
  }

  // Divisores
  .divider {
    border-top: 1px dashed #000;
    margin: 10px 0;
  }

  // Seções
  .print-section {
    margin: 10px 0;

    h3 {
      font-size: 12px;
      font-weight: bold;
      margin: 5px 0;
      text-transform: uppercase;
      border-bottom: 1px solid #000;
      padding-bottom: 2px;
    }

    p {
      margin: 3px 0;
      font-size: 11px;
    }

    .customer-name {
      font-weight: bold;
      font-size: 12px;
    }

    .order-type {
      font-weight: bold;
      margin-top: 5px;
    }

    .reference {
      font-style: italic;
      margin-top: 5px;
    }
  }

  // Lista de Itens
  .items-list {
    .item {
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 1px dotted #ccc;

      &:last-child {
        border-bottom: none;
      }

      .item-header {
        display: flex;
        justify-content: space-between;
        font-weight: bold;
        margin-bottom: 3px;

        .quantity {
          width: 30px;
        }

        .product-name {
          flex: 1;
          padding: 0 5px;
        }

        .price {
          white-space: nowrap;
        }
      }

      .adicionais {
        margin-left: 35px;
        font-size: 10px;

        .adicional {
          display: flex;
          justify-content: space-between;
          margin: 2px 0;

          .adicional-name {
            flex: 1;
          }

          .adicional-price {
            white-space: nowrap;
            margin-left: 10px;
          }
        }
      }

      .observation {
        margin-left: 35px;
        margin-top: 5px;
        font-size: 10px;
        font-style: italic;
      }
    }
  }

  // Totais
  .totals {
    .total-line {
      display: flex;
      justify-content: space-between;
      margin: 5px 0;
      font-size: 12px;

      &.total-final {
        font-size: 14px;
        margin-top: 8px;
        padding-top: 5px;
        border-top: 2px solid #000;
      }
    }
  }

  // Observações
  .observations {
    padding: 5px;
    border: 1px solid #000;
    font-style: italic;
    background: #f9f9f9;
  }

  .troco-calculado {
    font-weight: bold;
    margin-top: 3px;
  }

  // Rodapé
  .print-footer {
    text-align: center;
    margin-top: 15px;
    font-size: 10px;

    .timestamp {
      margin: 5px 0;
      font-style: italic;
    }

    .powered-by {
      margin-top: 10px;
      font-weight: bold;
    }
  }

  // Esconder elementos não necessários
  body * {
    visibility: hidden;
  }

  .print-container,
  .print-container * {
    visibility: visible;
  }

  .print-container {
    position: absolute;
    left: 0;
    top: 0;
  }
}

// Configurações de página
@page {
  size: 80mm auto; // Largura fixa, altura automática
  margin: 0;
}
```

---

### FASE 2: Criar Serviço de Impressão

#### 2.1. Criar Serviço

```bash
cd src/app/core/services
ng generate service print
```

#### 2.2. Implementar Serviço (`print.service.ts`)

```typescript
import { Injectable } from '@angular/core';
import { Order } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class PrintService {
  
  constructor() { }

  /**
   * Imprime um pedido
   */
  printOrder(pedido: Order, nomeRestaurante: string = 'ClimbDelivery'): void {
    // Criar conteúdo HTML para impressão
    const printContent = this.generatePrintHTML(pedido, nomeRestaurante);
    
    // Abrir janela de impressão
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      alert('Por favor, permita pop-ups para imprimir');
      return;
    }

    // Escrever HTML na janela
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Aguardar carregamento e imprimir
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      
      // Fechar janela após impressão (opcional)
      setTimeout(() => {
        printWindow.close();
      }, 500);
    };
  }

  /**
   * Gera HTML completo para impressão
   */
  private generatePrintHTML(pedido: Order, nomeRestaurante: string): string {
    const dataImpressao = new Date().toLocaleString('pt-BR');
    const dataPedido = new Date(pedido.createdAt).toLocaleString('pt-BR');
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Pedido #${pedido.numero}</title>
        <style>
          ${this.getStyles()}
        </style>
      </head>
      <body>
        <div class="print-container">
          ${this.generateHeader(pedido, nomeRestaurante, dataPedido)}
          <div class="divider"></div>
          ${this.generateClienteSection(pedido)}
          ${this.generateEnderecoSection(pedido)}
          <div class="divider"></div>
          ${this.generateItensSection(pedido)}
          <div class="divider"></div>
          ${this.generateTotaisSection(pedido)}
          <div class="divider"></div>
          ${this.generatePagamentoSection(pedido)}
          ${this.generateObservacoesSection(pedido)}
          <div class="divider"></div>
          ${this.generateFooter(pedido, dataImpressao)}
        </div>
      </body>
      </html>
    `;
  }

  private generateHeader(pedido: Order, nomeRestaurante: string, dataPedido: string): string {
    return `
      <div class="print-header">
        <h1>${nomeRestaurante}</h1>
        <h2>Pedido Nº ${pedido.numero}</h2>
        <p class="date">${dataPedido}</p>
      </div>
    `;
  }

  private generateClienteSection(pedido: Order): string {
    const cliente = pedido.cliente;
    if (!cliente) return '';

    const tipoIcon = pedido.tipoPedido === 'entrega' ? '🚚' : '📦';
    const tipoLabel = pedido.tipoPedido === 'entrega' ? 'ENTREGA' : 'RETIRADA';

    return `
      <div class="section">
        <h3>CLIENTE</h3>
        <p class="customer-name">${cliente.nome || 'Cliente'}</p>
        <p>Tel: ${this.formatPhone(cliente.telefone)}</p>
        <p class="order-type">${tipoIcon} ${tipoLabel}</p>
      </div>
    `;
  }

  private generateEnderecoSection(pedido: Order): string {
    if (pedido.tipoPedido !== 'entrega' || !pedido.cliente) return '';

    const cliente = pedido.cliente;
    let html = `
      <div class="section">
        <h3>ENDEREÇO DE ENTREGA</h3>
        <p>${cliente.logradouro}, ${cliente.numero}</p>
    `;

    if (cliente.complemento) {
      html += `<p>${cliente.complemento}</p>`;
    }

    html += `<p>${cliente.bairro} - ${cliente.cidade}/${cliente.uf}</p>`;

    if (cliente.cep) {
      html += `<p>CEP: ${this.formatCEP(cliente.cep)}</p>`;
    }

    if (cliente.referencia) {
      html += `<p class="reference"><strong>Ref:</strong> ${cliente.referencia}</p>`;
    }

    html += `</div>`;
    return html;
  }

  private generateItensSection(pedido: Order): string {
    let html = `
      <div class="section">
        <h3>ITENS DO PEDIDO</h3>
        <div class="items-list">
    `;

    pedido.itens?.forEach(item => {
      html += `
        <div class="item">
          <div class="item-header">
            <span class="quantity">${item.quantidade}x</span>
            <span class="product-name">${item.produto?.nome}</span>
            <span class="price">${this.formatCurrency(item.subtotal)}</span>
          </div>
      `;

      // Adicionais
      if (item.adicionais && item.adicionais.length > 0) {
        html += `<div class="adicionais">`;
        item.adicionais.forEach(adicional => {
          html += `
            <div class="adicional">
              <span>+ ${adicional.adicional?.nome} (${adicional.quantidade}x)</span>
              <span>${this.formatCurrency(adicional.preco)}</span>
            </div>
          `;
        });
        html += `</div>`;
      }

      // Observações
      if (item.observacoes) {
        html += `<p class="observation"><strong>Obs:</strong> ${item.observacoes}</p>`;
      }

      html += `</div>`;
    });

    html += `</div></div>`;
    return html;
  }

  private generateTotaisSection(pedido: Order): string {
    let html = `
      <div class="section totals">
        <div class="total-line">
          <span>Subtotal</span>
          <span>${this.formatCurrency(pedido.subtotal)}</span>
        </div>
    `;

    if (pedido.taxaEntrega > 0) {
      html += `
        <div class="total-line">
          <span>Taxa de Entrega</span>
          <span>${this.formatCurrency(pedido.taxaEntrega)}</span>
        </div>
      `;
    }

    html += `
        <div class="total-line total-final">
          <span><strong>TOTAL</strong></span>
          <span><strong>${this.formatCurrency(pedido.total)}</strong></span>
        </div>
      </div>
    `;

    return html;
  }

  private generatePagamentoSection(pedido: Order): string {
    const forma = this.getFormaPagamentoLabel(pedido.formaPagamento);
    
    let html = `
      <div class="section">
        <h3>PAGAMENTO</h3>
        <p><strong>${forma}</strong></p>
    `;

    if (pedido.trocoPara && pedido.trocoPara > 0) {
      const troco = pedido.trocoPara - pedido.total;
      html += `
        <p>Troco para: ${this.formatCurrency(pedido.trocoPara)}</p>
        <p class="troco-calculado">Troco: ${this.formatCurrency(troco)}</p>
      `;
    }

    html += `</div>`;
    return html;
  }

  private generateObservacoesSection(pedido: Order): string {
    if (!pedido.observacoes) return '';

    return `
      <div class="section">
        <h3>OBSERVAÇÕES</h3>
        <p class="observations">${pedido.observacoes}</p>
      </div>
    `;
  }

  private generateFooter(pedido: Order, dataImpressao: string): string {
    const status = pedido.status?.nome || 'pendente';
    
    return `
      <div class="print-footer">
        <p>Status: ${this.getStatusLabel(status)}</p>
        <p class="timestamp">Impresso em: ${dataImpressao}</p>
        <p class="powered-by">climbdelivery.app</p>
      </div>
    `;
  }

  private getStyles(): string {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: 'Courier New', monospace;
        font-size: 12px;
        color: #000;
      }

      .print-container {
        width: 80mm;
        padding: 10px;
        margin: 0 auto;
      }

      .print-header {
        text-align: center;
        margin-bottom: 10px;
      }

      .print-header h1 {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 5px;
        text-transform: uppercase;
      }

      .print-header h2 {
        font-size: 16px;
        margin: 5px 0;
      }

      .print-header .date {
        font-size: 10px;
      }

      .divider {
        border-top: 1px dashed #000;
        margin: 10px 0;
      }

      .section {
        margin: 10px 0;
      }

      .section h3 {
        font-size: 12px;
        font-weight: bold;
        margin-bottom: 5px;
        text-transform: uppercase;
        border-bottom: 1px solid #000;
        padding-bottom: 2px;
      }

      .section p {
        margin: 3px 0;
        font-size: 11px;
      }

      .customer-name {
        font-weight: bold !important;
        font-size: 12px !important;
      }

      .order-type {
        font-weight: bold;
        margin-top: 5px !important;
      }

      .reference {
        font-style: italic;
        margin-top: 5px !important;
      }

      .item {
        margin-bottom: 10px;
        padding-bottom: 5px;
        border-bottom: 1px dotted #ccc;
      }

      .item:last-child {
        border-bottom: none;
      }

      .item-header {
        display: flex;
        justify-content: space-between;
        font-weight: bold;
        margin-bottom: 3px;
      }

      .item-header .quantity {
        width: 30px;
      }

      .item-header .product-name {
        flex: 1;
        padding: 0 5px;
      }

      .item-header .price {
        white-space: nowrap;
      }

      .adicionais {
        margin-left: 35px;
        font-size: 10px;
      }

      .adicional {
        display: flex;
        justify-content: space-between;
        margin: 2px 0;
      }

      .observation {
        margin-left: 35px !important;
        margin-top: 5px !important;
        font-size: 10px !important;
        font-style: italic;
      }

      .totals .total-line {
        display: flex;
        justify-content: space-between;
        margin: 5px 0;
        font-size: 12px;
      }

      .totals .total-final {
        font-size: 14px;
        margin-top: 8px;
        padding-top: 5px;
        border-top: 2px solid #000;
      }

      .observations {
        padding: 5px;
        border: 1px solid #000;
        font-style: italic;
        background: #f9f9f9;
      }

      .troco-calculado {
        font-weight: bold;
        margin-top: 3px !important;
      }

      .print-footer {
        text-align: center;
        margin-top: 15px;
        font-size: 10px;
      }

      .print-footer .timestamp {
        margin: 5px 0;
        font-style: italic;
      }

      .print-footer .powered-by {
        margin-top: 10px;
        font-weight: bold;
      }

      @page {
        size: 80mm auto;
        margin: 0;
      }
    `;
  }

  // Helpers
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  private formatPhone(phone: string): string {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  }

  private formatCEP(cep: string): string {
    if (!cep) return '';
    const cleaned = cep.replace(/\D/g, '');
    if (cleaned.length === 8) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    }
    return cep;
  }

  private getFormaPagamentoLabel(forma: string): string {
    const formas: { [key: string]: string } = {
      'dinheiro': '💵 Dinheiro',
      'cartao': '💳 Cartão',
      'pix': '📱 PIX',
      'cartao_debito': '💳 Cartão de Débito',
      'cartao_credito': '💳 Cartão de Crédito'
    };
    return formas[forma] || forma.toUpperCase();
  }

  private getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pendente': 'EM ANÁLISE',
      'confirmado': 'CONFIRMADO',
      'em_preparo': 'EM PREPARO',
      'pronto': 'PRONTO',
      'em_entrega': 'EM ENTREGA',
      'entregue': 'ENTREGUE',
      'cancelado': 'CANCELADO'
    };
    return statusMap[status] || status.toUpperCase();
  }
}
```

---

### FASE 3: Integrar no Modal de Detalhes

#### 3.1. Atualizar Template (`modal-detalhes-pedido.component.html`)

Adicionar botão de impressão no header do modal:

```html
<!-- No header do modal, adicione: -->
<div class="modal-header-actions">
  <button 
    pButton 
    icon="pi pi-print" 
    label="Imprimir" 
    class="p-button-secondary"
    (click)="imprimirPedido()"
    [disabled]="!pedido">
  </button>
  <!-- outros botões... -->
</div>
```

#### 3.2. Atualizar Component (`modal-detalhes-pedido.component.ts`)

```typescript
import { PrintService } from '../../../../core/services/print.service';

export class ModalDetalhesPedidoComponent {
  // ... código existente ...

  constructor(
    private orderService: OrderService,
    private printService: PrintService // ← ADICIONAR
  ) {}

  /**
   * Imprime o pedido
   */
  imprimirPedido(): void {
    if (!this.pedido) {
      return;
    }

    // Buscar nome do restaurante (ajuste conforme seu context/service)
    const nomeRestaurante = this.pedido.empresa?.nomeFantasia || 'ClimbDelivery';

    // Chamar serviço de impressão
    this.printService.printOrder(this.pedido, nomeRestaurante);
  }
}
```

---

### FASE 4: Adicionar Impressão Automática (Opcional)

#### 4.1. Criar Configuração no Local Storage

```typescript
// src/app/core/services/settings.service.ts
export interface PrintSettings {
  autoPrint: boolean;
  printerName?: string;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly STORAGE_KEY = 'climb_print_settings';

  getPrintSettings(): PrintSettings {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return { autoPrint: false };
  }

  savePrintSettings(settings: PrintSettings): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
  }
}
```

#### 4.2. Implementar Auto-Print no OrderService

```typescript
// src/app/core/services/order.service.ts
constructor(
  private http: HttpClient,
  private printService: PrintService,
  private settingsService: SettingsService
) {
  // Escutar novos pedidos
  this.listenForNewOrders();
}

private listenForNewOrders(): void {
  // Assumindo que você tem um polling ou WebSocket
  this.newOrderSubject.subscribe(order => {
    const settings = this.settingsService.getPrintSettings();
    
    if (settings.autoPrint) {
      // Aguardar 1 segundo antes de imprimir
      setTimeout(() => {
        this.printService.printOrder(order, 'Seu Restaurante');
      }, 1000);
    }
  });
}
```

#### 4.3. Criar Tela de Configurações

Adicionar toggle nas configurações do sistema:

```html
<div class="config-section">
  <h3>Impressão de Pedidos</h3>
  <div class="field-checkbox">
    <p-checkbox 
      [(ngModel)]="autoPrint" 
      [binary]="true"
      inputId="autoPrint">
    </p-checkbox>
    <label for="autoPrint">Imprimir automaticamente novos pedidos</label>
  </div>
  <p class="help-text">
    Ao ativar, o sistema tentará imprimir automaticamente quando receber um novo pedido.
    Você precisará permitir pop-ups no navegador.
  </p>
</div>
```

---

## 📐 Layout do Comprovante

### Visualização do Resultado

```
========================================
        PIZZARIA BOM SABOR
========================================
Pedido Nº 00245
19/12/2025 - 20:30

----------------------------------------
CLIENTE
João Silva Santos
Tel: (11) 98765-4321
🚚 ENTREGA

ENDEREÇO DE ENTREGA
Rua das Flores, 123
Apto 45 - Bloco B
Centro - São Paulo/SP
CEP: 01234-567
Ref: Portão azul ao lado da padaria
----------------------------------------
ITENS DO PEDIDO

1x Pizza Margherita Grande      R$ 45,00
   + Borda recheada catupiry   R$  8,00
   + Azeitona extra            R$  3,00
   Obs: Massa fina

2x Coca-Cola 2L                 R$ 20,00

1x Batata Frita                 R$ 15,00
   Obs: Bem crocante

----------------------------------------
Subtotal......................R$ 91,00
Taxa de Entrega...............R$  5,00
========================================
TOTAL.........................R$ 96,00
========================================

PAGAMENTO
💵 Dinheiro
Troco para: R$ 100,00
Troco: R$ 4,00

OBSERVAÇÕES
Entregar no portão dos fundos
Tocar a campainha 2 vezes

----------------------------------------
Status: CONFIRMADO
Impresso em: 19/12/2025 - 20:31:15
climbdelivery.app
========================================
```

---

## ✅ Checklist de Implementação

### Frontend
- [ ] Criar componente `print-pedido`
- [ ] Criar serviço `print.service.ts`
- [ ] Adicionar botão "Imprimir" no modal de detalhes
- [ ] Testar impressão em impressora A4
- [ ] Testar impressão em impressora térmica (via driver)
- [ ] Implementar configuração de auto-print (opcional)
- [ ] Adicionar feedback visual ao imprimir
- [ ] Tratar erro quando pop-up é bloqueado

### Testes
- [ ] Testar impressão de pedido de entrega
- [ ] Testar impressão de pedido de retirada
- [ ] Testar pedido com adicionais
- [ ] Testar pedido com observações
- [ ] Testar pedido com troco
- [ ] Testar em diferentes navegadores (Chrome, Firefox, Edge)
- [ ] Testar em diferentes tamanhos de papel (A4, 80mm)
- [ ] Validar layout em impressora real

---

## 🚀 Evolução Futura - SOLUÇÃO 2

### Quando implementar a Solução 2?
- Volume de pedidos > 50/dia
- Feedback do cliente solicitando impressão automática
- Múltiplos pontos de impressão (cozinha, balcão, bar)
- Necessidade de impressão silenciosa

### Arquitetura da Solução 2

```
┌──────────────────────────────────────┐
│  Backend (NestJS)                    │
│                                      │
│  POST /api/pedidos                   │
│         │                            │
│         ▼                            │
│  Event: order.created                │
│         │                            │
│         ▼                            │
│  WebSocket Emit                      │
└─────────┬────────────────────────────┘
          │
          │ WebSocket
          ▼
┌──────────────────────────────────────┐
│  Agente Local (Node.js)              │
│  Rodando no PC do Restaurante        │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ WebSocket Client               │ │
│  │ - Autenticação                 │ │
│  │ - Reconexão automática         │ │
│  └──────────┬─────────────────────┘ │
│             │                        │
│             ▼                        │
│  ┌────────────────────────────────┐ │
│  │ Print Handler                  │ │
│  │ - Formata ESC/POS              │ │
│  │ - Envia para impressora        │ │
│  └──────────┬─────────────────────┘ │
└─────────────┼────────────────────────┘
              │
              ▼
      Impressora Térmica
```

### Estrutura do Agente Local

```
climb-print-agent/
├── package.json
├── .env.example
├── src/
│   ├── index.ts                 # Entry point
│   ├── config/
│   │   └── settings.ts          # Configurações
│   ├── services/
│   │   ├── websocket.service.ts # Conexão com backend
│   │   ├── printer.service.ts   # Gerencia impressora
│   │   └── formatter.service.ts # Formata pedido em ESC/POS
│   └── types/
│       └── order.types.ts       # Interfaces
└── build/
    └── index.js                 # Build para distribuição
```

### Bibliotecas Necessárias

```json
{
  "dependencies": {
    "socket.io-client": "^4.5.0",
    "node-thermal-printer": "^4.3.0",
    "dotenv": "^16.0.0",
    "winston": "^3.8.0"
  }
}
```

### Exemplo de Código do Agente

```typescript
// src/services/printer.service.ts
import { ThermalPrinter, PrinterTypes } from 'node-thermal-printer';

export class PrinterService {
  private printer: ThermalPrinter;

  constructor() {
    this.printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: process.env.PRINTER_INTERFACE || '/dev/usb/lp0',
      characterSet: 'BRAZIL',
      width: 48,
      removeSpecialCharacters: false
    });
  }

  async printOrder(order: any): Promise<void> {
    try {
      this.printer.alignCenter();
      this.printer.setTextSize(2, 2);
      this.printer.bold(true);
      this.printer.println(process.env.RESTAURANT_NAME || 'RESTAURANTE');
      this.printer.bold(false);
      this.printer.setTextSize(1, 1);
      this.printer.drawLine();
      
      // ... resto da formatação ...

      this.printer.cut();
      await this.printer.execute();
      
      console.log(`Pedido #${order.numero} impresso com sucesso`);
    } catch (error) {
      console.error('Erro ao imprimir:', error);
    }
  }
}
```

---

## 📞 Suporte e Documentação

### Troubleshooting

**Problema:** Pop-up bloqueado
- **Solução:** Instruir usuário a permitir pop-ups para o domínio

**Problema:** Layout quebrado
- **Solução:** Verificar CSS @media print e configuração @page

**Problema:** Impressora não imprime
- **Solução:** Verificar se impressora está definida como padrão

---

## 🎯 Recomendação Final

### Para MVP (Lançamento Imediato):
**✅ USAR SOLUÇÃO 1** - Impressão via Navegador

**Motivos:**
1. ✅ Implementação em 1-2 dias
2. ✅ Zero custo adicional
3. ✅ Funciona com qualquer impressora
4. ✅ Sem manutenção adicional
5. ✅ Resolve 80% dos casos de uso

### Para Fase 2 (3-6 meses):
**✅ MIGRAR PARA SOLUÇÃO 2** - Agente Local

**Quando:**
- Feedback dos clientes solicitar impressão automática
- Volume justificar investimento
- Ter recursos para suporte técnico

---

## 📊 Estimativa de Esforço

| Fase | Tarefa | Tempo Estimado |
|------|--------|----------------|
| 1 | Criar componente de impressão | 2h |
| 2 | Criar serviço de impressão | 3h |
| 3 | Integrar no modal | 1h |
| 4 | CSS e ajustes de layout | 2h |
| 5 | Testes em impressora real | 2h |
| 6 | Correções e refinamento | 2h |
| **TOTAL** | **Solução 1 Completa** | **12h (~2 dias)** |

---

**Status:** 📝 Aguardando implementação  
**Última atualização:** 13/03/2026  
**Versão:** 1.0  
